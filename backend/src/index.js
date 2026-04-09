import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import userAuthRoutes from './routes/user.routes.js';
import adminAuthRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import musicRoutes from './routes/music.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api/upload', uploadRoutes);
app.use('/api/music', musicRoutes);

// Static folders
app.use('/uploads', express.static(path.join(path.dirname(__dirname), 'uploads')));

// Test Route
app.get('/', (req, res) => {
  res.send('Poster Maker API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`\x1b[36m🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\x1b[0m`));
