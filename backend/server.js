const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedDatabase = require('./utils/seeder');

// Load environment variables
dotenv.config();

const app = express();

// Standard Middlewares
// 1. Define your allowed development origins
const localOrigins = ['http://localhost:5173', 'http://localhost:3000'];
// 2. Define a regex pattern to match any Vercel deployment for this project
const vercelOriginRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Check if the incoming request origin matches local dev or your Vercel setup
    if (!origin || localOrigins.includes(origin) || vercelOriginRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS matching policy'));
    }
  },
  credentials: true
}));

app.use(express.json());

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}
// Import Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');
const leadRoutes = require('./routes/leads');
const dashboardRoutes = require('./routes/dashboard');
const publicRoutes = require('./routes/public');
const aiRoutes = require('./routes/ai');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);

// Database Seeder Route
app.get('/api/seed', async (req, res, next) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully with sample data!' });
  } catch (error) {
    next(error);
  }
});

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BDA Team Management System API' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
