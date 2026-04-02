import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Worker'], required: true },
    department: {
      type: String,
      enum: ['Carpenter', 'Electrician', 'AC', 'Lift', 'Water RO', 'All'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
