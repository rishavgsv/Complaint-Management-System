// SAME IMPORTS (WhatsApp removed)
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { generateComplaintId } from '../services/idGeneratorService.js';
import { sendEmail } from '../services/emailService.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ===== UTIL =====
const compressAndSaveImage = async (buffer, prefix) => {
  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E6)}.webp`;
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  await sharp(buffer)
    .resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(uploadsDir, filename));

  return `/uploads/${filename}`;
};

const pushHistory = (complaint, status, changedBy = 'System') => {
  complaint.statusHistory.push({ status, changedBy, changedAt: new Date() });
};

// ================= CREATE =================
export const createComplaint = async (req, res) => {
  try {
    const { name, enrollmentNumber, email, phone, category, details, description, priority } = req.body;

    let parsedDetails = details;
    if (typeof details === 'string') {
      try { parsedDetails = JSON.parse(details); } catch { parsedDetails = {}; }
    }

    const complaintId = await generateComplaintId();

    let imageUrl = '';
    if (req.file?.buffer) {
      const safeId = (enrollmentNumber || 'guest').replace(/[^a-zA-Z0-9]/g, '');
      imageUrl = await compressAndSaveImage(req.file.buffer, safeId);
    }

    const assignedWorker = await User.findOne({ role: 'Worker', department: category });

    const complaint = await Complaint.create({
      complaintId,
      name,
      enrollmentNumber,
      email,
      phone,
      category,
      priority: priority || 'Medium',
      details: parsedDetails,
      description,
      image: imageUrl,
      assignedTo: assignedWorker?._id || null,
      statusHistory: [{ status: 'Pending', changedBy: 'Student', changedAt: new Date() }],
    });

    // ✅ FAST RESPONSE
    res.status(201).json({
      success: true,
      complaintId: complaint.complaintId,
      message: 'Complaint submitted successfully'
    });

    // ===== EMAILS (ASYNC) =====
    sendEmail(email, 'Complaint Submitted ✅',
      `Your complaint ${complaint.complaintId} has been submitted.`
    ).catch(err => console.error("Student email error:", err));

    if (assignedWorker) {
      sendEmail(assignedWorker.email,
        `New ${category} Complaint: ${complaintId}`,
        `Complaint assigned. ID: ${complaintId}`
      ).catch(err => console.error("Worker email error:", err));
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ================= TRACK =================
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id })
      .populate('assignedTo', 'name department')
      .populate('comments.user', 'name role');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FEEDBACK =================
export const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id });

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.status !== 'Completed') return res.status(400).json({ message: 'Only after completion' });

    complaint.rating = rating;
    complaint.feedback = feedback;
    await complaint.save();

    res.json({ message: 'Feedback submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REOPEN =================
export const reopenComplaint = async (req, res) => {
  try {
    const original = await Complaint.findOne({ complaintId: req.params.id });
    if (!original) return res.status(404).json({ message: 'Complaint not found' });

    const newId = await generateComplaintId();

    const newComplaint = await Complaint.create({
      complaintId: newId,
      name: original.name,
      email: original.email,
      category: original.category,
      description: req.body.reason,
      statusHistory: [{ status: 'Pending', changedBy: 'Student' }],
    });

    // response fast
    res.json({ newComplaintId: newId });

    // async email
    sendEmail(original.email, `Complaint Reopened — ${newId}`,
      `Your complaint has been reopened.`
    ).catch(console.error);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN =================
// (NO CHANGE — only replace await sendEmail with async)

export const verifyComplaint = async (req, res) => {
  try {
    const { action } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('assignedTo', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (action === 'approve') {
      complaint.status = 'Completed';
      pushHistory(complaint, 'Completed', req.user.name);
      await complaint.save();

      sendEmail(complaint.email,
        `Resolved — ${complaint.complaintId}`,
        `Your complaint is resolved`
      ).catch(console.error);

      return res.json({ message: 'Completed' });
    }

    res.json({ message: 'Updated' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};