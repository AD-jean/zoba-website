import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  activityId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  church?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  ticketCode: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed';
  provider?: 'stripe' | 'fedapay';
  amount?: number;
  currency?: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
  stripeEventId?: string;
  fedapayTransactionId?: string;
  fedapayEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    church: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    // Identifiant opaque encode dans le QR du billet (jamais l'_id Mongo, pour eviter l'enumeration).
    ticketCode: { type: String, required: true, unique: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    // 'not_required' pour les activites gratuites (Activity.price === 0).
    paymentStatus: { type: String, enum: ['not_required', 'pending', 'paid', 'failed'], default: 'not_required' },
    provider: { type: String, enum: ['stripe', 'fedapay'] },
    amount: { type: Number, min: 0 },
    currency: { type: String, enum: ['XOF'] },
    transactionId: { type: String, trim: true },
    stripePaymentIntentId: { type: String, trim: true },
    stripeEventId: { type: String, trim: true },
    fedapayTransactionId: { type: String, trim: true },
    fedapayEventId: { type: String, trim: true }
  },
  { timestamps: true }
);

// Meme raisonnement d'idempotence que Donation : un identifiant de paiement ne peut
// jamais etre rattache a deux inscriptions distinctes (sparse car absent pour le gratuit).
RegistrationSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
RegistrationSchema.index({ stripeEventId: 1 }, { unique: true, sparse: true });
RegistrationSchema.index({ fedapayTransactionId: 1 }, { unique: true, sparse: true });
RegistrationSchema.index({ fedapayEventId: 1 }, { unique: true, sparse: true });

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);
