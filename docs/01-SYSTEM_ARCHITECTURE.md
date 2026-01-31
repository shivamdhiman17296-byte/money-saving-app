# Indian Money Management App - System Architecture

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Multi-Platform)                 │
├──────────────┬────────────────────┬────────────────────┬─────────────┤
│  React Web   │  React Native      │  Flutter (iOS)     │  Flutter    │
│  (Tablet)    │  (Android)         │  (Future)          │  (Android)  │
└──────────┬───┴────────────────────┴────────────────────┴──────────┬──┘
           │                                                        │
           │  HTTPS/WSS + TLS 1.3                                 │
           │                                                        │
┌──────────▼────────────────────────────────────────────────────────▼──┐
│                       API GATEWAY (Kong/AWS API GW)                   │
│  - Rate limiting                                                       │
│  - Request validation                                                  │
│  - Authentication check                                                │
│  - Load balancing                                                      │
│  - CORS handling                                                       │
└──────────┬────────────────────────────────────────────────────────────┘
           │
       ┌───┴──────────────────────────────────────────┬──────────────┐
       │                                              │              │
┌──────▼──────────────┐  ┌────────────────────┐  ┌──▼──────────┐  │
│   AUTH SERVICE      │  │   UPI SERVICE      │  │  KAFKA      │  │
│ - JWT + OAuth2      │  │ - NPCI Integration │  │  (Events)   │  │
│ - OTP/Biometric     │  │ - QR Code Gen      │  │             │  │
│ - Device Binding    │  │ - Mandate Mgmt     │  └─────────────┘  │
└────────┬────────────┘  │ - Tokenization     │                   │
         │               └────────┬────────────┘                   │
         │                        │                                │
┌────────▼──────────────┐  ┌──────▼──────────────┐  ┌───────────┐│
│ TRANSACTION SERVICE   │  │ ANALYTICS SERVICE   │  │   AI/ML   ││
│ - CRUD operations     │  │ - Expense tracking  │  │  SERVICE  ││
│ - Bank sync           │  │ - Insights gen      │  │ - Anomaly ││
│ - Recurring expenses  │  │ - Budget alerts     │  │ - Forecast││
└────────┬──────────────┘  └──────┬──────────────┘  └──────┬─────┤
         │                        │                        │      │
┌────────▼──────────────────────────▼────────────────────▼──────┐│
│                    DATA LAYER (Microservices)                 ││
├──────────────────────────────────────────────────────────────┤│
│ PostgreSQL (Primary)                                          ││
│ - Users, Accounts, Transactions, Budgets                     ││
│ - Banks, UPI credentials (encrypted)                         ││
│                                                               ││
│ MongoDB (Analytics)                                           ││
│ - Transaction logs, User events, Audit trails                ││
│                                                               ││
│ Redis (Cache + Sessions)                                     ││
│ - User sessions, OTP storage, Rate limits                    ││
│ - Recent transactions, Budget cache                          ││
│                                                               ││
│ Elasticsearch (Search & Logs)                                ││
│ - Transaction search, Application logs                       ││
└────────────────────────────────────────────────────────────┬──┘│
                                                              │   │
                    ┌───────────────────────────────────────┤   │
                    │                                       │   │
        ┌───────────▼──────────────┬──────────────────┬────▼──┐ │
        │                          │                  │       │ │
     ┌──▼────────────────┐  ┌──────▼──────────────┐  │ AWS S3│ │
     │ NPCI UPI Gateway  │  │ Bank API Gateway    │  │ (CDN) │ │
     │ (SANDBOX/PROD)    │  │ (RBI Licensed)      │  └───────┘ │
     └───────────────────┘  └─────────────────────┘            │
                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Microservices Breakdown

### 2.1 Service Catalog

| Service | Port | Purpose | Tech |
|---------|------|---------|------|
| **API Gateway** | 3000 | Central entry point | Kong / Express |
| **Auth Service** | 3001 | Authentication & token mgmt | Node.js + Passport |
| **User Service** | 3002 | User profile & management | Node.js + TypeORM |
| **UPI Service** | 3003 | UPI operations | Node.js + NPCI SDK |
| **Transaction Service** | 3004 | Payments & tracking | Node.js + Bull |
| **Account Service** | 3005 | Bank linking & sync | Node.js + Job Queue |
| **Budget Service** | 3006 | Budget & alerts | Node.js + Cron |
| **Analytics Service** | 3007 | Insights & reporting | Python + FastAPI |
| **Notification Service** | 3008 | SMS/Push/Email | Node.js + Socket.io |

### 2.2 Communication Patterns

```
SYNCHRONOUS:
Auth Service ←→ User Service (verify user)
Transaction Service ←→ UPI Service (process payment)

ASYNCHRONOUS (Kafka):
Transaction → Notifications (send receipt)
Transaction → Analytics (log for insights)
UPI Payment → Audit Log → Elasticsearch
Budget Alert → Notification Queue
```

