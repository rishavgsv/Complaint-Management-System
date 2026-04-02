import express from 'express';
import { authUser, registerUser } from '../controllers/authController.js';
import { protect, adminCheck } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', protect, adminCheck, registerUser); // Only admin can register new authorities

export default router;
