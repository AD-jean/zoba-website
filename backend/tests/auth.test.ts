import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import app from '../src/app';
import Admin from '../src/models/Admin.model';
import Donation from '../src/models/Donation.model';

const SECRET = 'secret_de_test_uniquement';
const ADMIN_ID = '665f0c0c0c0c0c0c0c0c0c0a';

// findOne(...).select('+password') -> document (ou null)
const mockFindOne = (doc: unknown) =>
  vi.spyOn(Admin, 'findOne').mockReturnValue({ select: vi.fn().mockResolvedValue(doc) } as never);

describe('authentification admin', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.JWT_SECRET = SECRET;
  });

  it('renvoie le meme message, que le compte existe ou non', async () => {
    mockFindOne(null);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'inconnu1@zoba.test', password: 'x' });

    mockFindOne({ _id: ADMIN_ID, email: 'admin1@zoba.test', password: await bcrypt.hash('bon', 4) });
    const wrong = await request(app).post('/api/auth/login').send({ email: 'admin1@zoba.test', password: 'mauvais' });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.message).toBe(wrong.body.message);
  });

  it('bloque temporairement un compte apres 5 echecs', async () => {
    mockFindOne(null);
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/auth/login').send({ email: 'cible@zoba.test', password: `essai${i}` });
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });

  it('delivre un jeton de session limite (12 h par defaut)', async () => {
    mockFindOne({ _id: ADMIN_ID, email: 'admin2@zoba.test', name: 'Admin', password: await bcrypt.hash('bon', 4) });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin2@zoba.test', password: 'bon' });
    expect(res.status).toBe(200);
    const payload = jwt.decode(res.body.token) as { iat: number; exp: number };
    expect(payload.exp - payload.iat).toBe(12 * 3600);
  });

  it('refuse les routes admin sans jeton, avec un jeton non signe ou si le compte a ete supprime', async () => {
    expect((await request(app).get('/api/donations')).status).toBe(401);

    const unsigned = jwt.sign({ id: ADMIN_ID }, '', { algorithm: 'none' } as jwt.SignOptions);
    expect((await request(app).get('/api/donations').set('Authorization', `Bearer ${unsigned}`)).status).toBe(401);

    const token = jwt.sign({ id: ADMIN_ID }, SECRET, { expiresIn: '1h' });
    vi.spyOn(Admin, 'exists').mockResolvedValue(null);
    expect((await request(app).get('/api/donations').set('Authorization', `Bearer ${token}`)).status).toBe(401);

    vi.spyOn(Admin, 'exists').mockResolvedValue({ _id: ADMIN_ID } as never);
    vi.spyOn(Donation, 'find').mockReturnValue({ sort: vi.fn().mockResolvedValue([]) } as never);
    expect((await request(app).get('/api/donations').set('Authorization', `Bearer ${token}`)).status).toBe(200);
  });
});
