import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import paymentRoutes from './routes/paymentRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ MOCK DATA ============

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

const mockUsers: MockUser[] = [
  {
    id: '1',
    full_name: 'Demo User',
    email: 'demo@example.com',
    phone_number: '9876543210',
    password: 'password123',
  },
];

// ============ ROUTES ============

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Money Management App Backend',
    version: '1.0.0',
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'operational',
    message: 'Money Management App API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ============ AUTHENTICATION ENDPOINTS ============

// Register endpoint
app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { full_name, email, phone_number, password } = req.body;

  // Validation
  if (!full_name || !email || !phone_number || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user already exists
  const existingUser = mockUsers.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Create new user
  const newUser: MockUser = {
    id: Date.now().toString(),
    full_name,
    email,
    phone_number,
    password, // In production, hash this!
  };

  mockUsers.push(newUser);

  // Return user and mock token
  res.status(201).json({
    token: `mock_token_${newUser.id}`,
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      phone_number: newUser.phone_number,
    },
  });
});

// Login endpoint
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Find user
  const user = mockUsers.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Return user and mock token
  res.status(200).json({
    token: `mock_token_${user.id}`,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
    },
  });
});

// Verify OTP endpoint
app.post('/api/v1/auth/verify-otp', (req: Request, res: Response) => {
  const { phone_number, otp } = req.body;
  // Mock verification - in production, verify actual OTP
  res.status(200).json({ verified: true, message: 'OTP verified successfully' });
});

// Refresh token endpoint
app.post('/api/v1/auth/refresh-token', (req: Request, res: Response) => {
  const { token } = req.body;
  // Mock refresh - in production, verify and refresh token
  res.status(200).json({ token: `new_${token}` });
});

// ============ TRANSACTION ENDPOINTS ============

interface MockTransaction {
  id: number;
  type: 'debit' | 'credit';
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: MockTransaction[] = [
  { id: 1, type: 'debit', description: 'Grocery Shopping', amount: 2500, date: '2026-01-27', category: 'Food', status: 'completed' },
  { id: 2, type: 'credit', description: 'Salary Credited', amount: 50000, date: '2026-01-25', category: 'Income', status: 'completed' },
];

app.get('/api/v1/transactions', (req: Request, res: Response) => {
  res.status(200).json({
    data: mockTransactions,
    total: mockTransactions.length,
  });
});

app.post('/api/v1/transactions', (req: Request, res: Response) => {
  const { description, amount, category, type } = req.body;
  const newTransaction: MockTransaction = {
    id: mockTransactions.length + 1,
    description,
    amount,
    category,
    type,
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
  };
  mockTransactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

app.get('/api/v1/transactions/:id', (req: Request, res: Response) => {
  const transaction = mockTransactions.find((t) => t.id === parseInt(req.params.id));
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.status(200).json(transaction);
});

// ============ UPI PAYMENT ENDPOINTS ============

interface MockPayment {
  id: string;
  upi_id: string;
  recipient_name: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

const mockPayments: MockPayment[] = [];

// Mount payment routes with proper error handling
app.use('/api/v1/upi', paymentRoutes);

// ============ BUDGET ENDPOINTS ============

interface MockBudget {
  id: number;
  name: string;
  limit: number;
  spent: number;
  category: string;
}

const mockBudgets: MockBudget[] = [
  { id: 1, name: 'Food & Dining', limit: 10000, spent: 7500, category: 'Food' },
  { id: 2, name: 'Transportation', limit: 5000, spent: 3200, category: 'Transport' },
];

app.get('/api/v1/budgets', (req: Request, res: Response) => {
  res.status(200).json({ data: mockBudgets, total: mockBudgets.length });
});

app.post('/api/v1/budgets', (req: Request, res: Response) => {
  const { name, limit, category } = req.body;
  const newBudget: MockBudget = {
    id: mockBudgets.length + 1,
    name,
    limit,
    category,
    spent: 0,
  };
  mockBudgets.push(newBudget);
  res.status(201).json(newBudget);
});

// ============ PLACEHOLDER ROUTES ============

app.get('/api/v1/auth/test', (req: Request, res: Response) => {
  res.json({
    message: 'Auth service is operational',
    endpoints: [
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/verify-otp',
      'POST /api/v1/auth/refresh-token',
    ],
  });
});

app.get('/api/v1/transactions/test', (req: Request, res: Response) => {
  res.json({
    message: 'Transaction service is operational',
    endpoints: [
      'GET /api/v1/transactions',
      'POST /api/v1/transactions',
      'GET /api/v1/transactions/:id',
    ],
  });
});

app.get('/api/v1/upi/test', (req: Request, res: Response) => {
  res.json({
    message: 'UPI service is operational',
    endpoints: [
      'POST /api/v1/upi/initiate-payment',
      'POST /api/v1/upi/verify-payment',
      'GET /api/v1/upi/mandates',
    ],
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
});

// ============ SERVER START ============

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║  💰 Money Management App Backend                 ║
║  ✅ Server running on port ${PORT}                ║
║  🔗 URL: http://localhost:${PORT}                ║
║  📚 API Docs: http://localhost:${PORT}/api-docs  ║
║  🏥 Health: http://localhost:${PORT}/health      ║
╚══════════════════════════════════════════════════╝
  `);

  console.log('\n📋 Available Endpoints:');
  console.log('  ✅ POST   /api/v1/auth/register');
  console.log('  ✅ POST   /api/v1/auth/login');
  console.log('  ✅ GET    /api/v1/transactions');
  console.log('  ✅ POST   /api/v1/transactions');
  console.log('  ✅ POST   /api/v1/upi/initiate-payment');
  console.log('  ✅ GET    /api/v1/budgets');
  console.log('  ✅ POST   /api/v1/budgets');
  console.log(`\n📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔐 CORS enabled for frontend on:', corsOptions.origin);
});

export default app;
