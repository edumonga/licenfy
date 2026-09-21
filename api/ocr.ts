const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
const MAX_BASE64_LENGTH = 5_500_000;
const OCR_PROMPT = `Você é um especialista em OCR de documentos regulatórios brasileiros. Analise o arquivo e retorne APENAS um JSON válido com: title, category (Alvará | Bombeiros | Sanitária | Ambiental | Segurança do Trabalho | Outros), issuingBody, documentNumber, issueDate (YYYY-MM-DD), expirationDate (YYYY-MM-DD), renewalCostEstimate (número inteiro), estimatedFineIfExpired (número inteiro), linkedAssetName e legalRequirementNote. Use "Outros" para uma categoria incerta e 0 para valores indisponíveis.`;

function sendJson(res: any, status: number, body: unknown) { res.status(status).json(body); }

function normalizeResult(text: string) {
  const raw = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('O Gemini não retornou dados estruturados.');
  const parsed = JSON.parse(match[0]);
  const categories = ['Alvará', 'Bombeiros', 'Sanitária', 'Ambiental', 'Segurança do Trabalho', 'Outros'];
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  return {
    title: parsed.title || 'Documento extraído via OCR', category: categories.includes(parsed.category) ? parsed.category : 'Outros',
    issuingBody: parsed.issuingBody || 'Órgão não identificado', documentNumber: parsed.documentNumber || 'S/N',
    issueDate: parsed.issueDate || today, expirationDate: parsed.expirationDate || nextYear,
    renewalCostEstimate: Number(parsed.renewalCostEstimate) || 0, estimatedFineIfExpired: Number(parsed.estimatedFineIfExpired) || 0,
    linkedAssetName: parsed.linkedAssetName || 'Nenhum ativo direto', legalRequirementNote: parsed.legalRequirementNote || 'Extraído via Gemini OCR', fromAi: true
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { message: 'Método não permitido.' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(res, 503, { message: 'OCR indisponível: configure GEMINI_API_KEY na Vercel.' });
  const { data, mimeType } = req.body || {};
  if (typeof data !== 'string' || !data || typeof mimeType !== 'string') return sendJson(res, 400, { message: 'Arquivo inválido para OCR.' });
  if (data.length > MAX_BASE64_LENGTH) return sendJson(res, 413, { message: 'O arquivo excede o limite de 4 MB para OCR.' });

  let lastError = 'Não foi possível processar o documento.';
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: OCR_PROMPT }, { inline_data: { mime_type: mimeType, data } }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        })
      });
      const payload: any = await response.json();
      if (!response.ok) {
        lastError = payload?.error?.message || lastError;
        if ([404, 429, 500, 503].includes(response.status)) continue;
        return sendJson(res, response.status, { message: `Erro no OCR: ${lastError}` });
      }
      return sendJson(res, 200, normalizeResult(payload?.candidates?.[0]?.content?.parts?.[0]?.text || ''));
    } catch (error: any) { lastError = error?.message || lastError; }
  }
  return sendJson(res, 502, { message: `OCR indisponível: ${lastError}` });
}
