import rateLimit from 'express-rate-limit';

// Connexion admin : protège contre la force brute sur le mot de passe.
// skipSuccessfulRequests => seules les tentatives échouées comptent, un
// utilisateur légitime qui se connecte du premier coup n'est jamais bloqué.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion, réessayez dans 15 minutes' }
});

// Formulaires et actions publics non authentifiés (contact, newsletter,
// enregistrement de don, inscription, démarrage de paiement) : limite les
// envois automatisés depuis une même adresse IP.
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop d'envois depuis cette adresse, réessayez plus tard" }
});

// Verification du statut d'un paiement au retour sur le site : le front interroge
// toutes les quelques secondes pendant ~1 minute, d'ou une limite plus large.
export const paymentStatusLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de verifications, reessayez dans quelques minutes' }
});
