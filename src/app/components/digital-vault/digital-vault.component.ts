import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { GeminiOcrService } from '../../core/services/gemini-ocr.service';
import { LicenseDocument, ComplianceStatus } from '../../core/models/types';

@Component({
  selector: 'app-digital-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './digital-vault.component.html',
  styleUrls: ['./digital-vault.component.css']
})
export class DigitalVaultComponent {
  readonly service = inject(LicenfyService);
  readonly gemini = inject(GeminiOcrService);

  readonly licenses = this.service.filteredLicenses;
  readonly branches = this.service.branches;

  // Estado do OCR
  readonly isScanning = signal<boolean>(false);
  readonly scanStep = signal<string>('');
  readonly scannedSuccess = signal<boolean>(false);
  readonly uploadedFileName = signal<string>('');
  readonly selectedHistoryDocument = signal<LicenseDocument | null>(null);
  readonly ocrError = signal<string>('');
  readonly usedRealAi = signal<boolean>(false);

  // Configuração da chave Gemini
  readonly showApiKeyInput = signal<boolean>(false);
  geminiKeyInput = '';

  // Formulário de Extração
  extractedData = {
    title: 'Alvará de Licença e Localização - 2026/2027',
    category: 'Alvará' as 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros',
    issuingBody: 'Prefeitura Municipal - Secretaria de Finanças',
    documentNumber: 'ALV-EXT-2026-9041',
    branchId: 'sp-matriz',
    issueDate: '2026-09-15',
    expirationDate: '2027-09-15',
    renewalCostEstimate: 1850,
    estimatedFineIfExpired: 35000,
    linkedAssetName: 'Nenhum ativo direto',
    legalRequirementNote: 'Aguardando extração via OCR.'
  };

  searchTerm = signal<string>('');
  filterCategory = signal<string>('all');

  get filteredList(): LicenseDocument[] {
    return this.licenses().filter(l => {
      const matchSearch = l.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                          l.documentNumber.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                          l.issuingBody.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchCat = this.filterCategory() === 'all' || l.category === this.filterCategory();
      return matchSearch && matchCat;
    });
  }

  isGeminiConfigured(): boolean {
    return this.gemini.isConfigured();
  }

  saveGeminiKey() {
    if (this.geminiKeyInput.trim()) {
      this.gemini.setApiKey(this.geminiKeyInput.trim());
      this.geminiKeyInput = '';
      this.showApiKeyInput.set(false);
    }
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadedFileName.set(file.name);
    this.ocrError.set('');
    this.usedRealAi.set(false);
    this.isScanning.set(true);
    this.scannedSuccess.set(false);

    if (this.gemini.isConfigured()) {
      // OCR REAL com Gemini Vision
      this.scanStep.set('Enviando documento para Gemini Vision AI...');
      try {
        setTimeout(() => {
          if (this.isScanning()) this.scanStep.set('Extraindo campos: órgão emissor, datas, CNPJ...');
        }, 1500);
        setTimeout(() => {
          if (this.isScanning()) this.scanStep.set('Validando conformidade regulatória...');
        }, 4000);

        const result = await this.gemini.extractFromFile(file);

        this.extractedData = {
          title: result.title,
          category: result.category,
          issuingBody: result.issuingBody,
          documentNumber: result.documentNumber,
          branchId: this.extractedData.branchId,
          issueDate: result.issueDate,
          expirationDate: result.expirationDate,
          renewalCostEstimate: result.renewalCostEstimate,
          estimatedFineIfExpired: result.estimatedFineIfExpired,
          linkedAssetName: result.linkedAssetName,
          legalRequirementNote: result.legalRequirementNote
        };

        this.usedRealAi.set(true);
        this.isScanning.set(false);
        this.scannedSuccess.set(true);
      } catch (err: any) {
        this.isScanning.set(false);
        this.ocrError.set(err?.message || 'Erro ao processar com Gemini. Verifique sua chave API.');
        this.scannedSuccess.set(false);
      }
    } else {
      // Fallback: simulação (sem chave Gemini)
      this.simulateOcrUpload('alvara');
    }
  }

