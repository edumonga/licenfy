import { Injectable, signal, computed } from '@angular/core';
import {
  Unidade,
  DocumentoLicenca,
  AtivoFisico,
  RegraNotificacao,
  RegistroNotificacao,
  MetricaRoi,
  StatusConformidade,
  ItemHistoricoDossie,
  Branch,
  LicenseDocument,
  PhysicalAsset,
  NotificationRule,
  NotificationLog,
  RoiMetric,
  DossierHistoryItem
} from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ServicoLicenfy {
  readonly visaoAtual = signal<'landing' | 'auth' | 'app'>('landing');
  readonly currentView = this.visaoAtual;

  readonly modoAutenticacao = signal<'login' | 'signup'>('login');
  readonly authMode = this.modoAutenticacao;

  readonly unidadeSelecionadaId = signal<string>('all');
  readonly selectedBranchId = this.unidadeSelecionadaId;

  readonly abaAtual = signal<'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi'>('dashboard');
  readonly currentTab = this.abaAtual;

  definirVisao(visao: 'landing' | 'auth' | 'app') {
    this.visaoAtual.set(visao);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  setView(v: 'landing' | 'auth' | 'app') { this.definirVisao(v); }

  definirModoAutenticacao(modo: 'login' | 'signup') {
    this.modoAutenticacao.set(modo);
  }
  setAuthMode(m: 'login' | 'signup') { this.definirModoAutenticacao(m); }

  abrirLogin() {
    this.modoAutenticacao.set('login');
    this.definirVisao('auth');
  }
  openLogin() { this.abrirLogin(); }

  abrirCadastro() {
    this.modoAutenticacao.set('signup');
    this.definirVisao('auth');
  }
  openSignup() { this.abrirCadastro(); }

  readonly unidades = signal<Unidade[]>([
    {
      id: 'sp-matriz',
      nome: 'Matriz São Paulo',
      name: 'Matriz São Paulo',
      cnpj: '12.345.678/0001-90',
      cidade: 'São Paulo',
      city: 'São Paulo',
      estado: 'SP',
      state: 'SP',
      razaoSocial: 'Grupo Alpha Brasil S.A.',
      companyName: 'Grupo Alpha Brasil S.A.',
      endereco: 'Av. Paulista, 1250, Bela Vista, São Paulo - SP, 01310-100',
      address: 'Av. Paulista, 1250, Bela Vista, São Paulo - SP, 01310-100',
      gerenteResponsavel: 'Mariana Silveira (Jurídico & Compliance)',
      responsibleManager: 'Mariana Silveira (Jurídico & Compliance)',
      responsaveis: [
        { id: 'resp-sp-1', nome: 'Mariana Silveira', name: 'Mariana Silveira', cargo: 'Jurídico & Compliance', role: 'Jurídico & Compliance', email: 'mariana@grupoalpha.com.br', telefone: '+55 11 98877-6655', phone: '+55 11 98877-6655', principal: true, primary: true },
        { id: 'resp-sp-2', nome: 'Rafael Moura', name: 'Rafael Moura', cargo: 'Facilities', role: 'Facilities', email: 'rafael.moura@grupoalpha.com.br', telefone: '+55 11 98810-4421', phone: '+55 11 98810-4421' }
      ],
      pontuacaoConformidade: 94,
      complianceScore: 94,
      status: 'regular',
      contagemLicencas: { total: 12, regular: 10, atencao: 2, urgente: 0, attention: 2, urgent: 0 },
      licensesCount: { total: 12, regular: 10, attention: 2, urgent: 0 },
      contagemAtivos: { total: 48, comGarantiaAtiva: 31, manutencaoPendente: 1, withActiveWarranty: 31, maintenancePending: 1 },
      assetsCount: { total: 48, withActiveWarranty: 31, maintenancePending: 1 }
    },
    {
      id: 'rj-filial',
      nome: 'Filial Rio de Janeiro',
      name: 'Filial Rio de Janeiro',
      cnpj: '12.345.678/0002-71',
      cidade: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
      estado: 'RJ',
      state: 'RJ',
      razaoSocial: 'Grupo Alpha Brasil S.A.',
      companyName: 'Grupo Alpha Brasil S.A.',
      endereco: 'Rua do Ouvidor, 86, Centro, Rio de Janeiro - RJ, 20040-030',
      address: 'Rua do Ouvidor, 86, Centro, Rio de Janeiro - RJ, 20040-030',
      gerenteResponsavel: 'Carlos Eduardo Mendes (Operações RJ)',
      responsibleManager: 'Carlos Eduardo Mendes (Operações RJ)',
      responsaveis: [
        { id: 'resp-rj-1', nome: 'Carlos Eduardo Mendes', name: 'Carlos Eduardo Mendes', cargo: 'Operações RJ', role: 'Operações RJ', email: 'carlos.mendes@grupoalpha.com.br', telefone: '+55 21 99123-4567', phone: '+55 21 99123-4567', principal: true, primary: true },
        { id: 'resp-rj-2', nome: 'Ana Ribeiro', name: 'Ana Ribeiro', cargo: 'Administrativo local', role: 'Administrativo local', email: 'ana.ribeiro@grupoalpha.com.br', telefone: '+55 21 99222-9120', phone: '+55 21 99222-9120' }
      ],
      pontuacaoConformidade: 78,
      complianceScore: 78,
      status: 'attention',
      contagemLicencas: { total: 9, regular: 6, atencao: 2, urgente: 1, attention: 2, urgent: 1 },
      licensesCount: { total: 9, regular: 6, attention: 2, urgent: 1 },
      contagemAtivos: { total: 26, comGarantiaAtiva: 14, manutencaoPendente: 3, withActiveWarranty: 14, maintenancePending: 3 },
      assetsCount: { total: 26, withActiveWarranty: 14, maintenancePending: 3 }
    },
    {
      id: 'pr-cd',
      nome: 'Centro de Distribuição Curitiba',
      name: 'Centro de Distribuição Curitiba',
      cnpj: '12.345.678/0003-52',
      cidade: 'Curitiba',
      city: 'Curitiba',
      estado: 'PR',
      state: 'PR',
      razaoSocial: 'Grupo Alpha Brasil S.A.',
      companyName: 'Grupo Alpha Brasil S.A.',
      endereco: 'Rod. BR-116, km 110, Tatuquara, Curitiba - PR, 81950-000',
      address: 'Rod. BR-116, km 110, Tatuquara, Curitiba - PR, 81950-000',
      gerenteResponsavel: 'Fernanda Becker (Logística & Facilities)',
      responsibleManager: 'Fernanda Becker (Logística & Facilities)',
      responsaveis: [
        { id: 'resp-pr-1', nome: 'Fernanda Becker', name: 'Fernanda Becker', cargo: 'Logística & Facilities', role: 'Logística & Facilities', email: 'fernanda.becker@grupoalpha.com.br', telefone: '+55 41 98234-5678', phone: '+55 41 98234-5678', principal: true, primary: true },
        { id: 'resp-pr-2', nome: 'Diego Lopes', name: 'Diego Lopes', cargo: 'Segurança do Trabalho', role: 'Segurança do Trabalho', email: 'diego.lopes@grupoalpha.com.br', telefone: '+55 41 98910-0821', phone: '+55 41 98910-0821' }
      ],
      pontuacaoConformidade: 65,
      complianceScore: 65,
      status: 'urgent',
      contagemLicencas: { total: 14, regular: 8, atencao: 3, urgente: 3, attention: 3, urgent: 3 },
      licensesCount: { total: 14, regular: 8, attention: 3, urgent: 3 },
      contagemAtivos: { total: 62, comGarantiaAtiva: 39, manutencaoPendente: 5, withActiveWarranty: 39, maintenancePending: 5 },
      assetsCount: { total: 62, withActiveWarranty: 39, maintenancePending: 5 }
    }
  ]);
  readonly branches = this.unidades;

  readonly licencas = signal<DocumentoLicenca[]>([
    {
      id: 'lic-001',
      unidadeId: 'sp-matriz',
      branchId: 'sp-matriz',
      nomeUnidade: 'Matriz São Paulo',
      branchName: 'Matriz São Paulo',
      titulo: 'Alvará de Funcionamento e Localização',
      title: 'Alvará de Funcionamento e Localização',
      categoria: 'Alvará',
      category: 'Alvará',
      orgaoEmissor: 'Prefeitura Municipal de São Paulo',
      issuingBody: 'Prefeitura Municipal de São Paulo',
      numeroDocumento: 'ALV-2024-99812-SP',
      documentNumber: 'ALV-2024-99812-SP',
      dataEmissao: '2024-03-10',
      issueDate: '2024-03-10',
      dataVencimento: '2027-03-10',
      expirationDate: '2027-03-10',
      diasRestantes: 540,
      daysRemaining: 540,
      status: 'regular',
      estimativaCustoRenovacao: 1450,
      renewalCostEstimate: 1450,
      estimativaMultaVencida: 25000,
      estimatedFineIfExpired: 25000,
      notaRequisitoLegal: 'Obrigatório para livre operação comercial e abertura das instalações.',
      legalRequirementNote: 'Obrigatório para livre operação comercial e abertura das instalações.',
      nomeArquivo: 'Alvara_SP_Matriz_2024.pdf',
      fileName: 'Alvara_SP_Matriz_2024.pdf',
      tamanhoArquivo: '1.4 MB',
      fileSize: '1.4 MB',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true
    },
    {
      id: 'lic-002',
      unidadeId: 'sp-matriz',
      branchId: 'sp-matriz',
      nomeUnidade: 'Matriz São Paulo',
      branchName: 'Matriz São Paulo',
      titulo: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      title: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      categoria: 'Bombeiros',
      category: 'Bombeiros',
      orgaoEmissor: 'Corpo de Bombeiros da PMESP',
      issuingBody: 'Corpo de Bombeiros da PMESP',
      numeroDocumento: 'AVCB-SP-88319-2025',
      documentNumber: 'AVCB-SP-88319-2025',
      dataEmissao: '2025-01-15',
      issueDate: '2025-01-15',
      dataVencimento: '2026-10-10',
      expirationDate: '2026-10-10',
      diasRestantes: 25,
      daysRemaining: 25,
      status: 'attention',
      estimativaCustoRenovacao: 4200,
      renewalCostEstimate: 4200,
      estimativaMultaVencida: 65000,
      estimatedFineIfExpired: 65000,
      ativoVinculadoId: 'ast-003',
      linkedAssetId: 'ast-003',
      nomeAtivoVinculado: 'Bateria de Extintores e Hidrantes - Bloco A e B',
      linkedAssetName: 'Bateria de Extintores e Hidrantes - Bloco A e B',
      notaRequisitoLegal: 'A renovação do AVCB exige atestado de recarga e teste hidrostático da bateria de extintores.',
      legalRequirementNote: 'A renovação do AVCB exige atestado de recarga e teste hidrostático da bateria de extintores.',
      nomeArquivo: 'AVCB_Matriz_PMESP_2025.pdf',
      fileName: 'AVCB_Matriz_PMESP_2025.pdf',
      tamanhoArquivo: '2.8 MB',
      fileSize: '2.8 MB',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true
    },
    {
      id: 'lic-003',
      unidadeId: 'pr-cd',
      branchId: 'pr-cd',
      nomeUnidade: 'Centro de Distribuição Curitiba',
      branchName: 'Centro de Distribuição Curitiba',
      titulo: 'Licença Sanitária (CMVS)',
      title: 'Licença Sanitária (CMVS)',
      categoria: 'Sanitária',
      category: 'Sanitária',
      orgaoEmissor: 'Vigilância Sanitária Municipal (SMS Curitiba)',
      issuingBody: 'Vigilância Sanitária Municipal (SMS Curitiba)',
      numeroDocumento: 'LS-CTBA-4412-2025',
      documentNumber: 'LS-CTBA-4412-2025',
      dataEmissao: '2025-09-20',
      issueDate: '2025-09-20',
      dataVencimento: '2026-09-22',
      expirationDate: '2026-09-22',
      diasRestantes: 6,
      daysRemaining: 6,
      status: 'urgent',
      estimativaCustoRenovacao: 1200,
      renewalCostEstimate: 1200,
      estimativaMultaVencida: 40000,
      estimatedFineIfExpired: 40000,
      notaRequisitoLegal: 'Fiscalização iminente. Risco de interdição total do setor de estocagem de produtos controlados.',
      legalRequirementNote: 'Fiscalização iminente. Risco de interdição total do setor de estocagem de produtos controlados.',
      nomeArquivo: 'Licenca_Sanitaria_Curitiba_2025.pdf',
      fileName: 'Licenca_Sanitaria_Curitiba_2025.pdf',
      tamanhoArquivo: '950 KB',
      fileSize: '950 KB',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true
    },
    {
      id: 'lic-004',
      unidadeId: 'pr-cd',
      branchId: 'pr-cd',
      nomeUnidade: 'Centro de Distribuição Curitiba',
      branchName: 'Centro de Distribuição Curitiba',
      titulo: 'Licença de Operação Ambiental (LO)',
      title: 'Licença de Operação Ambiental (LO)',
      categoria: 'Ambiental',
      category: 'Ambiental',
      orgaoEmissor: 'Instituto Água e Terra (IAT Paraná)',
      issuingBody: 'Instituto Água e Terra (IAT Paraná)',
      numeroDocumento: 'LO-IAT-PR-7762',
      documentNumber: 'LO-IAT-PR-7762',
      dataEmissao: '2025-05-12',
      issueDate: '2025-05-12',
      dataVencimento: '2027-05-12',
      expirationDate: '2027-05-12',
      diasRestantes: 605,
      daysRemaining: 605,
      status: 'regular',
      estimativaCustoRenovacao: 8900,
      renewalCostEstimate: 8900,
      estimativaMultaVencida: 180000,
      estimatedFineIfExpired: 180000,
      nomeArquivo: 'LO_IAT_Curitiba_Ambiental.pdf',
      fileName: 'LO_IAT_Curitiba_Ambiental.pdf',
      tamanhoArquivo: '3.2 MB',
      fileSize: '3.2 MB',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true
    },
    {
      id: 'lic-005',
      unidadeId: 'rj-filial',
      branchId: 'rj-filial',
      nomeUnidade: 'Filial Rio de Janeiro',
      branchName: 'Filial Rio de Janeiro',
      titulo: 'Laudo Técnico de Inspeção Predial e SPDA (Para-raios)',
      title: 'Laudo Técnico de Inspeção Predial e SPDA (Para-raios)',
      categoria: 'Segurança do Trabalho',
      category: 'Segurança do Trabalho',
      orgaoEmissor: 'CREA-RJ / Engenharia Especializada',
      issuingBody: 'CREA-RJ / Engenharia Especializada',
      numeroDocumento: 'ART-CREA-RJ-2025-1029',
      documentNumber: 'ART-CREA-RJ-2025-1029',
      dataEmissao: '2025-02-18',
      issueDate: '2025-02-18',
      dataVencimento: '2026-10-05',
      expirationDate: '2026-10-05',
      diasRestantes: 20,
      daysRemaining: 20,
      status: 'attention',
      estimativaCustoRenovacao: 3600,
      renewalCostEstimate: 3600,
      estimativaMultaVencida: 18000,
      estimatedFineIfExpired: 18000,
      ativoVinculadoId: 'ast-001',
      linkedAssetId: 'ast-001',
      nomeAtivoVinculado: 'Gerador de Emergência Stemac 180kVA',
      linkedAssetName: 'Gerador de Emergência Stemac 180kVA',
      notaRequisitoLegal: 'Interdependência com aterramento e gerador de suporte a emergências.',
      legalRequirementNote: 'Interdependência com aterramento e gerador de suporte a emergências.',
      nomeArquivo: 'Laudo_SPDA_Predial_RJ.pdf',
      fileName: 'Laudo_SPDA_Predial_RJ.pdf',
      tamanhoArquivo: '1.9 MB',
      fileSize: '1.9 MB',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true
    },
    {
      id: 'lic-006',
      unidadeId: 'rj-filial',
      branchId: 'rj-filial',
      nomeUnidade: 'Filial Rio de Janeiro',
      branchName: 'Filial Rio de Janeiro',
      titulo: 'Certificado de Conformidade Sanitária e Qualidade da Água',
      title: 'Certificado de Conformidade Sanitária e Qualidade da Água',
      categoria: 'Sanitária',
      category: 'Sanitária',
      orgaoEmissor: 'Subvisa Rio de Janeiro',
      issuingBody: 'Subvisa Rio de Janeiro',
      numeroDocumento: 'SUBVISA-RJ-9901',
      documentNumber: 'SUBVISA-RJ-9901',
      dataEmissao: '2026-01-10',
      issueDate: '2026-01-10',
      dataVencimento: '2027-01-10',
      expirationDate: '2027-01-10',
      diasRestantes: 116,
      daysRemaining: 116,
      status: 'regular',
      estimativaCustoRenovacao: 950,
      renewalCostEstimate: 950,
      estimativaMultaVencida: 15000,
      estimatedFineIfExpired: 15000,
      nomeArquivo: 'Qualidade_Agua_Subvisa_RJ.pdf',
      fileName: 'Qualidade_Agua_Subvisa_RJ.pdf',
      tamanhoArquivo: '820 KB',
      fileSize: '820 KB',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true
    }
  ]);
  readonly licenses = this.licencas;

  readonly ativos = signal<AtivoFisico[]>([
    {
      id: 'ast-001',
      etiquetaPatrimonio: 'EQ-0821',
      assetTag: 'EQ-0821',
      valorQrCode: 'https://licenfy.vercel.app/asset/EQ-0821',
      qrCodeValue: 'https://licenfy.vercel.app/asset/EQ-0821',
      nome: 'Gerador Diesel de Emergência Stemac 180kVA',
      name: 'Gerador Diesel de Emergência Stemac 180kVA',
      categoria: 'Geradores',
      category: 'Geradores',
      unidadeId: 'rj-filial',
      branchId: 'rj-filial',
      nomeUnidade: 'Filial Rio de Janeiro',
      branchName: 'Filial Rio de Janeiro',
      detalhesLocalizacao: 'Subsolo 1 - Sala Técnica de Energia',
      locationDetails: 'Subsolo 1 - Sala Técnica de Energia',
      marcaModelo: 'Stemac Cummins QSB7-G5',
      brandModel: 'Stemac Cummins QSB7-G5',
      numeroSerie: 'SN-STM-2024-9981',
      serialNumber: 'SN-STM-2024-9981',
      numeroNotaFiscal: 'NF-e 004.891 / Série 1',
      invoiceNumber: 'NF-e 004.891 / Série 1',
      dataAquisicao: '2024-04-10',
      purchaseDate: '2024-04-10',
      dataFimGarantia: '2026-10-25',
      warrantyExpirationDate: '2026-10-25',
      garantiaAtiva: true,
      isWarrantyActive: true,
      diasAteFimGarantia: 40,
      daysUntilWarrantyExpires: 40,
      dataUltimaManutencao: '2026-07-15',
      lastMaintenanceDate: '2026-07-15',
      dataProximaManutencao: '2026-10-15',
      nextMaintenanceDate: '2026-10-15',
      statusManutencao: 'attention',
      maintenanceStatus: 'attention',
      licencaVinculadaId: 'lic-005',
      linkedLicenseId: 'lic-005',
      licencaVinculadaTitulo: 'Laudo Técnico Predial e SPDA',
      linkedLicenseTitle: 'Laudo Técnico Predial e SPDA',
      manutencoes: [
        {
          id: 'mnt-01',
          data: '2026-07-15',
          date: '2026-07-15',
          tipo: 'Preventiva',
          type: 'Preventiva',
          tecnicoOuEmpresa: 'Stemac Manutenções Autorizada',
          technicianOrCompany: 'Stemac Manutenções Autorizada',
          observacoes: 'Troca de filtros de óleo e diesel, teste de partida automática em 4.2 segundos com carga.',
          notes: 'Troca de filtros de óleo e diesel, teste de partida automática em 4.2 segundos com carga.',
          proximaData: '2026-10-15',
          nextScheduledDate: '2026-10-15',
          economiaGarantia: 3200,
          costSavedByWarranty: 3200
        },
        {
          id: 'mnt-02',
          data: '2026-01-20',
          date: '2026-01-20',
          tipo: 'Inspeção',
          type: 'Inspeção',
          tecnicoOuEmpresa: 'Equipe Própria de Facilities',
          technicianOrCompany: 'Equipe Própria de Facilities',
          observacoes: 'Nível de combustível 100%, bateria em 26.8V, sem vazamentos.',
          notes: 'Nível de combustível 100%, bateria em 26.8V, sem vazamentos.',
          proximaData: '2026-07-15',
          nextScheduledDate: '2026-07-15'
        }
      ],
      maintenances: []
    },
    {
      id: 'ast-002',
      etiquetaPatrimonio: 'EQ-0450',
      assetTag: 'EQ-0450',
      valorQrCode: 'https://licenfy.vercel.app/asset/EQ-0450',
      qrCodeValue: 'https://licenfy.vercel.app/asset/EQ-0450',
      nome: 'Sistema de Climatização Central VRF Daikin 30HP',
      name: 'Sistema de Climatização Central VRF Daikin 30HP',
      categoria: 'Climatização',
      category: 'Climatização',
      unidadeId: 'sp-matriz',
      branchId: 'sp-matriz',
      nomeUnidade: 'Matriz São Paulo',
      branchName: 'Matriz São Paulo',
      detalhesLocalizacao: 'Cobertura Técnica - Prédio Administrativo',
      locationDetails: 'Cobertura Técnica - Prédio Administrativo',
      marcaModelo: 'Daikin VRV IV-S Heat Pump',
      brandModel: 'Daikin VRV IV-S Heat Pump',
      numeroSerie: 'DKN-VRV-2023-8871',
      serialNumber: 'DKN-VRV-2023-8871',
      numeroNotaFiscal: 'NF-e 019.231 / Série 2',
      invoiceNumber: 'NF-e 019.231 / Série 2',
      dataAquisicao: '2023-11-20',
      purchaseDate: '2023-11-20',
      dataFimGarantia: '2026-11-20',
      warrantyExpirationDate: '2026-11-20',
      garantiaAtiva: true,
      isWarrantyActive: true,
      diasAteFimGarantia: 66,
      daysUntilWarrantyExpires: 66,
      dataUltimaManutencao: '2026-08-01',
      lastMaintenanceDate: '2026-08-01',
      dataProximaManutencao: '2026-11-01',
      nextMaintenanceDate: '2026-11-01',
      statusManutencao: 'regular',
      maintenanceStatus: 'regular',
      manutencoes: [
        {
          id: 'mnt-03',
          data: '2026-08-01',
          date: '2026-08-01',
          tipo: 'Preventiva',
          type: 'Preventiva',
          tecnicoOuEmpresa: 'Daikin Service Brasil',
          technicianOrCompany: 'Daikin Service Brasil',
          observacoes: 'Higienização química das serpentinas, calibragem de sondas e medição de gás refrigerante R410A.',
          notes: 'Higienização química das serpentinas, calibragem de sondas e medição de gás refrigerante R410A.',
          proximaData: '2026-11-01',
          nextScheduledDate: '2026-11-01',
          economiaGarantia: 4800,
          costSavedByWarranty: 4800
        }
      ],
      maintenances: []
    },
    {
      id: 'ast-003',
      etiquetaPatrimonio: 'EQ-0199',
      assetTag: 'EQ-0199',
      valorQrCode: 'https://licenfy.vercel.app/asset/EQ-0199',
      qrCodeValue: 'https://licenfy.vercel.app/asset/EQ-0199',
      nome: 'Bateria de Extintores e Hidrantes - Bloco A e B',
      name: 'Bateria de Extintores e Hidrantes - Bloco A e B',
      categoria: 'Extintores',
      category: 'Extintores',
      unidadeId: 'sp-matriz',
      branchId: 'sp-matriz',
      nomeUnidade: 'Matriz São Paulo',
      branchName: 'Matriz São Paulo',
      detalhesLocalizacao: 'Corredores Centrais, Escadas de Emergência e Hall',
      locationDetails: 'Corredores Centrais, Escadas de Emergência e Hall',
      marcaModelo: 'Mocelin / Extinpar PQS 12kg e CO2 6kg (Total 28 un.)',
      brandModel: 'Mocelin / Extinpar PQS 12kg e CO2 6kg (Total 28 un.)',
      numeroSerie: 'LOT-EXT-2025-01',
      serialNumber: 'LOT-EXT-2025-01',
      numeroNotaFiscal: 'NF-e 007.410 / Série 1',
      invoiceNumber: 'NF-e 007.410 / Série 1',
      dataAquisicao: '2025-01-10',
      purchaseDate: '2025-01-10',
      dataFimGarantia: '2026-10-01',
      warrantyExpirationDate: '2026-10-01',
      garantiaAtiva: true,
      isWarrantyActive: true,
      diasAteFimGarantia: 16,
      daysUntilWarrantyExpires: 16,
      dataUltimaManutencao: '2025-10-01',
      lastMaintenanceDate: '2025-10-01',
      dataProximaManutencao: '2026-09-30',
      nextMaintenanceDate: '2026-09-30',
      statusManutencao: 'urgent',
      maintenanceStatus: 'urgent',
      licencaVinculadaId: 'lic-002',
      linkedLicenseId: 'lic-002',
      licencaVinculadaTitulo: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      linkedLicenseTitle: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      manutencoes: [
        {
          id: 'mnt-04',
          data: '2025-10-01',
          date: '2025-10-01',
          tipo: 'Recarga',
          type: 'Recarga',
          tecnicoOuEmpresa: 'Comercial de Extintores Paulistana Ltda',
          technicianOrCompany: 'Comercial de Extintores Paulistana Ltda',
          observacoes: 'Recarga anual e colocação do anel de identificação INMETRO cor azul.',
          notes: 'Recarga anual e colocação do anel de identificação INMETRO cor azul.',
          proximaData: '2026-09-30',
          nextScheduledDate: '2026-09-30',
          economiaGarantia: 0,
          costSavedByWarranty: 0
        }
      ],
      maintenances: []
    },
    {
      id: 'ast-004',
      etiquetaPatrimonio: 'EQ-0904',
      assetTag: 'EQ-0904',
      valorQrCode: 'https://licenfy.vercel.app/asset/EQ-0904',
      qrCodeValue: 'https://licenfy.vercel.app/asset/EQ-0904',
      nome: 'Chiller de Refrigeração Industrial Trane 120TR',
      name: 'Chiller de Refrigeração Industrial Trane 120TR',
      categoria: 'Climatização',
      category: 'Climatização',
      unidadeId: 'pr-cd',
      branchId: 'pr-cd',
      nomeUnidade: 'Centro de Distribuição Curitiba',
      branchName: 'Centro de Distribuição Curitiba',
      detalhesLocalizacao: 'Galpão Frio B - Sala de Máquinas Primária',
      locationDetails: 'Galpão Frio B - Sala de Máquinas Primária',
      marcaModelo: 'Trane Sintesis RTAF',
      brandModel: 'Trane Sintesis RTAF',
      numeroSerie: 'TRN-2024-3321',
      serialNumber: 'TRN-2024-3321',
      numeroNotaFiscal: 'NF-e 088.192 / Série 3',
      invoiceNumber: 'NF-e 088.192 / Série 3',
      dataAquisicao: '2024-02-14',
      purchaseDate: '2024-02-14',
      dataFimGarantia: '2027-02-14',
      warrantyExpirationDate: '2027-02-14',
      garantiaAtiva: true,
      isWarrantyActive: true,
      diasAteFimGarantia: 516,
      daysUntilWarrantyExpires: 516,
      dataUltimaManutencao: '2026-06-10',
      lastMaintenanceDate: '2026-06-10',
      dataProximaManutencao: '2026-12-10',
      nextMaintenanceDate: '2026-12-10',
      statusManutencao: 'regular',
      maintenanceStatus: 'regular',
      manutencoes: [
        {
          id: 'mnt-05',
          data: '2026-06-10',
          date: '2026-06-10',
          tipo: 'Corretiva',
          type: 'Corretiva',
          tecnicoOuEmpresa: 'Trane Brasil Autorizada',
          technicianOrCompany: 'Trane Brasil Autorizada',
          observacoes: 'Troca de válvula solenóide coberta integralmente pela garantia do fabricante.',
          notes: 'Troca de válvula solenóide coberta integralmente pela garantia do fabricante.',
          proximaData: '2026-12-10',
          nextScheduledDate: '2026-12-10',
          economiaGarantia: 14500,
          costSavedByWarranty: 14500
        }
      ],
      maintenances: []
    }
  ]);
  readonly assets = this.ativos;

  readonly regrasNotificacao = signal<RegraNotificacao[]>([
    {
      id: 'rule-90',
      diasAntesVencimento: 90,
      daysBeforeExpiration: 90,
      canais: ['email'],
      channels: ['email'],
      destinatarios: ['compliance@empresa.com.br', 'facilities@empresa.com.br'],
      recipients: ['compliance@empresa.com.br', 'facilities@empresa.com.br'],
      ativa: true,
      active: true,
      nivelAlerta: 'informativo',
      alertLevel: 'informativo'
    },
    {
      id: 'rule-60',
      diasAntesVencimento: 60,
      daysBeforeExpiration: 60,
      canais: ['email'],
      channels: ['email'],
      destinatarios: ['gerencia.operacoes@empresa.com.br', 'compliance@empresa.com.br'],
      recipients: ['gerencia.operacoes@empresa.com.br', 'compliance@empresa.com.br'],
      ativa: true,
      active: true,
      nivelAlerta: 'alerta',
      alertLevel: 'alerta'
    },
    {
      id: 'rule-30',
      diasAntesVencimento: 30,
      daysBeforeExpiration: 30,
      canais: ['email'],
      channels: ['email'],
      destinatarios: ['diretoria.juridica@empresa.com.br', 'gerente.unidade@empresa.com.br'],
      recipients: ['diretoria.juridica@empresa.com.br', 'gerente.unidade@empresa.com.br'],
      ativa: true,
      active: true,
      nivelAlerta: 'critico',
      alertLevel: 'critico'
    },
    {
      id: 'rule-7',
      diasAntesVencimento: 7,
      daysBeforeExpiration: 7,
      canais: ['email'],
      channels: ['email'],
      destinatarios: ['diretoria.executiva@empresa.com.br', 'compliance.head@empresa.com.br', 'auditoria@empresa.com.br'],
      recipients: ['diretoria.executiva@empresa.com.br', 'compliance.head@empresa.com.br', 'auditoria@empresa.com.br'],
      ativa: true,
      active: true,
      nivelAlerta: 'critico',
      alertLevel: 'critico'
    }
  ]);
  readonly notificationRules = this.regrasNotificacao;

  readonly registrosNotificacao = signal<RegistroNotificacao[]>([
    {
      id: 'log-001',
      horario: 'Hoje, 09:15',
      timestamp: 'Hoje, 09:15',
      canal: 'email',
      channel: 'email',
      destinatario: 'Mariana Silveira (mariana.silveira@empresa.com.br)',
      recipient: 'Mariana Silveira (mariana.silveira@empresa.com.br)',
      nomeLicencaOuAtivo: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      licenseOrAssetName: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      nomeUnidade: 'Matriz São Paulo',
      branchName: 'Matriz São Paulo',
      diasAntes: 25,
      daysBefore: 25,
      status: 'Lido',
      previaMensagem: 'Alerta Licenfy: O AVCB da Matriz SP vence em 25 dias. Ativo associado pendente: Extintores Bloco A/B.',
      messagePreview: 'Alerta Licenfy: O AVCB da Matriz SP vence em 25 dias. Ativo associado pendente: Extintores Bloco A/B.'
    },
    {
      id: 'log-002',
      horario: 'Hoje, 08:30',
      timestamp: 'Hoje, 08:30',
      canal: 'email',
      channel: 'email',
      destinatario: 'Fernanda Becker (fernanda.becker@empresa.com.br)',
      recipient: 'Fernanda Becker (fernanda.becker@empresa.com.br)',
      nomeLicencaOuAtivo: 'Licença Sanitária (CMVS)',
      licenseOrAssetName: 'Licença Sanitária (CMVS)',
      nomeUnidade: 'CD Curitiba',
      branchName: 'CD Curitiba',
      diasAntes: 6,
      daysBefore: 6,
      status: 'Ação Tomada',
      previaMensagem: 'Urgente Licenfy: Licença Sanitária expira em 6 dias. Protocolo de renovação já enviado ao despachante.',
      messagePreview: 'Urgente Licenfy: Licença Sanitária expira em 6 dias. Protocolo de renovação já enviado ao despachante.'
    },
    {
      id: 'log-003',
      horario: 'Ontem, 17:40',
      timestamp: 'Ontem, 17:40',
      canal: 'email',
      channel: 'email',
      destinatario: 'compliance@empresa.com.br',
      recipient: 'compliance@empresa.com.br',
      nomeLicencaOuAtivo: 'Laudo Técnico Predial e SPDA',
      licenseOrAssetName: 'Laudo Técnico Predial e SPDA',
      nomeUnidade: 'Filial Rio de Janeiro',
      branchName: 'Filial Rio de Janeiro',
      diasAntes: 20,
      daysBefore: 20,
      status: 'Entregue',
      previaMensagem: 'Notificação programada: Documento com vencimento próximo cadastrado no alerta de 30 dias.',
      messagePreview: 'Notificação programada: Documento com vencimento próximo cadastrado no alerta de 30 dias.'
    },
    {
      id: 'log-004',
      horario: '14/09/2026, 11:00',
      timestamp: '14/09/2026, 11:00',
      canal: 'email',
      channel: 'email',
      destinatario: 'Carlos Eduardo Mendes (carlos.mendes@empresa.com.br)',
      recipient: 'Carlos Eduardo Mendes (carlos.mendes@empresa.com.br)',
      nomeLicencaOuAtivo: 'Garantia: Gerador Stemac 180kVA',
      licenseOrAssetName: 'Garantia: Gerador Stemac 180kVA',
      nomeUnidade: 'Filial Rio de Janeiro',
      branchName: 'Filial Rio de Janeiro',
      diasAntes: 40,
      daysBefore: 40,
      status: 'Lido',
      previaMensagem: 'Aviso de Garantia: A garantia do Gerador Stemac vence em 40 dias. Agende a revisão sem custo.',
      messagePreview: 'Aviso de Garantia: A garantia do Gerador Stemac vence em 40 dias. Agende a revisão sem custo.'
    }
  ]);
  readonly notificationLogs = this.registrosNotificacao;

  readonly historicoDossie = signal<ItemHistoricoDossie[]>([
    { id: 'dos-001', unidadeId: 'sp-matriz', branchId: 'sp-matriz', nomeUnidade: 'Matriz São Paulo', branchName: 'Matriz São Paulo', geradoEm: '12/09/2026, 09:20', generatedAt: '12/09/2026, 09:20', quantidadeDocumentos: 2, documentCount: 2, codigoVerificacao: 'LCFY-218A-09C3', hash: 'LCFY-218A-09C3' },
    { id: 'dos-002', unidadeId: 'rj-filial', branchId: 'rj-filial', nomeUnidade: 'Filial Rio de Janeiro', branchName: 'Filial Rio de Janeiro', geradoEm: '28/08/2026, 16:42', generatedAt: '28/08/2026, 16:42', quantidadeDocumentos: 2, documentCount: 2, codigoVerificacao: 'LCFY-8FD2-771B', hash: 'LCFY-8FD2-771B' }
  ]);
  readonly dossierHistory = this.historicoDossie;

  readonly dadosRoi = signal<MetricaRoi>({
    totalMultasEvitadas: 135000,
    totalFinesAvoided: 135000,
    economiaGarantias: 48900,
    warrantiesTriggeredSavings: 48900,
    horasOperacionaisPoupadas: 320,
    operationalHoursSaved: 320,
    ganhoFinanceiroTotal: 183900,
    totalFinancialGain: 183900,
    listaMultasEvitadas: [
      {
        tituloLicenca: 'Alvará de Funcionamento e Localização',
        licenseTitle: 'Alvará de Funcionamento e Localização',
        nomeUnidade: 'Matriz São Paulo',
        branchName: 'Matriz São Paulo',
        multaEstimada: 25000,
        estimatedFine: 25000,
        dataEvitada: 'Renovado a 45 dias do prazo',
        preventedDate: 'Renovado a 45 dias do prazo',
        orgaoRegulador: 'Prefeitura SP',
        regulatoryBody: 'Prefeitura SP'
      },
      {
        tituloLicenca: 'Licença de Operação Ambiental - LO',
        licenseTitle: 'Licença de Operação Ambiental - LO',
        nomeUnidade: 'Centro de Distribuição Curitiba',
        branchName: 'Centro de Distribuição Curitiba',
        multaEstimada: 70000,
        estimatedFine: 70000,
        dataEvitada: 'Renovado sem interrupção de pátio',
        preventedDate: 'Renovado sem interrupção de pátio',
        orgaoRegulador: 'IAT Paraná',
        regulatoryBody: 'IAT Paraná'
      },
      {
        tituloLicenca: 'Auto de Vistoria do Corpo de Bombeiros (AVCB)',
        licenseTitle: 'Auto de Vistoria do Corpo de Bombeiros (AVCB)',
        nomeUnidade: 'Filial Rio de Janeiro',
        branchName: 'Filial Rio de Janeiro',
        multaEstimada: 40000,
        estimatedFine: 40000,
        dataEvitada: 'Vistoria aprovada sem auto de infração',
        preventedDate: 'Vistoria aprovada sem auto de infração',
        orgaoRegulador: 'CBMERJ',
        regulatoryBody: 'CBMERJ'
      }
    ],
    listaGarantiasPoupadas: [
      {
        nomeAtivo: 'Chiller Trane 120TR',
        assetName: 'Chiller Trane 120TR',
        nomeUnidade: 'CD Curitiba',
        branchName: 'CD Curitiba',
        pecaOuServico: 'Válvula solenóide + Carga de óleo de compressor',
        partOrService: 'Válvula solenóide + Carga de óleo de compressor',
        valorEconomizado: 14500,
        valueSaved: 14500,
        dataReivindicada: '10/06/2026',
        dateClaimed: '10/06/2026'
      },
      {
        nomeAtivo: 'Gerador Cummins 250kVA',
        assetName: 'Gerador Cummins 250kVA',
        nomeUnidade: 'Matriz São Paulo',
        branchName: 'Matriz São Paulo',
        pecaOuServico: 'Placa de comando eletrônico DSE 7320',
        partOrService: 'Placa de comando eletrônico DSE 7320',
        valorEconomizado: 16800,
        valueSaved: 16800,
        dataReivindicada: '12/03/2026',
        dateClaimed: '12/03/2026'
      },
      {
        nomeAtivo: 'VRF Daikin 30HP Cobertura',
        assetName: 'VRF Daikin 30HP Cobertura',
        nomeUnidade: 'Matriz São Paulo',
        branchName: 'Matriz São Paulo',
        pecaOuServico: 'Motor do ventilador axial + Sensor de degelo',
        partOrService: 'Motor do ventilador axial + Sensor de degelo',
        valorEconomizado: 9400,
        valueSaved: 9400,
        dataReivindicada: '18/11/2025',
        dateClaimed: '18/11/2025'
      },
      {
        nomeAtivo: 'Bomba de Incêndio Schneider 15CV',
        assetName: 'Bomba de Incêndio Schneider 15CV',
        nomeUnidade: 'Filial Rio de Janeiro',
        branchName: 'Filial Rio de Janeiro',
        pecaOuServico: 'Rebobinamento e selo mecânico em garantia',
        partOrService: 'Rebobinamento e selo mecânico em garantia',
        valorEconomizado: 8200,
        valueSaved: 8200,
        dataReivindicada: '04/08/2026',
        dateClaimed: '04/08/2026'
      }
    ]
  });
  readonly roiData = this.dadosRoi;

  readonly licencasFiltradas = computed(() => {
    const id = this.unidadeSelecionadaId();
    if (id === 'all') return this.licencas();
    return this.licencas().filter(l => l.unidadeId === id || l.branchId === id);
  });
  readonly filteredLicenses = this.licencasFiltradas;

  readonly ativosFiltrados = computed(() => {
    const id = this.unidadeSelecionadaId();
    if (id === 'all') return this.ativos();
    return this.ativos().filter(a => a.unidadeId === id || a.branchId === id);
  });
  readonly filteredAssets = this.ativosFiltrados;

  readonly pontuacaoGeralConformidade = computed(() => {
    const id = this.unidadeSelecionadaId();
    if (id === 'all') {
      const lista = this.unidades();
      if (!lista.length) return 0;
      const total = lista.reduce((acc, curr) => acc + (curr.pontuacaoConformidade ?? curr.complianceScore ?? 0), 0);
      return Math.round(total / lista.length);
    }
    const encontrada = this.unidades().find(b => b.id === id);
    return encontrada ? (encontrada.pontuacaoConformidade ?? encontrada.complianceScore ?? 0) : 0;
  });
  readonly overallComplianceScore = this.pontuacaoGeralConformidade;

  readonly statusGeralConformidade = computed<StatusConformidade>(() => {
    const pontuacao = this.pontuacaoGeralConformidade();
    if (pontuacao >= 90) return 'regular';
    if (pontuacao >= 70) return 'atencao';
    return 'urgente';
  });
  readonly overallComplianceStatus = this.statusGeralConformidade;

  readonly resumoContadores = computed(() => {
    const lista = this.licencasFiltradas();
    const regular = lista.filter(l => l.status === 'regular').length;
    const atencao = lista.filter(l => l.status === 'attention' || l.status === 'atencao').length;
    const urgente = lista.filter(l => l.status === 'urgent' || l.status === 'urgente').length;
    return {
      total: lista.length,
      regular,
      atencao,
      urgente,
      attention: atencao,
      urgent: urgente
    };
  });
  readonly countsSummary = this.resumoContadores;

  definirUnidadeSelecionada(unidadeId: string) {
    this.unidadeSelecionadaId.set(unidadeId);
  }
  setSelectedBranch(id: string) { this.definirUnidadeSelecionada(id); }

  definirAba(aba: 'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi') {
    this.abaAtual.set(aba);
  }
  setTab(tab: 'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi') { this.definirAba(tab); }

  adicionarLicenca(licenca: DocumentoLicenca) {
    this.licencas.update(ant => [licenca, ...ant]);
  }
  addLicense(l: DocumentoLicenca) { this.adicionarLicenca(l); }

  adicionarAtivo(ativo: AtivoFisico) {
    this.ativos.update(ant => [ativo, ...ant]);
  }
  addAsset(a: AtivoFisico) { this.adicionarAtivo(a); }

  adicionarUnidade(unidade: Unidade) {
    this.unidades.update(ant => [...ant, unidade]);
  }
  addBranch(b: Unidade) { this.adicionarUnidade(b); }

  adicionarRegraNotificacao(diasAntesVencimento: number, destinatarios: string[]) {
    this.regrasNotificacao.update(regras => [{
      id: 'rule-' + Date.now(),
      diasAntesVencimento,
      daysBeforeExpiration: diasAntesVencimento,
      canais: ['email'],
      channels: ['email'],
      destinatarios,
      recipients: destinatarios,
      ativa: true,
      active: true,
      nivelAlerta: diasAntesVencimento <= 30 ? 'critico' : 'alerta',
      alertLevel: diasAntesVencimento <= 30 ? 'critico' : 'alerta'
    }, ...regras]);
  }
  addNotificationRule(days: number, recs: string[]) { this.adicionarRegraNotificacao(days, recs); }

  adicionarHistoricoDossie(item: ItemHistoricoDossie) {
    this.historicoDossie.update(historico => [item, ...historico]);
  }
  addDossierHistory(i: ItemHistoricoDossie) { this.adicionarHistoricoDossie(i); }

  alternarRegraNotificacao(regraId: string) {
    this.regrasNotificacao.update(regras =>
      regras.map(r => (r.id === regraId ? { ...r, ativa: !r.ativa, active: !r.ativa } : r))
    );
  }
  toggleNotificationRule(id: string) { this.alternarRegraNotificacao(id); }

  enviarEmailSimulado(licenca: DocumentoLicenca) {
    const titulo = licenca.titulo || licenca.title || '';
    const unidade = licenca.nomeUnidade || licenca.branchName || '';
    const dias = licenca.diasRestantes ?? licenca.daysRemaining ?? 0;
    const novoRegistro: RegistroNotificacao = {
      id: 'log-' + Date.now(),
      horario: 'Agora mesmo',
      timestamp: 'Agora mesmo',
      canal: 'email',
      channel: 'email',
      destinatario: 'Gestão de Compliance (compliance@empresa.com.br)',
      recipient: 'Gestão de Compliance (compliance@empresa.com.br)',
      nomeLicencaOuAtivo: titulo,
      licenseOrAssetName: titulo,
      nomeUnidade: unidade,
      branchName: unidade,
      diasAntes: dias,
      daysBefore: dias,
      status: 'Entregue',
      previaMensagem: `Alerta Corporativo Licenfy: Vencimento próximo de ${titulo} (${unidade}) em ${dias} dias.`,
      messagePreview: `Alerta Corporativo Licenfy: Vencimento próximo de ${titulo} (${unidade}) em ${dias} dias.`
    };
    this.registrosNotificacao.update(logs => [novoRegistro, ...logs]);
  }
  sendSimulatedEmail(l: DocumentoLicenca) { this.enviarEmailSimulado(l); }
}

export const LicenfyService = ServicoLicenfy;
