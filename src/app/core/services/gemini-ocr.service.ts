import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface ResultadoOcr {
  titulo: string;
  title?: string;
  categoria: 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros';
  category?: 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros';
  orgaoEmissor: string;
  issuingBody?: string;
  numeroDocumento: string;
  documentNumber?: string;
  dataEmissao: string;
  issueDate?: string;
  dataVencimento: string;
  expirationDate?: string;
  estimativaCustoRenovacao: number;
  renewalCostEstimate?: number;
  estimativaMultaVencida: number;
  estimatedFineIfExpired?: number;
  nomeAtivoVinculado: string;
  linkedAssetName?: string;
  notaRequisitoLegal: string;
  legalRequirementNote?: string;
  origemIa: boolean;
  fromAi?: boolean;
}

export type OcrResult = ResultadoOcr;

@Injectable({ providedIn: 'root' })
export class ServicoGeminiOcr {
  constructor(private readonly http: HttpClient) {}

  async extrairDeArquivo(arquivo: File): Promise<ResultadoOcr> {
    const dadosBase64 = await this.arquivoParaBase64(arquivo);
    const cabecalhos = new HttpHeaders({ 'Content-Type': 'application/json' });
    try {
      const respostaApi = await firstValueFrom(
        this.http.post<any>('/api/ocr', {
          fileName: arquivo.name,
          mimeType: this.obterTipoMime(arquivo),
          data: dadosBase64
        }, { headers: cabecalhos }).pipe(timeout(60000))
      );

      return {
        titulo: respostaApi.title || respostaApi.titulo || 'Documento Lido',
        title: respostaApi.title || respostaApi.titulo || 'Documento Lido',
        categoria: respostaApi.category || respostaApi.categoria || 'Alvará',
        category: respostaApi.category || respostaApi.categoria || 'Alvará',
        orgaoEmissor: respostaApi.issuingBody || respostaApi.orgaoEmissor || 'Órgão Emissor',
        issuingBody: respostaApi.issuingBody || respostaApi.orgaoEmissor || 'Órgão Emissor',
        numeroDocumento: respostaApi.documentNumber || respostaApi.numeroDocumento || '',
        documentNumber: respostaApi.documentNumber || respostaApi.numeroDocumento || '',
        dataEmissao: respostaApi.issueDate || respostaApi.dataEmissao || '',
        issueDate: respostaApi.issueDate || respostaApi.dataEmissao || '',
        dataVencimento: respostaApi.expirationDate || respostaApi.dataVencimento || '',
        expirationDate: respostaApi.expirationDate || respostaApi.dataVencimento || '',
        estimativaCustoRenovacao: Number(respostaApi.renewalCostEstimate || respostaApi.estimativaCustoRenovacao || 0),
        renewalCostEstimate: Number(respostaApi.renewalCostEstimate || respostaApi.estimativaCustoRenovacao || 0),
        estimativaMultaVencida: Number(respostaApi.estimatedFineIfExpired || respostaApi.estimativaMultaVencida || 0),
        estimatedFineIfExpired: Number(respostaApi.estimatedFineIfExpired || respostaApi.estimativaMultaVencida || 0),
        nomeAtivoVinculado: respostaApi.linkedAssetName || respostaApi.nomeAtivoVinculado || '',
        linkedAssetName: respostaApi.linkedAssetName || respostaApi.nomeAtivoVinculado || '',
        notaRequisitoLegal: respostaApi.legalRequirementNote || respostaApi.notaRequisitoLegal || '',
        legalRequirementNote: respostaApi.legalRequirementNote || respostaApi.notaRequisitoLegal || '',
        origemIa: Boolean(respostaApi.fromAi ?? true),
        fromAi: Boolean(respostaApi.fromAi ?? true)
      };
    } catch (erro: any) {
      if (erro?.name === 'TimeoutError') {
        throw new Error('Tempo limite excedido. Tente novamente com um arquivo menor.');
      }
      throw new Error(erro?.error?.message || 'Não foi possível processar o documento. Tente novamente.');
    }
  }

  async extractFromFile(file: File): Promise<ResultadoOcr> {
    return this.extrairDeArquivo(file);
  }

  private arquivoParaBase64(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve((leitor.result as string).split(',')[1]);
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
  }

  private obterTipoMime(arquivo: File): string {
    const extensao = arquivo.name.toLowerCase().split('.').pop();
    const mapaMime: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png'
    };
    return mapaMime[extensao || ''] || arquivo.type || 'application/pdf';
  }
}

export const GeminiOcrService = ServicoGeminiOcr;
