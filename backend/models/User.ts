import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  skills: string[];
  bio: string;
  profileStep: number;
  isOnline: boolean;
  lastSeen: Date;
  github?: string;
  linkedin?: string;
  website?: string;
  matchPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  skills: [{ type: String }], // Added for profile
  bio: { type: String }, // Added for profile
  profileStep: { type: Number, default: 0 }, // For multi-step wizard
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  github: { type: String },
  linkedin: { type: String },
  website: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);