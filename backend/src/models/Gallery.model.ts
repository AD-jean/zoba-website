import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  caption?: string;
  description?: string;
  image: string;
  category: string;
  department?: string;
  event?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema: Schema = new Schema(
  {
    caption: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    department: { type: String, trim: true },
    event: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model<IGallery>('Gallery', GallerySchema);
