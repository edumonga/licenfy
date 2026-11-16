const { createHmac, timingSafeEqual } = require('node:crypto');

const SESSION_COOKIE = '__Host-licenfy-session';

function signature(purpose, payload) {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error('Invalid session configuration');
  return createHmac('sha256', secret).update(purpose + ':' + payload).digest();
}

function seal(purpose, data, seconds) {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + seconds * 1000 })).toString('base64url');
  return payload + '.' + signature(purpose, payload).toString('base64url');
}

function read(req, name, purpose) {
  const value = req.headers.cookie?.split(';').map(part => part.trim())
    .find(part => part.startsWith(name + '='))?.slice(name.length + 1);
  if (!value || value.length > 3900 || !/^[\w-]+\.[\w-]+$/.test(value)) return null;
  try {
    const [payload, mac] = value.split('.');
    const actual = Buffer.from(mac, 'base64url');
    const expected = signature(purpose, payload);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function cookie(name, value, seconds) {
  return name + '=' + value + '; Path=/; Max-Age=' + seconds + '; HttpOnly; Secure; SameSite=Lax';
}

function session(req) {
  return read(req, SESSION_COOKIE, 'session')?.user ?? null;
}

module.exports = { SESSION_COOKIE, cookie, read, seal, session };
