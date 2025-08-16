// backend/models/Post.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IComment {
  text: string;
  user: mongoose.Types.ObjectId;
  replies: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

interface IPost extends Document {
  title: string;
  content: string;
  rawContent: string;
  user: mongoose.Types.ObjectId;
  tags: string[];
  comments: IComment[];
  createdAt: Date;  
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  replies: [this]
}, { timestamps: true });

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  rawContent: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  comments: [commentSchema],
}, { timestamps: true });

postSchema.index({ content: 'text', title: 'text' });
postSchema.index({ tags: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', postSchema);