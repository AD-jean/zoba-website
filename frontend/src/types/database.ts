export type Department = 'Tous' | 'Hommes' | 'Femmes' | 'Jeunesse' | 'Enfants';
export type Organization = 'CBT' | 'Zone';
export type Organizer = 'Zone' | 'Église';

export interface Member {
  _id: string;
  name: string;
  role: string;
  organization: Organization;
  image?: string;
  email?: string;
  phone?: string;
  bio?: string;
  order: number;
  createdAt: string;
}
export type MemberInsert = Omit<Member, '_id' | 'createdAt'>;

export interface Activity {
  _id: string;
  title: string;
  description: string;
  date?: string;
  location: string;
  image?: string;
  department: Department;
  organizer: Organizer;
  registrationRequired: boolean;
  registrationDeadline?: string;
  maxParticipants?: number;
  price: number;
  createdAt: string;
}
export type ActivityInsert = Omit<Activity, '_id' | 'createdAt' | 'registrationRequired'>;

export interface News {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  category: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
}
export type NewsInsert = Omit<News, '_id' | 'createdAt' | 'author' | 'category' | 'published'>;

export interface GalleryItem {
  _id: string;
  image: string;
  caption?: string;
  department: Department | null;
  createdAt: string;
}
export type GalleryInsert = Omit<GalleryItem, '_id' | 'createdAt'>;

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
export type ContactInsert = Omit<Contact, '_id' | 'isRead' | 'createdAt'>;

export interface Subscriber {
  _id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface Registration {
  _id: string;
  activityId: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  ticketCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed';
  provider?: 'stripe' | 'fedapay';
  amount?: number;
  currency?: string;
  createdAt: string;
}
export type RegistrationInsert = Omit<Registration, '_id' | 'status' | 'createdAt' | 'ticketCode' | 'checkedIn' | 'checkedInAt' | 'paymentStatus' | 'provider' | 'amount' | 'currency'>;

export interface Ticket {
  name: string;
  activityTitle: string;
  activityDate?: string;
  activityLocation: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed';
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface Donation {
  _id: string;
  amount: number;
  currency: string;
  paymentMethod: 'PayPal' | 'Mixx' | 'Moov';
  donorName?: string;
  donorEmail?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
