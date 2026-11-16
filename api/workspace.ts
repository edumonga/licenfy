import type { IncomingMessage, ServerResponse } from 'node:http';

const { session } = require('../server/session.cjs');
const workspaces = require('../server/workspaces.cjs');

const collections = ['units', 'licenses', 'assets', 'rules', 'notifications', 'dossiers'] as const;
const maxStateBytes = 256 * 1024;

function json(res: ServerResponse, status: number, data: unknown) {
  return res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(data));
}

function validState(state: unknown): state is Record<string, unknown[]> {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
  const record = state as Record<string, unknown>;
  return Object.keys(record).length === collections.length && collections.every(key => {
    const entries = record[key];
    return Array.isArray(entries) && entries.every(entry =>
      entry && typeof entry === 'object' && typeof entry.id === 'string' && entry.id.length <= 128,
    );
  });
}

async function workspace(req: IncomingMessage & { body?: { revision?: number; state?: unknown } }, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return json(res, 405, { message: 'Método não permitido.' });
  }

  const user = session(req);
  if (!user || typeof user.id !== 'string' || !/^(?:[0-9]{1,128}|manual-[0-9a-f]{32})$/.test(user.id)) {
    return json(res, 401, { message: 'Sessão ausente ou expirada.' });
  }

  try {
    if (req.method === 'GET') return json(res, 200, await workspaces.load(user.id));
    if (!process.env.APP_ORIGIN || req.headers.origin !== process.env.APP_ORIGIN) {
      return json(res, 403, { message: 'Origem não autorizada.' });
    }
    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return json(res, 415, { message: 'Envie os dados em JSON.' });
    }

    const { revision, state } = req.body ?? {};
    if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 0 || revision >= 2147483647 || !validState(state)) {
      return json(res, 400, { message: 'Dados de trabalho inválidos.' });
    }
    if (Buffer.byteLength(JSON.stringify(state)) > maxStateBytes) {
      return json(res, 413, { message: 'Espaço de trabalho excedeu o tamanho permitido.' });
    }

    const result = await workspaces.save(user.id, revision, state);
    return result
      ? json(res, 200, result)
      : json(res, 409, { message: 'Os dados foram alterados em outra sessão.' });
  } catch {
    return json(res, 503, { message: 'Banco temporariamente indisponível.' });
  }
}

module.exports = workspace;