## 3. Data Flow Architecture

### UPI Payment Flow
```
User Initiates Payment
    ↓
[Auth Service] - Verify JWT + Biometric
    ↓
[UPI Service] - Create UPI request
    ↓
[NPCI Gateway] - Route to bank
    ↓
Bank Processes Payment
    ↓
NPCI Callback → [UPI Service]
    ↓
[Transaction Service] - Save to PostgreSQL
    ↓
[Kafka Event] - "payment.completed"
    ↓
├→ [Notification Service] - Send receipt
├→ [Analytics Service] - Log for insights
├→ [Budget Service] - Update budget
└→ [Audit Logger] - Log to MongoDB

User sees "Success" notification (Real-time via WebSocket)
```

### Transaction Sync Flow
```
Scheduled Job (6 AM, 12 PM, 6 PM Daily)
    ↓
[Account Service] - Check linked banks
    ↓
For Each Bank:
    [Bank API Gateway] (RBI Licensed)
        ↓
    Fetch last 30 days transactions
        ↓
    [Transaction Service] - Reconcile
        ↓
    Save new transactions → PostgreSQL
        ↓
    [Analytics] - Categorize & detect patterns
        ↓
    Alert if unusual spending detected
```

## 4. Technology Stack Details

### Backend Stack
```
Node.js 20+ LTS
├─ Express.js / Fastify (API server)
├─ TypeORM (Database ORM)
├─ Passport.js (Authentication)
├─ Bull (Job queue)
├─ Socket.io (Real-time updates)
├─ Helmet (Security headers)
├─ Joi/Zod (Validation)
└─ Winston (Logging)

Python (Analytics)
├─ FastAPI (ML service)
├─ Pandas (Data processing)
├─ Scikit-learn (ML models)
└─ SQLAlchemy (ORM)
```

### Frontend Stack
```
React 18+
├─ TypeScript
├─ Redux Toolkit (State)
├─ React Query (API caching)
├─ Tailwind CSS (Styling)
├─ Framer Motion (Animations)
├─ Zod (Form validation)
├─ Socket.io Client (Real-time)
└─ Chart.js / Recharts (Visualizations)

React Native (Mobile - Future)
├─ Expo / RN CLI
├─ React Navigation
├─ Native Device APIs
└─ Reanimated (Smooth animations)
```

### Infrastructure
```
AWS / GCP (Mumbai region)
├─ EC2 / GKE (Kubernetes clusters)
├─ RDS PostgreSQL (Multi-AZ)
├─ DocumentDB / MongoDB Atlas
├─ ElastiCache Redis
├─ MSK Kafka (Event streaming)
├─ S3 (Static assets + backups)
├─ CloudFront / Cloud CDN
├─ CloudWatch / Stack Driver (Monitoring)
├─ Secrets Manager (Key management)
└─ VPC / Private networking

Kubernetes:
├─ EKS / GKE cluster
├─ Auto-scaling (HPA)
├─ Service mesh (Istio - optional)
├─ Ingress controller (NGINX)
└─ Persistent volumes (EBS / PD)
```

## 5. Security Architecture

### Defense in Depth

```
LAYER 1: Transport Security
├─ TLS 1.3 for all connections
├─ Certificate pinning (Mobile)
└─ HSTS headers

LAYER 2: API Gateway
├─ Rate limiting (per user, per IP)
├─ Request validation
├─ WAF (AWS WAF)
├─ DDoS protection (AWS Shield)
└─ Request signing (HMAC-SHA256)

LAYER 3: Authentication
├─ OAuth 2.0 / OpenID Connect
├─ JWT with RS256 signing
├─ Device binding + fingerprinting
├─ Biometric validation (Face/Touch ID)
└─ OTP for sensitive operations

LAYER 4: Data Protection
├─ Field-level encryption (AES-256)
├─ Tokenization of UPI data
├─ Database encryption at rest (KMS)
├─ Secure key rotation (90 days)
└─ Encrypted backups

LAYER 5: Application
├─ Input validation (Zod/Joi)
├─ SQL injection prevention (Parameterized queries)
├─ XSS prevention (Content-Security-Policy)
├─ CSRF tokens
└─ Audit logging (MongoDB)

LAYER 6: Infrastructure
├─ Private subnets
├─ Security groups / Network policies
├─ VPN for admin access
├─ Bastion hosts
└─ Regular penetration testing
```

## 6. Scalability Strategy

### Horizontal Scaling

