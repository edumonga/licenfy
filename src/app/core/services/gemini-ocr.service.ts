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

@Injectable({ providedIn: 'root' })
export class GeminiOcrService {
  constructor(private readonly http: HttpClient) {}

  async extractFromFile(file: File): Promise<OcrResult> {
    const data = await this.fileToBase64(file);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    try {
      return await firstValueFrom(this.http.post<OcrResult>('/api/ocr', {
        fileName: file.name, mimeType: this.getMimeType(file), data
      }, { headers }).pipe(timeout(60000)));
    } catch (err: any) {
      if (err?.name === 'TimeoutError') throw new Error('Tempo limite excedido. Tente novamente com um arquivo menor.');
      throw new Error(err?.error?.message || 'Não foi possível processar o documento. Tente novamente.');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getMimeType(file: File): string {
    const ext = file.name.toLowerCase().split('.').pop();
    const map: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
    return map[ext || ''] || file.type || 'application/pdf';
  }
}
