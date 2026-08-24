import mongoose from 'mongoose';
import Admin from '../models/Admin.model';
import bcrypt from 'bcryptjs';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI non definie dans les variables d\'environnement');
  }

  // readyState 1 = connected, 2 = connecting : evite une reconnexion inutile
  // si connectDB() est appelee plusieurs fois (ex: tests).
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  mongoose.connection.on('error', (error) => {
    console.error('Erreur de connexion MongoDB:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB deconnecte');
  });

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connecte: ${conn.connection.host}`);
    await createInitialAdmin();
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    throw error;
  }
};

const createInitialAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL/ADMIN_PASSWORD non definis - aucun admin initial cree');
    return;
  }

  const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase() });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await Admin.create({
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      name: 'Administrateur'
    });
    console.log('Admin initial cree:', adminEmail);
  }
};
