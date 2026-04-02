import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, adminCheck, workerCheck } from '../middleware/authMiddleware.js';
import {
  createComplaint,
  getComplaintById,
  getComplaints,
  getAssignedComplaints,
  updateComplaintStatus,
  markWorkDone,
  verifyComplaint,
  addComment,
  assignComplaint,
  submitFeedback,
  reopenComplaint,
  getWorkerStats,
} from '../controllers/complaintController.js';
import upload from '../services/uploadService.js';

const router = express.Router();
const isTestOrDev = process.env.NODE_ENV !== 'production';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestOrDev ? 1000 : 100,
  message: { message: 'Too many requests, please try again after 15 minutes' }
});

const complaintSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTestOrDev ? 100 : 5,
  message: { message: 'You can only submit 5 complaints per hour.' }
});

router.use(apiLimiter);

// ─── PUBLIC ─────────────────────────────────────────────
router.post('/',    complaintSubmissionLimiter, upload.single('image'), createComplaint);
router.get('/:id',  getComplaintById);
router.put('/:id/feedback', submitFeedback);       // Student rates after Completed
router.post('/:id/reopen',  reopenComplaint);      // Student reopens Completed complaint

// ─── ADMIN ──────────────────────────────────────────────
router.get('/admin/all',          protect, adminCheck, getComplaints);
router.get('/admin/worker-stats', protect, adminCheck, getWorkerStats);
router.put('/:id/assign',         protect, adminCheck, assignComplaint);
router.put('/:id/verify',         protect, adminCheck, verifyComplaint);

// ─── WORKER ─────────────────────────────────────────────
router.get('/worker/assigned',    protect, workerCheck, getAssignedComplaints);
router.put('/:id/status',         protect, updateComplaintStatus);
router.post('/:id/work-done',     protect, workerCheck, upload.single('completionImage'), markWorkDone);

// ─── SHARED ─────────────────────────────────────────────
router.post('/:id/comment', protect, addComment);

export default router;
