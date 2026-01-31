# Deployment & Infrastructure Guide

## 1. Docker Configuration

### Backend Dockerfile

```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose for Development

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: moneysaver
      POSTGRES_PASSWORD: dev_password_change_in_prod
      POSTGRES_DB: moneysaver_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U moneysaver"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://moneysaver:dev_password_change_in_prod@postgres:5432/moneysaver_db
      MONGODB_URL: mongodb://admin:admin@mongodb:27017/moneysaver_analytics?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_secret_change_in_production
      JWT_REFRESH_SECRET: dev_refresh_secret_change_in_production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
    ports:
      - "3001:80"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
  mongo_data:
  redis_data:

networks:
  default:
    name: moneysaver-network
```

## 2. Kubernetes Deployment

### Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: moneysaver-backend
  namespace: moneysaver
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: moneysaver-backend
  template:
    metadata:
      labels:
        app: moneysaver-backend
        version: v1
    spec:
      serviceAccountName: moneysaver-backend
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
      
      containers:
      - name: backend
        image: moneysaver/backend:latest
        imagePullPolicy: Always
        
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: moneysaver-secrets
              key: database_url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: moneysaver-secrets
              key: redis_url
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: moneysaver-secrets
              key: mongodb_url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: moneysaver-secrets
              key: jwt_secret
        
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
              - ALL
        
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      
      volumes:
      - name: tmp
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: moneysaver-backend
  namespace: moneysaver
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: moneysaver-backend

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: moneysaver-backend-hpa
  namespace: moneysaver
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: moneysaver-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

### PostgreSQL StatefulSet

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: moneysaver
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp2
  resources:
    requests:
      storage: 100Gi

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: moneysaver
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: moneysaver_db
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U postgres
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U postgres
          initialDelaySeconds: 10
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: gp2
      resources:
        requests:
          storage: 100Gi
```

## 3. CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: 'backend/package-lock.json'
    
    - name: Install dependencies
      run: cd backend && npm ci
    
    - name: Run linter
      run: cd backend && npm run lint
    
    - name: Run tests
      run: cd backend && npm test -- --coverage
      env:
        DATABASE_URL: postgresql://postgres:test@localhost/test_db
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./backend/coverage/lcov.info

  test-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: 'frontend/package-lock.json'
    
    - name: Install dependencies
      run: cd frontend && npm ci
    
    - name: Run linter
      run: cd frontend && npm run lint
    
    - name: Type check
      run: cd frontend && npm run type-check
    
    - name: Run tests
      run: cd frontend && npm test -- --coverage
    
    - name: Build
      run: cd frontend && npm run build

  build-and-push:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - uses: docker/setup-buildx-action@v3
    
    - uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::ACCOUNT_ID:role/github-actions
        aws-region: ap-south-1
    
    - name: Update EKS cluster
      run: |
        aws eks update-kubeconfig --name moneysaver-cluster --region ap-south-1
        kubectl set image deployment/moneysaver-backend -n moneysaver \
          backend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
        kubectl rollout status deployment/moneysaver-backend -n moneysaver
```

## 4. Monitoring & Logging Stack

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'moneysaver-backend'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - moneysaver
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: moneysaver-backend
      - source_labels: [__meta_kubernetes_pod_ip]
        action: replace
        target_label: __address__
        replacement: $1:3000

alert_rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High error rate detected"
  
  - alert: DatabaseConnectionPoolExhausted
    expr: pg_connections > 90
    for: 5m
    annotations:
      summary: "Database connections nearly exhausted"
  
  - alert: APIResponseTimeHigh
    expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
    for: 5m
    annotations:
      summary: "API response time high"
```

### ELK Stack Setup

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
  namespace: moneysaver
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      enabled: true
      paths:
        - '/var/lib/docker/containers/*/*.log'
      processors:
        - add_kubernetes_metadata:
            in_cluster: true

    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
      username: "elastic"
      password: "${ELASTIC_PASSWORD}"

    logging.level: info
    logging.to_files: true
    logging.files:
      path: /var/log/filebeat
      name: filebeat
      keepfiles: 7
      permissions: 0644
```

## 5. Backup & Disaster Recovery

### PostgreSQL Backup Strategy

```bash
#!/bin/bash
# backup-postgresql.sh

BACKUP_DIR="/mnt/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/moneysaver_db_$TIMESTAMP.sql.gz"

# Full backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://moneysaver-backups/postgresql/

# Keep only last 30 days locally
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

### RTO/RPO Strategy

```
RTO (Recovery Time Objective): 15 minutes
RPO (Recovery Point Objective): 5 minutes

Backup Schedule:
- Hourly incremental backups (stored 7 days)
- Daily full backups (stored 30 days)
- Weekly backups (stored 90 days)
- Monthly backups (stored 1 year)

Disaster Recovery Procedure:
1. Detect failure (automated health check failure)
2. Trigger automatic failover (5 minutes)
3. Restore from latest backup (10 minutes)
4. Verify data integrity (0 minutes - parallel)
5. Resume service (15 minutes total)
```

## 6. Security Hardening

### Network Security

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: moneysaver-network-policy
  namespace: moneysaver
spec:
  podSelector:
    matchLabels:
      app: moneysaver-backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: nginx-ingress
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    - to:
        - podSelector:
            matchLabels:
              app: mongodb
      ports:
        - protocol: TCP
          port: 27017
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 53  # DNS
        - protocol: UDP
          port: 53
```

## 7. Performance Optimization

### CDN Configuration (CloudFront)

```
Distribution Settings:
- Origin: S3 bucket for static assets
- TTL: 1 year for versioned assets (index.js.v1.2.3)
- Compression: gzip, brotli
- Min TTL: 0 for index.html
- Default TTL: 86400 (1 day) for images
- Max TTL: 31536000 (1 year) for static assets
- Cache behaviors:
  - /api/* → API Gateway (no cache)
  - /health → API Gateway (no cache)
  - *.js, *.css, *.svg → Cache 1 year
  - *.png, *.jpg, *.webp → Cache 30 days
```

---

**Production Checklist:**
- [ ] All secrets configured in secure vault
- [ ] SSL/TLS certificates installed
- [ ] Database backups tested
- [ ] Load testing completed (100K concurrent users)
- [ ] Security audit passed
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Disaster recovery tested
