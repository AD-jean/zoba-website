import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  author: string;
  category: string;
  published: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    image: { type: String },
    author: { type: String, default: 'Administration ZOBA', trim: true },
    category: { type: String, default: 'General', trim: true },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Sert la requete publique la plus frequente : GET /news (published:true, tri publishedAt desc).
NewsSchema.index({ published: 1, publishedAt: -1 });

export default mongoose.model<INews>('News', NewsSchema);