```
Load Balancer (AWS ALB)
    ↓
    ├─ API Gateway Cluster (3-5 instances)
    │   └─ Auto-scale based on CPU/Memory
    │
    ├─ Auth Service Cluster (2-3 instances)
    │   └─ Stateless design
    │
    ├─ UPI Service Cluster (5+ instances)
    │   └─ Critical path - auto-scale aggressively
    │
    └─ Transaction Service Cluster (3-5 instances)
        └─ Queue-based processing
```

### Database Scaling

```
PostgreSQL:
├─ Read replicas (3+) for analytics
├─ Connection pooling (PgBouncer)
├─ Sharding by user_id (future)
└─ Archival of old data (>2 years)

MongoDB:
├─ Replica set (3 nodes)
├─ Sharding by user_id
└─ TTL indexes for auto-cleanup

Redis:
├─ Cluster mode (3 primary + 3 replica)
├─ Automatic failover
└─ AOF persistence
```

### Caching Strategy

```
Layer 1: Redis (In-memory cache)
├─ User profile (5 min TTL)
├─ Recent transactions (1 min)
├─ Budget data (10 min)
└─ OTP/Sessions (exact expiry)

Layer 2: Application level
├─ React Query cache (5-30 min)
├─ Browser localStorage
└─ Service worker (offline support)

Layer 3: CDN
├─ Static assets (JS, CSS, images)
├─ Icons & avatars
└─ Cache validity: 1 year (versioned)
```

## 7. Monitoring & Observability

### Key Metrics

```
Performance:
├─ API response time (p50, p95, p99)
├─ UPI transaction latency
├─ Database query performance
└─ Frontend load time (LCP, FID, CLS)

Reliability:
├─ Error rate (4xx, 5xx)
├─ Service availability (uptime %)
├─ Transaction success rate
└─ Failed job queue depth

Business:
├─ Daily active users (DAU)
├─ Monthly transaction volume
├─ Average transaction value
├─ Budget adherence rate
└─ Feature adoption metrics

Infrastructure:
├─ CPU, Memory, Disk usage
├─ Network I/O
├─ Pod restart rates
└─ Database connections
```

### Observability Stack

```
Prometheus (Metrics)
    ↓
Grafana (Visualization)

ELK Stack (Logs)
├─ Elasticsearch
├─ Logstash
└─ Kibana

Jaeger (Distributed Tracing)
    ↓
    Trace service calls across microservices
```

## 8. Compliance & Data Governance

### India-Specific Compliance

```
RBI Requirements:
├─ Mobile Banking Guidelines
├─ Payment Systems Regulation
└─ Card Networks Policy

NPCI UPI Standards:
├─ UPI Specifications v2.1
├─ Tokenization guidelines
└─ Mandate framework

Data Localization:
├─ All data stored in India
├─ Backups in India only
├─ No international transfers without consent
└─ PII encryption mandatory

Privacy (DPDP Act - India equivalent of GDPR):
├─ User consent for data processing
├─ Right to erasure
├─ Data portability
├─ Breach notification (72 hours)
└─ Privacy by design

KYC/AML:
├─ Aadhar verification
├─ PAN validation
├─ Transaction monitoring
└─ Suspicious activity reporting
```

## 9. High Availability & Disaster Recovery

### RTO/RPO Targets

```
RTO (Recovery Time Objective): 15 minutes
RPO (Recovery Point Objective): 5 minutes
```

### DR Strategy

```
Active-Active setup (Multi-region within India)
├─ Primary: AWS Mumbai
├─ Secondary: GCP Bangalore
│
├─ Database: Cross-region replication (5 sec lag)
├─ Redis: Multi-region cluster
├─ Kafka: Replication factor 3
│
└─ Automated failover:
    ├─ Health checks every 10 sec
    ├─ Automatic DNS failover
    └─ Alert to ops team
```

## 10. Cost Optimization

```
Infrastructure Cost (~$50K-100K/month at scale):
├─ Compute: 40%
│   ├─ Reserved instances (1-year commitment)
│   └─ Spot instances for non-critical jobs
├─ Database: 30%
│   └─ Multi-AZ with read replicas
├─ Storage: 15%
│   └─ S3 + Glacier for archives
├─ Network: 10%
│   └─ CDN caching
└─ Other: 5%
    ├─ Monitoring
    └─ Tools

Optimization Strategies:
├─ Data compression
├─ Archive old data
├─ Lambda for scheduled jobs
├─ Container optimization
└─ Reserved capacity planning
```

## 11. API Versioning Strategy

```
/api/v1/ (Current)
├─ Stable, production endpoints
├─ Backward compatible for 6 months
└─ Deprecation headers added

/api/v2/ (Beta - next generation)
├─ New features first
├─ Breaking changes allowed
└─ Gradual rollout (canary)

Migration Path:
└─ 6-month overlap
└─ Clear migration guide
└─ Auto-migration tools
```

---

**Next Document:** Database schema design
