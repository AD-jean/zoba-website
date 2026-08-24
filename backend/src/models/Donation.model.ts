import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  provider?: 'stripe' | 'fedapay';
  stripePaymentIntentId?: string;
  stripeEventId?: string;
  fedapayTransactionId?: string;
  fedapayEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema = new Schema(
  {
    donorName: { type: String, trim: true },
    donorEmail: { type: String, trim: true },
    donorPhone: { type: String, trim: true },
    amount: { type: Number, required: true, min: 1 },
    // Seule devise supportee par les fournisseurs branches actuellement (cf. ALLOWED_CURRENCIES
    // dans donation.routes.ts) : garde-fou au niveau schema si un code ecrit un jour en dehors des routes.
    currency: { type: String, default: 'XOF', enum: ['XOF'] },
    paymentMethod: { type: String, required: true, trim: true },
    transactionId: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    message: { type: String, trim: true },
    provider: { type: String, enum: ['stripe', 'fedapay'] },
    stripePaymentIntentId: { type: String, trim: true },
    stripeEventId: { type: String, trim: true },
    fedapayTransactionId: { type: String, trim: true },
    fedapayEventId: { type: String, trim: true }
  },
  { timestamps: true }
);

// GET /donations?status= et l'agregat /donations/stats filtrent tous deux sur status.
DonationSchema.index({ status: 1 });

// Un don = au plus un identifiant de paiement de chaque type (1 PaymentIntent/transaction par
// checkout). Index unique+sparse : empeche qu'un meme evenement/paiement soit rattache a deux
// dons distincts (double comptabilisation), sans contraindre les dons manuels qui n'ont aucun
// de ces champs (sparse ignore les documents ou le champ est absent).
DonationSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
DonationSchema.index({ stripeEventId: 1 }, { unique: true, sparse: true });
DonationSchema.index({ fedapayTransactionId: 1 }, { unique: true, sparse: true });
DonationSchema.index({ fedapayEventId: 1 }, { unique: true, sparse: true });

export default mongoose.model<IDonation>('Donation', DonationSchema);
