import { cookies, headers } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getUserById } from './database';

const SESSION_COOKIE_NAME = 'cryptovest_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  userId: string;
  username: string;
  isAdmin: boolean;
  exp: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters long');
  }
  return secret;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function createSessionToken(data: Omit<SessionData, 'exp'>): string {
  const payloadObj: SessionData = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const payload = toBase64Url(JSON.stringify(payloadObj));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): SessionData | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as SessionData;
    if (!parsed?.userId || !parsed?.username || typeof parsed?.isAdmin !== 'boolean') {
      return null;
    }

    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function createSession(data: Omit<SessionData, 'exp'>): Promise<void> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const token = createSessionToken(data);

  const forwardedProto = headerStore.get('x-forwarded-proto');
  const secureOverride = process.env.SESSION_COOKIE_SECURE;
  const secure =
    secureOverride === 'true'
      ? true
      : secureOverride === 'false'
        ? false
        : forwardedProto === 'https';

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) return null;
  return verifySessionToken(sessionCookie.value);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  return getUserById(session.userId);
}
