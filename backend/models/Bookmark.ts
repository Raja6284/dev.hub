// backend/models/Bookmark.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  resource: { [key: string]: any };
}

const bookmarkSchema = new Schema<IBookmark>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  resource: { type: Object, required: true }
}, { timestamps: true });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);