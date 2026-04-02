import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const fixPassword = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const hashed = await bcrypt.hash("password123", 10);

  await User.updateOne(
    { email: "admin@university.edu" },
    { password: hashed }
  );

  console.log("Password fixed!");
  process.exit();
};

fixPassword();