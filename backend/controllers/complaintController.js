import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { generateComplaintId } from '../services/idGeneratorService.js';
import { sendEmail } from '../services/emailService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Utility: compress RAM buffer → WebP on disk, return URL
const compressAndSaveImage = async (buffer, prefix) => {
  const filename   = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E6)}.webp`;
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  await sharp(buffer)
    .resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(path.join(uploadsDir, filename));
  return `/uploads/${filename}`;
};

// Utility: push a status-history entry
const pushHistory = (complaint, status, changedBy = 'System') => {
  complaint.statusHistory.push({ status, changedBy, changedAt: new Date() });
};

// ─── PUBLIC ────────────────────────────────────────────────────────────────

// Create Complaint + auto-assign to matching Worker
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

    // Auto-assign: find Worker whose department matches
    const assignedWorker = await User.findOne({ role: 'Worker', department: category });

    const complaint = await Complaint.create({
      complaintId, name, enrollmentNumber, email, phone, category,
      priority: priority || 'Medium',
      details: parsedDetails, description, image: imageUrl,
      assignedTo: assignedWorker?._id || null,
      statusHistory: [{ status: 'Pending', changedBy: 'Student', changedAt: new Date() }],
    });

    // ── Email notifications ──
    await sendEmail(email, 'Complaint Submitted ✅',
      `<p>Dear <b>${name}</b>, your complaint <b>${complaint.complaintId}</b> has been successfully submitted and assigned to our ${category} team.</p>
       <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
         <h3 style="margin-top: 0; color: #1f2937;">Complaint Details</h3>
         <ul style="list-style-type: none; padding-left: 0; color: #4b5563; line-height: 1.6;">
           <li><b>Tracking ID:</b> ${complaint.complaintId}</li>
           <li><b>Enrollment No:</b> ${enrollmentNumber}</li>
           <li><b>Category:</b> ${category}</li>
           <li><b>Priority:</b> ${complaint.priority}</li>
           <li><b>Location:</b> ${parsedDetails?.location || 'N/A'}</li>
           <li><b>Specific Issue:</b> ${parsedDetails?.issueType || 'None specified'}</li>
           <li><b>Description:</b> ${description}</li>
         </ul>
       </div>
       <p>Track your complaint status anytime using your Tracking ID on the student portal.</p>`
    );
    if (assignedWorker) {
      await sendEmail(assignedWorker.email, `New ${category} Complaint: ${complaintId}`,
        `<p>A new complaint has been assigned to you.<br><b>ID:</b> ${complaintId}<br><b>Priority:</b> ${complaint.priority}<br><b>Location:</b> ${parsedDetails?.location || 'N/A'}<br><b>Description:</b> ${description}</p>`
      );
    }

    // ── WhatsApp notifications ──
    await sendWhatsAppMessage(phone,
      `✅ Complaint Submitted!\nID: ${complaintId}\nPriority: ${complaint.priority}\nCategory: ${category}\nTrack status at any time using your ID.`
    );
    if (assignedWorker?.phone) {
      await sendWhatsAppMessage(assignedWorker.phone,
        `🔔 New complaint assigned!\nID: ${complaintId}\nPriority: ${complaint.priority}\nCategory: ${category}\nLocation: ${parsedDetails?.location || 'N/A'}`
      );
    }

    res.status(201).json({ success: true, complaintId: complaint.complaintId, message: 'Complaint submitted and assigned successfully' });
  } catch (error) {
    console.log(error.stack); res.status(500).json({ message: String(error.stack) });
  }
};

// Track Complaint by public ID
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

// Student feedback (public — requires complaintId match)
export const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.status !== 'Completed') return res.status(400).json({ message: 'Feedback can only be given after completion' });
    if (complaint.rating) return res.status(400).json({ message: 'Feedback already submitted' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1–5' });
    complaint.rating  = rating;
    complaint.feedback = feedback || '';
    await complaint.save();
    res.json({ message: 'Feedback submitted. Thank you!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student reopen (public)
export const reopenComplaint = async (req, res) => {
  try {
    const original = await Complaint.findOne({ complaintId: req.params.id });
    if (!original) return res.status(404).json({ message: 'Complaint not found' });
    if (original.status !== 'Completed') return res.status(400).json({ message: 'Only completed complaints can be reopened' });
    if (original.isReopened) return res.status(400).json({ message: 'This complaint has already been reopened' });

    const newId = await generateComplaintId();
    const assignedWorker = await User.findOne({ role: 'Worker', department: original.category });

    const newComplaint = await Complaint.create({
      complaintId:       newId,
      name:              original.name,
      enrollmentNumber:  original.enrollmentNumber,
      email:             original.email,
      phone:             original.phone,
      category:          original.category,
      priority:          'High',   // reopen treated as high priority
      details:           original.details,
      description:       `[REOPENED from ${original.complaintId}] ${req.body.reason || original.description}`,
      image:             original.image,
      assignedTo:        assignedWorker?._id || null,
      parentComplaintId: original.complaintId,
      isReopened:        false,
      statusHistory:     [{ status: 'Pending', changedBy: 'Student (Reopen)', changedAt: new Date() }],
    });

    // Mark original as reopened
    original.isReopened = true;
    await original.save();

    // Notify
    await sendEmail(original.email, `Complaint Reopened — ${newId}`,
      `<p>Your complaint <b>${original.complaintId}</b> has been reopened as <b>${newId}</b>. Our team will address it with high priority.</p>`
    );
    await sendWhatsAppMessage(original.phone,
      `🔁 Complaint Reopened!\nNew ID: ${newId}\nWe'll address this with high priority.`
    );

    res.status(201).json({ success: true, newComplaintId: newId, message: 'Complaint reopened successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN ─────────────────────────────────────────────────────────────────

// Get all complaints with pagination + search + filters
export const getComplaints = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)   || 1;
    const limit    = parseInt(req.query.limit)  || 20;
    const search   = req.query.search   || '';
    const status   = req.query.status   || '';
    const category = req.query.category || '';
    const priority = req.query.priority || '';

    const query = {};
    if (status)   query.status   = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { complaintId:      { $regex: search, $options: 'i' } },
        { name:             { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { email:            { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'name department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ complaints, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: worker performance stats
export const getWorkerStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id:       '$assignedTo',
          total:     { $sum: 1 },
          pending:   { $sum: { $cond: [{ $eq: ['$status', 'Pending'] },     1, 0] } },
          inProgress:{ $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          workDone:  { $sum: { $cond: [{ $eq: ['$status', 'Work Done'] },   1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] },   1, 0] } },
          avgRating: { $avg: '$rating' },
        },
      },
      {
        $lookup: {
          from: 'users', localField: '_id', foreignField: '_id', as: 'worker',
        },
      },
      { $unwind: '$worker' },
      {
        $project: {
          name:        '$worker.name',
          department:  '$worker.department',
          total: 1, pending: 1, inProgress: 1, workDone: 1, completed: 1,
          avgRating:   { $round: ['$avgRating', 1] },
        },
      },
      { $sort: { completed: -1 } },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: manually re-assign
export const assignComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    complaint.assignedTo = req.body.authorityId;
    await complaint.save();
    res.json({ message: 'Complaint re-assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve (Completed) or Reject (back to In Progress)
export const verifyComplaint = async (req, res) => {
  try {
    const { action } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('assignedTo', 'name email phone');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Only admins can verify' });
    if (complaint.status !== 'Work Done') return res.status(400).json({ message: 'Complaint must be in Work Done status' });

    if (action === 'approve') {
      complaint.status = 'Completed';
      pushHistory(complaint, 'Completed', req.user.name);
      await complaint.save();
      await sendEmail(complaint.email, `Your Complaint is Resolved ✅ — ${complaint.complaintId}`,
        `<p>Dear <b>${complaint.name}</b>, your complaint <b>${complaint.complaintId}</b> has been verified and marked <b>Completed</b>. Please share your feedback on the portal. Thank you!</p>`
      );
      await sendWhatsAppMessage(complaint.phone,
        `✅ Complaint Resolved!\nID: ${complaint.complaintId}\nYour issue has been resolved. Please rate your experience on the portal.`
      );
      return res.json({ message: 'Approved and marked Completed', complaint });
    }

    if (action === 'reject') {
      complaint.status = 'In Progress';
      complaint.completionImage = null;
      pushHistory(complaint, 'In Progress', req.user.name + ' (rejected work)');
      await complaint.save();
      if (complaint.assignedTo?.email) {
        await sendEmail(complaint.assignedTo.email, `Work Rejected ❌ — ${complaint.complaintId}`,
          `<p>Admin has <b>rejected</b> your completion for complaint <b>${complaint.complaintId}</b>. Please revisit the issue and re-submit proof.</p>`
        );
      }
      if (complaint.assignedTo?.phone) {
        await sendWhatsAppMessage(complaint.assignedTo.phone,
          `❌ Work Rejected\nID: ${complaint.complaintId}\nAdmin rejected your completion. Please revisit and re-submit proof.`
        );
      }
      return res.json({ message: 'Work rejected, moved back to In Progress', complaint });
    }

    return res.status(400).json({ message: 'Invalid action. Use approve or reject.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── WORKER ────────────────────────────────────────────────────────────────

// Worker: get own assigned complaints
export const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Worker: update status (Pending → In Progress only via this route)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isAssignedWorker = complaint.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAdmin && !isAssignedWorker) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }
    if (req.user.role === 'Worker' && status !== 'In Progress') {
      return res.status(400).json({ message: 'Use the /work-done endpoint with an image to mark Work Done' });
    }

    complaint.status = status;
    pushHistory(complaint, status, req.user.name);
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Worker: mark Work Done + upload completion proof image
export const markWorkDone = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your assigned complaint' });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'A completion proof image is required' });
    }

    const completionImageUrl = await compressAndSaveImage(req.file.buffer, `completion-${req.user._id}`);
    complaint.completionImage = completionImageUrl;
    complaint.status = 'Work Done';
    pushHistory(complaint, 'Work Done', req.user.name);
    await complaint.save();

    // Notify all admins via email + WhatsApp
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      await sendEmail(admin.email, `Work Done — Verify ${complaint.complaintId}`,
        `<p>Worker <b>${req.user.name}</b> has marked complaint <b>${complaint.complaintId}</b> as Work Done and uploaded proof.<br>Please login to verify and approve.</p>`
      );
      if (admin.phone) {
        await sendWhatsAppMessage(admin.phone,
          `🔔 Work Done!\nID: ${complaint.complaintId}\nWorker: ${req.user.name}\nPlease login to verify.`
        );
      }
    }

    res.json({ message: 'Marked as Work Done. Awaiting admin verification.', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SHARED ────────────────────────────────────────────────────────────────

// Add comment to complaint thread
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isAuthorized = req.user.role === 'Admin' ||
      complaint.assignedTo?.toString() === req.user._id.toString();
    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized to comment' });

    complaint.comments.push({ user: req.user._id, name: req.user.name, role: req.user.role, text });
    await complaint.save();
    res.status(201).json({ message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
