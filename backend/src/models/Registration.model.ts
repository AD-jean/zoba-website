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
    email: { type: String, required: true, trim: true, lowercase: true },
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

// Une personne (email) ne peut avoir qu'une seule inscription valide par activite. Index partiel :
// ne s'applique qu'aux inscriptions actives (pas annulees) et resolues (gratuites ou payees) --
// les paiements encore 'pending'/'failed' n'y sont pas soumis, pour permettre une nouvelle tentative
// apres un paiement rate ou abandonne. Protection reelle contre les doublons concurrents, pas
// seulement une verification applicative (evite la race condition).
// Note : partialFilterExpression ne supporte pas $ne/$not (erreur MongoDB a la creation de
// l'index) -- $in avec les valeurs explicites est la forme supportee equivalente.
RegistrationSchema.index(
  { activityId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
      paymentStatus: { $in: ['not_required', 'paid'] }
    }
  }
);

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);
