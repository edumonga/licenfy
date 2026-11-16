const { createHmac, randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { withWorkspace, privacyNoticeVersion } = require('./workspaces.cjs');

const deriveKey = promisify(scrypt);
const dummySalt = '0'.repeat(32);
const dummyHash = Buffer.alloc(32);

function incrementAttempts(ip) {
  const key = createHmac('sha256', process.env.AUTH_SESSION_SECRET).update('password:' + ip).digest('hex');
  return withWorkspace('', async client => {
    await client.query("select set_config('licenfy.rate_key', $1, true)", [key]);
    const { rows } = await client.query(
      `insert into licenfy.auth_rate_limits as attempts (key, window_started, attempts)
        values ($1, now(), 1)
        on conflict (key) do update set
          attempts = case when attempts.window_started < now() - interval '15 minutes' then 1 else least(attempts.attempts + 1, 21) end,
          window_started = case when attempts.window_started < now() - interval '15 minutes' then now() else attempts.window_started end
        returning attempts`,
      [key],
    );
    return rows[0].attempts <= 20;
  });
}

function hashPassword(password, salt) {
  return deriveKey(password, salt, 32, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
}

async function signIn(email, password) {
  const account = await withWorkspace('', async client => {
    await client.query("select set_config('licenfy.login_email', $1, true)", [email]);
    const { rows } = await client.query(
      'select owner_id, name, salt, password_hash from licenfy.password_accounts where email = $1',
      [email],
    );
    return rows[0];
  });
  const expected = account ? Buffer.from(account.password_hash, 'hex') : dummyHash;
  const actual = await hashPassword(password, account?.salt ?? dummySalt);
  return timingSafeEqual(actual, expected) && account
    ? { id: account.owner_id, nome: account.name, email }
    : null;
}

async function signUp(email, name, password) {
  const id = 'manual-' + randomBytes(16).toString('hex');
  const salt = randomBytes(16).toString('hex');
  const key = await hashPassword(password, salt);
  try {
    await withWorkspace(id, async client => {
      await client.query(
        'insert into licenfy.accounts (owner_id, privacy_notice_version) values ($1, $2)',
        [id, privacyNoticeVersion],
      );
      await client.query(
        'insert into licenfy.password_accounts (owner_id, email, name, salt, password_hash) values ($1, $2, $3, $4, $5)',
        [id, email, name, salt, key.toString('hex')],
      );
    });
    return { id, nome: name, email };
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'password_accounts_email_key') return null;
    throw error;
  }
}

module.exports = { incrementAttempts, signIn, signUp };