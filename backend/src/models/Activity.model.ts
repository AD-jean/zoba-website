import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  date?: Date;
  location: string;
  image?: string;
  department: string;
  organizer: 'Zone' | 'Église';
  registrationRequired: boolean;
  registrationDeadline?: Date;
  maxParticipants?: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, index: true },
    location: { type: String, required: true, trim: true },
    image: { type: String },
    department: { type: String, default: 'Tous', trim: true },
    organizer: { type: String, enum: ['Zone', 'Église'], default: 'Zone' },
    registrationRequired: { type: Boolean, default: true },
    registrationDeadline: { type: Date },
    maxParticipants: { type: Number },
    // XOF, 0 = gratuite. Au-dela de 0, l'inscription doit passer par /checkout (paiement en ligne).
    price: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IActivity>('Activity', ActivitySchema);
