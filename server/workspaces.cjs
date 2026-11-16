const { Pool } = require('pg');

let pool;

async function withWorkspace(ownerId, operation) {
  if (!pool) {
    const connectionString = process.env.LICENFY_DATABASE_URL;
    if (!connectionString) throw new Error('Database configuration missing');
    const url = new URL(connectionString);
    if (url.protocol !== 'postgresql:' || url.searchParams.get('sslmode') !== 'verify-full') {
      throw new Error('Database requires verified TLS');
    }
    for (const option of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl']) url.searchParams.delete(option);
    const ca = process.env.LICENFY_DATABASE_CA;
    pool = new Pool({
      connectionString: url.toString(),
      ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
      max: 1,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    });
    pool.on('error', () => console.error('Idle database connection closed unexpectedly'));
  }

  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('begin');
    await client.query("set local statement_timeout = '5s'");
    await client.query("select set_config('licenfy.owner_id', $1, true)", [ownerId]);
    const result = await operation(client);
    await client.query('commit');
    return result;
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      discard = true;
    }
    throw error;
  } finally {
    client.release(discard);
  }
}

function load(ownerId) {
  return withWorkspace(ownerId, async client => {
    const { rows } = await client.query(
      'select revision, state from licenfy.workspaces where owner_id = $1', [ownerId],
    );
    return rows[0] ?? { revision: 0, state: null };
  });
}

function save(ownerId, revision, state) {
  return withWorkspace(ownerId, async client => {
    const result = revision === 0
      ? await client.query(
        'insert into licenfy.workspaces (owner_id, state, revision) values ($1, $2, 1) on conflict (owner_id) do nothing returning revision',
        [ownerId, state],
      )
      : await client.query(
        'update licenfy.workspaces set state = $2, revision = revision + 1 where owner_id = $1 and revision = $3 returning revision',
        [ownerId, state, revision],
      );
    return result.rows[0] ?? null;
  });
}

module.exports = { load, save };
