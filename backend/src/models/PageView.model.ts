import mongoose, { Document, Schema } from 'mongoose';

/**
 * Une page vue sur le site public. Aucune donnee personnelle brute :
 * - pas d'IP ni de user-agent stockes ;
 * - `visitor` est une empreinte a sel quotidien (cf. analytics.service), qui change
 *   chaque jour et ne permet ni de retrouver l'IP ni de suivre quelqu'un d'un jour a l'autre ;
 * - le referrer est reduit a son nom de domaine.
 */
export interface IPageView extends Document {
  path: string;
  visitor: string;
  day: string;
  referrer?: string;
  device: 'mobile' | 'tablet' | 'desktop';
  country?: string;
  createdAt: Date;
}

const RETENTION_DAYS = 400; // ~13 mois : de quoi afficher la vue « 12 mois »

const PageViewSchema: Schema = new Schema(
  {
    path: { type: String, required: true, maxlength: 200 },
    visitor: { type: String, required: true },
    day: { type: String, required: true }, // AAAA-MM-JJ (UTC)
    referrer: { type: String, maxlength: 120 },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'], required: true },
    country: { type: String, maxlength: 2 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

export default mongoose.model<IPageView>('PageView', PageViewSchema);
