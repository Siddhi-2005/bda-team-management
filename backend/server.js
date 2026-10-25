const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Standard Middlewares
const localOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
const vercelOriginRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const clientUrl = process.env.CLIENT_URL;
    if (
      localOrigins.includes(origin) ||
      vercelOriginRegex.test(origin) ||
      (clientUrl && origin === clientUrl)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
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

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BDA Team Management System API' });
});

// One-time setup endpoint — seeds the database with demo users & realistic data.
// Requires process.env.SETUP_KEY and refuses to run if any user already exists.
app.post('/api/setup', async (req, res) => {
  try {
    const { setupKey } = req.body;
    if (!process.env.SETUP_KEY) {
      return res.status(403).json({ success: false, message: 'Setup endpoint disabled: SETUP_KEY is not configured.' });
    }
    if (setupKey !== process.env.SETUP_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid setup key' });
    }
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({ success: false, message: 'Setup refused: database already has users.' });
    }
    const seedDatabase = require('./utils/seeder');
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded with demo data.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

module.exports = app;
