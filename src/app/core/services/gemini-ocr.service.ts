import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface OcrResult {
  title: string;
  category: 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros';
  issuingBody: string;
  documentNumber: string;
  issueDate: string;
  expirationDate: string;
  renewalCostEstimate: number;
  estimatedFineIfExpired: number;
  linkedAssetName: string;
  legalRequirementNote: string;
  fromAi: boolean;
}

const STORAGE_KEY = 'licenfy-gemini-key';

// Lista de modelos ordenados por menor sobrecarga e alta disponibilidade
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite'
];

const OCR_PROMPT = `Você é um especialista em OCR de documentos regulatórios brasileiros (alvarás, AVCB, licenças sanitárias, licenças ambientais, PPCI).

Analise o documento fornecido e extraia as informações no seguinte JSON exato (sem markdown, apenas JSON puro):

{
  "title": "Nome/título completo do documento",
  "category": "Alvará | Bombeiros | Sanitária | Ambiental | Segurança do Trabalho | Outros",
  "issuingBody": "Órgão emissor completo",
  "documentNumber": "Número do documento/protocolo",
  "issueDate": "YYYY-MM-DD",
  "expirationDate": "YYYY-MM-DD",
  "renewalCostEstimate": 0,
  "estimatedFineIfExpired": 0,
  "linkedAssetName": "Nome do ativo vinculado ou 'Nenhum ativo direto'",
  "legalRequirementNote": "Resumo das condicionantes legais extraídas do documento"
}

Regras:
- Se não encontrar uma data, use a data atual para emissão e data atual + 1 ano para vencimento
- renewalCostEstimate e estimatedFineIfExpired devem ser números inteiros (0 se não encontrado)
- category deve ser exatamente um dos valores listados
- Para documentos de prefeitura → "Alvará"
- Para bombeiros/AVCB/PPCI → "Bombeiros"
- Para vigilância sanitária/ANVISA → "Sanitária"
- Para IBAMA/órgãos ambientais → "Ambiental"
- Retorne APENAS o JSON, sem explicações adicionais`;

@Injectable({ providedIn: 'root' })
export class GeminiOcrService {
  constructor(private readonly http: HttpClient) {}

  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEY) || '';
  }

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  async extractFromFile(file: File): Promise<OcrResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chave Gemini não configurada.');
    }

    const base64 = await this.fileToBase64(file);
    const mimeType = this.getMimeType(file);

    const body = {
      contents: [{
        parts: [
          { text: OCR_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048
      }
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let lastError: any = null;

    // Tentar sucessivamente cada modelo na cadeia de contingência
    for (const model of CANDIDATE_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const response: any = await firstValueFrom(
          this.http.post(url, body, { headers }).pipe(timeout(30000))
        );

        const rawText: string = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const result = this.parseJsonResponse(rawText);
        result.fromAi = true;
        return result;
      } catch (err: any) {
        lastError = err;
        const status = err?.status;
        // Se for erro de alta demanda (503), cota/limite (429) ou modelo não encontrado (404), tenta o próximo modelo
        if (status === 503 || status === 429 || status === 404 || status === 500) {
          console.warn(`[Licenfy OCR] Modelo ${model} retornou ${status}. Tentando modelo reserva...`);
          continue;
        }

        // Se for erro de payload ou chave inválida (ex: 400 ou 401/403), propaga imediatamente
        const apiMsg = err?.error?.error?.message;
        if (apiMsg) {
          throw new Error(`Erro na API do Gemini (${status || 'API'}): ${apiMsg}`);
        }
        throw err;
      }
    }

    if (lastError?.name === 'TimeoutError') {
      throw new Error('Tempo limite excedido. O arquivo pode ser muito grande ou a rede está instável.');
    }
    const apiMsg = lastError?.error?.error?.message;
    if (apiMsg) {
      throw new Error(`Servidores do Gemini temporariamente ocupados (503). Tente novamente em alguns segundos.`);
    }
    throw lastError || new Error('Falha de conexão com os servidores do Gemini.');
  }

  private parseJsonResponse(text: string): OcrResult {
    let clean = text.trim();
    // Remover blocos de código se presentes
    clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

    // Extrair o primeiro bloco JSON delimitado por { e }
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      clean = match[0];
    }

    try {
      const parsed = JSON.parse(clean);
      const validCategories = ['Alvará', 'Bombeiros', 'Sanitária', 'Ambiental', 'Segurança do Trabalho', 'Outros'];
      if (!validCategories.includes(parsed.category)) {
        parsed.category = 'Outros';
      }
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
      return {
        title: parsed.title || 'Documento extraído via OCR',
        category: parsed.category || 'Outros',
        issuingBody: parsed.issuingBody || 'Órgão não identificado',
        documentNumber: parsed.documentNumber || 'S/N',
        issueDate: parsed.issueDate || today,
        expirationDate: parsed.expirationDate || nextYear,
        renewalCostEstimate: Number(parsed.renewalCostEstimate) || 0,
        estimatedFineIfExpired: Number(parsed.estimatedFineIfExpired) || 0,
        linkedAssetName: parsed.linkedAssetName || 'Nenhum ativo direto',
        legalRequirementNote: parsed.legalRequirementNote || 'Extraído via Gemini OCR',
        fromAi: true
      };
    } catch {
      throw new Error(`Falha ao interpretar resposta do Gemini: "${text.substring(0, 100)}..."`);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getMimeType(file: File): string {
    const ext = file.name.toLowerCase().split('.').pop();
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    };
    return map[ext || ''] || file.type || 'application/pdf';
  }
}
