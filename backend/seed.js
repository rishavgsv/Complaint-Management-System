import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import dotenv from 'dotenv';

dotenv.config();

const seedSystem = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    // PURGE LEGACY DATA
    console.log('Purging legacy Users and Complaints to establish Worker Architecture...');
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Hash common password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Seed Admin
    await User.create({
      name: 'System Admin',
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'Admin',
      department: 'All'
    });

    // Seed Workers
    const workers = [
      { name: 'Bob Carpenter', email: 'carpenter@university.edu', department: 'Carpenter' },
      { name: 'Sparky Electrics', email: 'electrician@university.edu', department: 'Electrician' },
      { name: 'Cooling Dept', email: 'ac@university.edu', department: 'AC' },
      { name: 'Elevator Tech', email: 'lift@university.edu', department: 'Lift' },
      { name: 'Water Logistics', email: 'water@university.edu', department: 'Water RO' },
    ];

    for (const w of workers) {
      await User.create({
        name: w.name,
        email: w.email,
        password: hashedPassword,
        role: 'Worker',
        department: w.department
      });
    }

    console.log('System successfully seeded with Worker architecture!');
    console.log('Default Password for all accounts: password123');
    process.exit();
  } catch (error) {
    console.error('Error seeding system:', error);
    process.exit(1);
  }
};

seedSystem();
