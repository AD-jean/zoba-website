import express, { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import PageView from '../models/PageView.model';
import Donation from '../models/Donation.model';
import Registration from '../models/Registration.model';
import Subscriber from '../models/Subscriber.model';
import Contact from '../models/Contact.model';
import { protect } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  countryFrom, dayKey, deviceFromUserAgent, isBot, normalizePath, referrerHost, visitorHash
} from '../services/analytics.service';

const router = Router();

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requetes' }
});

const ownHosts = ['localhost', '127.0.0.1', ...(process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => {
    try { return new URL(origin.trim()).hostname.replace(/^www\./, ''); } catch { return ''; }
  })
  .filter(Boolean)];

// ─── Collecte (public) ────────────────────────────────────────────────────────
// Le navigateur envoie un `navigator.sendBeacon` en text/plain (requete simple, sans
// pre-vol CORS). Reponse toujours 204 : le site public ne depend jamais de cette route.
router.post(
  '/track',
  trackLimiter,
  express.text({ type: 'text/plain', limit: '2kb' }),
  asyncHandler(async (req: Request, res: Response) => {
    // Respect du signal « ne pas me suivre » (Do Not Track / Global Privacy Control).
    if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1') return res.status(204).end();

    const userAgent = String(req.headers['user-agent'] || '');
    if (isBot(userAgent)) return res.status(204).end();

    let payload: Record<string, unknown> = {};
    try {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {
      return res.status(204).end();
    }

    const path = normalizePath(payload.path);
    if (!path) return res.status(204).end();

    const day = dayKey();
    await PageView.create({
      path,
      day,
      visitor: visitorHash(req.ip || '', userAgent, day),
      referrer: referrerHost(payload.referrer, ownHosts),
      device: deviceFromUserAgent(userAgent),
      country: countryFrom(req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'], payload.tz)
    });
    res.status(204).end();
  })
);

// ─── Lecture (admin) ──────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '12m';
const PERIODS: Period[] = ['7d', '30d', '12m'];

/** Debut de periode et liste des tranches (jours ou mois) a afficher, en UTC. */
function buckets(period: Period): { since: Date; keys: string[]; byMonth: boolean } {
  const now = new Date();
  if (period === '12m') {
    const keys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      keys.push(d.toISOString().slice(0, 7));
    }
    return { since: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)), keys, byMonth: true };
  }
  const days = period === '7d' ? 7 : 30;
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))));
  }
  return { since: new Date(`${keys[0]}T00:00:00.000Z`), keys, byMonth: false };
}

async function audience(period: Period) {
  const { since, keys, byMonth } = buckets(period);
  const match = { $match: { createdAt: { $gte: since } } };
  const bucketExpr = byMonth ? { $substr: ['$day', 0, 7] } : '$day';
  // Visiteur unique = empreinte d'un jour donne (le sel change chaque jour).
  const visitorKey = { $concat: ['$day', '$visitor'] };
  const top = (field: string) => [
    { $match: { [field]: { $exists: true, $nin: [null, ''] } } },
    { $group: { _id: `$${field}`, views: { $sum: 1 }, visitors: { $addToSet: visitorKey } } },
    { $project: { _id: 0, key: '$_id', views: 1, visitors: { $size: '$visitors' } } },
    { $sort: { views: -1 as const } },
    { $limit: 8 }
  ];

  const [result] = await PageView.aggregate([
    match,
    {
      $facet: {
        totals: [
          { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: visitorKey } } },
          { $project: { _id: 0, views: 1, visitors: { $size: '$visitors' } } }
        ],
        series: [
          { $group: { _id: bucketExpr, views: { $sum: 1 }, visitors: { $addToSet: visitorKey } } },
          { $project: { views: 1, visitors: { $size: '$visitors' } } }
        ],
        pages: top('path'),
        referrers: top('referrer'),
        devices: top('device'),
        countries: top('country')
      }
    }
  ]);

  const seriesMap = new Map<string, { views: number; visitors: number }>(
    result.series.map((s: { _id: string; views: number; visitors: number }) => [s._id, s])
  );
  const totals = result.totals[0] ?? { views: 0, visitors: 0 };
  // Pages vues sans referrer externe = acces direct (adresse tapee, favori, appli...).
  const [{ withReferrer = 0 } = {}] = await PageView.aggregate([
    { $match: { createdAt: { $gte: since }, referrer: { $exists: true, $nin: [null, ''] } } },
    { $count: 'withReferrer' }
  ]);

  return {
    period,
    totals,
    series: keys.map((key) => ({ key, views: seriesMap.get(key)?.views ?? 0, visitors: seriesMap.get(key)?.visitors ?? 0 })),
    pages: result.pages,
    referrers: result.referrers,
    direct: Math.max(totals.views - withReferrer, 0),
    devices: result.devices,
    countries: result.countries
  };
}

router.get(
  '/stats',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const period = PERIODS.includes(req.query.period as Period) ? (req.query.period as Period) : '30d';
    res.json(await audience(period));
  })
);

/** Chiffres cles du tableau de bord, tous tires de la base. */
router.get(
  '/overview',
  protect,
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const sumDonations = async (from: Date, to?: Date) => {
      const [row] = await Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: from, ...(to ? { $lt: to } : {}) } } },
        { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      return { amount: row?.amount ?? 0, count: row?.count ?? 0 };
    };

    const [
      donationsMonth, donationsPrevMonth, registrationsTotal, registrationsMonth,
      subscribersActive, subscribersMonth, messagesUnread, messagesTotal,
      split, latestRegistrations, latestDonations, traffic
    ] = await Promise.all([
      sumDonations(monthStart),
      sumDonations(prevMonthStart, monthStart),
      Registration.countDocuments({ status: { $ne: 'cancelled' } }),
      Registration.countDocuments({ status: { $ne: 'cancelled' }, createdAt: { $gte: monthStart } }),
      Subscriber.countDocuments({ active: true }),
      Subscriber.countDocuments({ active: true, createdAt: { $gte: monthStart } }),
      Contact.countDocuments({ isRead: false }),
      Contact.countDocuments(),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: { $ifNull: ['$provider', 'other'] }, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Registration.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('activityId', 'title')
        .select('name activityId status paymentStatus createdAt')
        .lean(),
      Donation.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('donorName amount currency provider paymentMethod status createdAt')
        .lean(),
      audience('30d')
    ]);

    res.json({
      kpis: {
        donationsMonth,
        donationsPrevMonth,
        registrations: { total: registrationsTotal, month: registrationsMonth },
        subscribers: { active: subscribersActive, month: subscribersMonth },
        messages: { unread: messagesUnread, total: messagesTotal },
        visitors: traffic.totals
      },
      donationSplit: split.map((s: { _id: string; amount: number; count: number }) => ({ provider: s._id, amount: s.amount, count: s.count })),
      latestRegistrations,
      latestDonations,
      traffic: { series: traffic.series, totals: traffic.totals }
    });
  })
);

export default router;
