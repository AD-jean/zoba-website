import mongoose, { Document, Schema } from 'mongoose';

export interface IMember extends Document {
  name: string;
  role: string;
  organization: 'CBT' | 'Zone';
  image?: string;
  email?: string;
  phone?: string;
  bio?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    organization: { type: String, enum: ['CBT', 'Zone'], required: true },
    image: { type: String },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IMember>('Member', MemberSchema);
