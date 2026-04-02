import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import helmet from 'helmet';
import startCronJobs from './services/cronService.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Security Middleware (Industry Grade)
app.use(helmet()); // Sets 11+ automated HTTP security headers (XSS Filter, HSTS, frame-ancestors, etc.)
// Removed express-mongo-sanitize: Native Express v5 compatibility bug identified with req.query getter.
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Stricter payload limits to prevent buffer exhaustion algorithms
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Daily Cron Behaviors
startCronJobs();

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Base route for easy health checking
app.get('/', (req, res) => {
  res.send('Complaint API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
