// backend/models/Activity.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  target: string;
  details?: { [key: string]: any };
}

const activitySchema = new Schema<IActivity>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: { type: String, required: true },
  details: Object
}, { timestamps: true });

export default mongoose.model<IActivity>('Activity', activitySchema);