/**
 * Integration tests — run against a real PostgreSQL database.
 * Requires DATABASE_URL to be set (see .env or CI environment).
 *
 * Run with: npm run test:integration --workspace=backend
 */
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app';

const prisma = new PrismaClient();

// Unique suffix per test run so parallel runs don't conflict
const RUN_ID = Date.now();
const email = (label: string) => `integration-${label}-${RUN_ID}@test.de`;

// ─── helpers ─────────────────────────────────────────────────────────────────

async function register(label: string, password = 'Test1234!') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: email(label), password });
  return res;
}

async function login(label: string, password = 'Test1234!') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: email(label), password });
  return res;
}

function cookiesFrom(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

// ─── cleanup ─────────────────────────────────────────────────────────────────

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: `integration-` } },
  });
  await prisma.$disconnect();
});

// ─── Auth flow ────────────────────────────────────────────────────────────────

describe('Auth', () => {
  it('registers a new user and returns 201 with user object', async () => {
    const res = await register('reg');

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email('reg'));
    expect(res.body.user.role).toBe('USER');
    expect(res.body.user).not.toHaveProperty('passwordHash');
    // access_token cookie must be set
    expect(cookiesFrom(res).some((c) => c.startsWith('access_token'))).toBe(true);
  });

  it('returns 409 when email already exists', async () => {
    await register('dup');
    const res = await register('dup');
    expect(res.status).toBe(409);
  });

  it('logs in and returns user + auth cookies', async () => {
    await register('login');
    const res = await login('login');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email('login'));
    expect(cookiesFrom(res).some((c) => c.startsWith('access_token'))).toBe(true);
    expect(cookiesFrom(res).some((c) => c.startsWith('refresh_token'))).toBe(true);
  });

  it('returns 401 for wrong password', async () => {
    await register('wrongpw');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: email('wrongpw'), password: 'NotThePassword' });
    expect(res.status).toBe(401);
  });
});

// ─── /users/me ───────────────────────────────────────────────────────────────

describe('GET /api/users/me', () => {
  it('returns profile for authenticated user including avatar field', async () => {
    await register('me');
    const loginRes = await login('me');
    const cookies = cookiesFrom(loginRes);

    const res = await request(app)
      .get('/api/users/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email('me'));
    // avatar field must exist in the response (may be null)
    expect(res.body).toHaveProperty('avatar');
  });

  it('returns 401 without auth cookie', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

// ─── Avatar ───────────────────────────────────────────────────────────────────

describe('PATCH /api/users/me/avatar', () => {
  it('saves an emoji preset and returns updated user', async () => {
    await register('avatar');
    const loginRes = await login('avatar');
    const cookies = cookiesFrom(loginRes);

    const res = await request(app)
      .patch('/api/users/me/avatar')
      .set('Cookie', cookies)
      .send({ avatar: '🦊' });

    expect(res.status).toBe(200);
    expect(res.body.avatar).toBe('🦊');
  });

  it('clears avatar when null is sent', async () => {
    await register('avatarnull');
    const loginRes = await login('avatarnull');
    const cookies = cookiesFrom(loginRes);

    await request(app)
      .patch('/api/users/me/avatar')
      .set('Cookie', cookies)
      .send({ avatar: '🐻' });

    const res = await request(app)
      .patch('/api/users/me/avatar')
      .set('Cookie', cookies)
      .send({ avatar: null });

    expect(res.status).toBe(200);
    expect(res.body.avatar).toBeNull();
  });

  it('returns 413 when avatar payload exceeds size limit', async () => {
    await register('avatarbig');
    const loginRes = await login('avatarbig');
    const cookies = cookiesFrom(loginRes);

    const oversized = 'x'.repeat(210 * 1024);

    const res = await request(app)
      .patch('/api/users/me/avatar')
      .set('Cookie', cookies)
      .send({ avatar: oversized });

    expect(res.status).toBe(413);
  });
});

// ─── Events (public) ─────────────────────────────────────────────────────────

describe('GET /api/events', () => {
  it('returns paginated events without authentication', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
