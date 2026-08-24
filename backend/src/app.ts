import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import memberRoutes from './routes/member.routes';
import activityRoutes from './routes/activity.routes';
import newsRoutes from './routes/news.routes';
import galleryRoutes from './routes/gallery.routes';
import contactRoutes from './routes/contact.routes';
import subscriberRoutes from './routes/subscriber.routes';
import registrationRoutes from './routes/registration.routes';
import donationRoutes from './routes/donation.routes';
import donationWebhookRoutes from './routes/donation.webhook.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Les webhooks doivent recevoir le corps brut pour la verification de signature.
// Monte donc ce routeur AVANT express.json(), qui consommerait/remplacerait le flux.
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }), donationWebhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
