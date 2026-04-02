import Complaint from '../models/Complaint.js';

export const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  
  // Find the last complaint to determine the next number
  const lastComplaint = await Complaint.findOne(
    { complaintId: { $regex: `^CMP-${currentYear}-` } }
  ).sort({ createdAt: -1 });

  let nextNum = 1;
  if (lastComplaint && lastComplaint.complaintId) {
    const parts = lastComplaint.complaintId.split('-');
    if (parts.length === 3) {
      nextNum = parseInt(parts[2], 10) + 1;
    }
  }

  const formattedNum = nextNum.toString().padStart(4, '0');
  return `CMP-${currentYear}-${formattedNum}`;
};
