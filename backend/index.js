import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import userAuthRoutes from './src/routes/user.routes.js';
import adminAuthRoutes from './src/routes/admin.routes.js';
import authRoutes from './src/routes/auth.routes.js';

// Load environmental variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/user', userAuthRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Poster Maker API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`\x1b[36m🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\x1b[0m`));