  // Simulação mantida como fallback
  simulateOcrUpload(sampleType: 'alvara' | 'bombeiros' | 'sanitaria') {
    this.isScanning.set(true);
    this.scannedSuccess.set(false);
    this.ocrError.set('');
    this.usedRealAi.set(false);
    this.scanStep.set('1/3: Processando arquivo e aplicando OCR óptico...');

    if (sampleType === 'alvara') {
      this.extractedData = { title: 'Alvará de Funcionamento e Localização', category: 'Alvará', issuingBody: 'Prefeitura de São Paulo - Subprefeitura Sé', documentNumber: 'ALV-PMSP-2026-8819', branchId: 'sp-matriz', issueDate: '2026-09-01', expirationDate: '2027-09-01', renewalCostEstimate: 1600, estimatedFineIfExpired: 30000, linkedAssetName: 'Nenhum ativo direto', legalRequirementNote: 'OCR detectou: Inscrição Municipal 4.819.002-1 com atividade compatível.' };
    } else if (sampleType === 'bombeiros') {
      this.extractedData = { title: 'AVCB - Renovação Auto de Vistoria dos Bombeiros', category: 'Bombeiros', issuingBody: 'Corpo de Bombeiros Militar do Estado de SP', documentNumber: 'AVCB-BM-2026-4401', branchId: 'sp-matriz', issueDate: '2026-09-10', expirationDate: '2027-09-10', renewalCostEstimate: 3900, estimatedFineIfExpired: 55000, linkedAssetName: 'Bateria de Extintores e Hidrantes - Bloco A e B', legalRequirementNote: 'OCR detectou: Relação obrigatória com laudo de pressurização e recargas de extintores.' };
    } else {
      this.extractedData = { title: 'Alvará Sanitário de Depósito de Insumos', category: 'Sanitária', issuingBody: 'ANVISA / Vigilância Sanitária Estadual', documentNumber: 'CMVS-SAN-9932-2026', branchId: 'pr-cd', issueDate: '2026-08-20', expirationDate: '2027-08-20', renewalCostEstimate: 2100, estimatedFineIfExpired: 45000, linkedAssetName: 'Chiller de Refrigeração Industrial Trane', legalRequirementNote: 'OCR detectou: Controle térmico contínuo e PMOC de refrigeração obrigatório.' };
    }

    setTimeout(() => { this.scanStep.set('2/3: Extraindo datas de vigência, CNPJ e valores regulatórios...'); }, 1200);
    setTimeout(() => { this.scanStep.set('3/3: Validando conformidade e regras de fiscalização...'); }, 2400);
    setTimeout(() => { this.isScanning.set(false); this.scannedSuccess.set(true); }, 3200);
  }

  saveExtractedDocument() {
    const branch = this.branches().find(b => b.id === this.extractedData.branchId) || this.branches()[0];
    const exp = new Date(this.extractedData.expirationDate);
    const now = new Date();
    const daysRemaining = Math.max(1, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    let status: ComplianceStatus = 'regular';
    if (daysRemaining <= 30) status = 'attention';
    if (daysRemaining <= 7) status = 'urgent';

    const newDoc: LicenseDocument = {
      id: 'lic-' + Date.now(),
      branchId: branch.id,
      branchName: branch.name,
      title: this.extractedData.title,
      category: this.extractedData.category,
      issuingBody: this.extractedData.issuingBody,
      documentNumber: this.extractedData.documentNumber,
      issueDate: this.extractedData.issueDate,
      expirationDate: this.extractedData.expirationDate,
      daysRemaining,
      status,
      renewalCostEstimate: this.extractedData.renewalCostEstimate,
      estimatedFineIfExpired: this.extractedData.estimatedFineIfExpired,
      linkedAssetName: this.extractedData.linkedAssetName === 'Nenhum ativo direto' ? undefined : this.extractedData.linkedAssetName,
      legalRequirementNote: this.extractedData.legalRequirementNote,
      fileName: this.uploadedFileName() || this.extractedData.title.replace(/\s+/g, '_') + '.pdf',
      fileSize: '—',
      ocrExtracted: true,
      dossierIncluded: true,
      versions: [{
        id: 'ver-' + Date.now(), label: 'Versão 1 · vigente', uploadedAt: 'Agora mesmo',
        uploadedBy: 'Usuário Logado',
        fileName: this.uploadedFileName() || this.extractedData.title.replace(/\s+/g, '_') + '.pdf',
        fileSize: '—', status: 'current'
      }]
    };

    this.service.addLicense(newDoc);
    this.uploadedFileName.set('');
    this.scannedSuccess.set(false);
    this.usedRealAi.set(false);
  }

  openHistory(doc: LicenseDocument) { this.selectedHistoryDocument.set(doc); }
  closeHistory() { this.selectedHistoryDocument.set(null); }
}
