import type { IncomingMessage, ServerResponse } from 'node:http';

const { createHash, randomBytes } = require('node:crypto');
const { SESSION_COOKIE, cookie, read, seal, session } = require('../server/session.cjs');
const { hasAccount, registerAccount } = require('../server/workspaces.cjs');
const OAUTH_COOKIE = '__Host-licenfy-oauth';
const TRANSACTION_AGE = 600;
const SESSION_AGE = 8 * 60 * 60;

function redirect(res: ServerResponse, location: string) {
  res.writeHead(303, { Location: location }).end();
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(data));
}

async function auth(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const query = new URL(req.url || '/', 'https://licenfy.invalid').searchParams;
  const action = query.get('action');

  if (action === 'session' && req.method === 'GET') {
    const user = session(req);
    return json(res, user ? 200 : 401, user || { message: 'Sessão ausente.' });
  }

  if (action === 'logout' && req.method === 'POST') {
    if (!process.env.APP_ORIGIN || req.headers.origin !== process.env.APP_ORIGIN) {
      return json(res, 403, { message: 'Origem não autorizada.' });
    }
    res.setHeader('Set-Cookie', cookie(SESSION_COOKIE, '', 0));
    return res.writeHead(204).end();
  }

  const signup = action === 'signup' && req.method === 'POST';
  if (!signup && (req.method !== 'GET' || (action !== 'google' && action !== 'callback'))) {
    return json(res, 405, { message: 'Operação não permitida.' });
  }

  try {
    const { APP_ORIGIN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    if (!APP_ORIGIN || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error('OAuth configuration');
    const origin = new URL(APP_ORIGIN);
    if (origin.origin !== APP_ORIGIN || origin.protocol !== 'https:') throw new Error('OAuth origin');
    const callback = origin.origin + '/api/auth?action=callback';

    if (signup) {
      if (req.headers.origin !== origin.origin) return json(res, 403, { message: 'Origem não autorizada.' });
      const body = typeof req.body === 'string'
        ? Object.fromEntries(new URLSearchParams(req.body))
        : req.body as { privacyAcknowledged?: unknown } | undefined;
      if (body?.privacyAcknowledged !== 'yes') return redirect(res, '/?login=privacidade');
    }

    if (action === 'google' || signup) {
      const state = randomBytes(32).toString('base64url');
      const verifier = randomBytes(32).toString('base64url');
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: callback,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        code_challenge: createHash('sha256').update(verifier).digest('base64url'),
        code_challenge_method: 'S256',
      });
      res.setHeader('Set-Cookie', cookie(OAUTH_COOKIE, seal('oauth', { state, verifier, signup }, TRANSACTION_AGE), TRANSACTION_AGE));
      return redirect(res, 'https://accounts.google.com/o/oauth2/v2/auth?' + params);
    }

    const transaction = read(req, OAUTH_COOKIE, 'oauth');
    res.setHeader('Set-Cookie', cookie(OAUTH_COOKIE, '', 0));
    const code = query.get('code');
    if (!transaction || query.get('state') !== transaction.state || !code || query.has('error')) {
      return redirect(res, '/?login=erro');
    }

    const token = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callback,
        grant_type: 'authorization_code',
        code_verifier: transaction.verifier,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!token.ok) throw new Error('OAuth exchange');
    const { access_token } = await token.json();
    if (typeof access_token !== 'string') throw new Error('OAuth access token');

    const profile = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: 'Bearer ' + access_token },
      signal: AbortSignal.timeout(6000),
    });
    if (!profile.ok) throw new Error('OAuth profile');
    const { sub, email, email_verified, name } = await profile.json();
    if (typeof sub !== 'string' || !/^[0-9]{1,128}$/.test(sub) || typeof email !== 'string' || email_verified !== true) {
      throw new Error('OAuth identity');
    }

    const user = { id: sub, nome: typeof name === 'string' ? name : email, email, trial: true, teste: true };
    const value = seal('session', { user }, SESSION_AGE);
    if (value.length > 3900) throw new Error('OAuth profile size');
    if (transaction.signup === true) {
      await registerAccount(sub);
    } else if (!await hasAccount(sub)) {
      return redirect(res, '/?login=criar');
    }
    res.setHeader('Set-Cookie', [cookie(OAUTH_COOKIE, '', 0), cookie(SESSION_COOKIE, value, SESSION_AGE)]);
    return redirect(res, '/?login=ok');
  } catch {
    return redirect(res, '/?login=erro');
  }
}

module.exports = auth;
