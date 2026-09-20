import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
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

  readonly licenses = this.service.filteredLicenses;
  readonly branches = this.service.branches;

  // Estado da Simulação de OCR
  readonly isScanning = signal<boolean>(false);
  readonly scanStep = signal<string>('');
  readonly scannedSuccess = signal<boolean>(false);

  // Formulário de Extração Pré-preenchido
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
    legalRequirementNote: 'Extraído via OCR: Vistoria prévia deferida sem restrições com vigência de 12 meses.'
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

  // Simular processo de IA / OCR
  simulateOcrUpload(sampleType: 'alvara' | 'bombeiros' | 'sanitaria') {
    this.isScanning.set(true);
    this.scannedSuccess.set(false);
    this.scanStep.set('1/3: Processando arquivo e aplicando OCR óptico...');

    if (sampleType === 'alvara') {
      this.extractedData = {
        title: 'Alvará de Funcionamento e Localização',
        category: 'Alvará',
        issuingBody: 'Prefeitura de São Paulo - Subprefeitura Sé',
        documentNumber: 'ALV-PMSP-2026-8819',
        branchId: 'sp-matriz',
        issueDate: '2026-09-01',
        expirationDate: '2027-09-01',
        renewalCostEstimate: 1600,
        estimatedFineIfExpired: 30000,
        linkedAssetName: 'Nenhum ativo direto',
        legalRequirementNote: 'OCR detectou: Inscrição Municipal 4.819.002-1 com atividade compatível.'
      };
    } else if (sampleType === 'bombeiros') {
      this.extractedData = {
        title: 'AVCB - Renovação Auto de Vistoria dos Bombeiros',
        category: 'Bombeiros',
        issuingBody: 'Corpo de Bombeiros Militar do Estado de SP',
        documentNumber: 'AVCB-BM-2026-4401',
        branchId: 'sp-matriz',
        issueDate: '2026-09-10',
        expirationDate: '2027-09-10',
        renewalCostEstimate: 3900,
        estimatedFineIfExpired: 55000,
        linkedAssetName: 'Bateria de Extintores e Hidrantes - Bloco A e B',
        legalRequirementNote: 'OCR detectou: Relação obrigatória com laudo de pressurização e recargas de extintores.'
      };
    } else {
      this.extractedData = {
        title: 'Alvará Sanitário de Depósito de Insumos',
        category: 'Sanitária',
        issuingBody: 'ANVISA / Vigilância Sanitária Estadual',
        documentNumber: 'CMVS-SAN-9932-2026',
        branchId: 'pr-cd',
        issueDate: '2026-08-20',
        expirationDate: '2027-08-20',
        renewalCostEstimate: 2100,
        estimatedFineIfExpired: 45000,
        linkedAssetName: 'Chiller de Refrigeração Industrial Trane',
        legalRequirementNote: 'OCR detectou: Controle térmico contínuo e PMOC de refrigeração obrigatório.'
      };
    }

    setTimeout(() => {
      this.scanStep.set('2/3: Extraindo datas de vigência, CNPJ e valores regulatórios...');
    }, 1200);

    setTimeout(() => {
      this.scanStep.set('3/3: Validando conformidade e regras de fiscalização...');
    }, 2400);

    setTimeout(() => {
      this.isScanning.set(false);
      this.scannedSuccess.set(true);
    }, 3200);
  }

  saveExtractedDocument() {
    const branch = this.branches().find(b => b.id === this.extractedData.branchId) || this.branches()[0];
    
    // Calcular dias restantes fictícios
    const exp = new Date(this.extractedData.expirationDate);
    const now = new Date('2026-09-15');
    const diffTime = exp.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

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
      daysRemaining: daysRemaining,
      status: status,
      renewalCostEstimate: this.extractedData.renewalCostEstimate,
      estimatedFineIfExpired: this.extractedData.estimatedFineIfExpired,
      linkedAssetName: this.extractedData.linkedAssetName === 'Nenhum ativo direto' ? undefined : this.extractedData.linkedAssetName,
      legalRequirementNote: this.extractedData.legalRequirementNote,
      fileName: this.extractedData.title.replace(/\s+/g, '_') + '.pdf',
      fileSize: '1.8 MB',
      ocrExtracted: true,
      dossierIncluded: true
    };

    this.service.addLicense(newDoc);
    this.scannedSuccess.set(false);
    alert('Documento arquivado com sucesso no Cofre Digital!');
  }
}
