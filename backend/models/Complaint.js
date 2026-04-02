import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  changedBy: { type: String, default: 'System' },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    enrollmentNumber: { type: String, required: true },
    email:       { type: String, required: true },
    phone:       { type: String, required: true },
    category: {
      type: String,
      enum: ['Carpenter', 'Electrician', 'AC', 'Lift', 'Water RO'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    details: {
      location:  String,
      issueType: String,
    },
    description:      { type: String, required: true },
    image:            { type: String },       // Student proof URL
    completionImage:  { type: String },       // Worker completion proof URL
    dueDate:          { type: Date },         // Auto-set 48h after submission
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Work Done', 'Completed'],
      default: 'Pending',
    },
    statusHistory: [statusHistorySchema],     // Full audit trail
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:      String,
        role:      String,
        text:      String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Student feedback after Completed
    rating:   { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    // Reopen tracking
    isReopened:        { type: Boolean, default: false },
    parentComplaintId: { type: String, default: null }, // links to original
  },
  { timestamps: true }
);

// Auto-set dueDate = 48h from creation if not already set
complaintSchema.pre('save', function () {
  if (this.isNew && !this.dueDate) {
    this.dueDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
});

export default mongoose.model('Complaint', complaintSchema);
