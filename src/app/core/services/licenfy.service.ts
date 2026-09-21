import { Injectable, signal, computed } from '@angular/core';
import { Branch, LicenseDocument, PhysicalAsset, NotificationRule, NotificationLog, RoiMetric, ComplianceStatus, DossierHistoryItem } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class LicenfyService {
  // Estado Reativo com Signals modernos do Angular
  readonly currentView = signal<'landing' | 'auth' | 'app'>('landing');
  readonly authMode = signal<'login' | 'signup'>('login');
  readonly selectedBranchId = signal<string>('all');
  readonly currentTab = signal<'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi'>('dashboard');

  setView(view: 'landing' | 'auth' | 'app') {
    this.currentView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setAuthMode(mode: 'login' | 'signup') {
    this.authMode.set(mode);
  }

  openLogin() {
    this.authMode.set('login');
    this.setView('auth');
  }

  openSignup() {
    this.authMode.set('signup');
    this.setView('auth');
  }

  readonly branches = signal<Branch[]>([
    {
      id: 'sp-matriz',
      name: 'Matriz São Paulo',
      cnpj: '12.345.678/0001-90',
      city: 'São Paulo',
      state: 'SP',
      companyName: 'Grupo Alpha Brasil S.A.',
      address: 'Av. Paulista, 1250, Bela Vista, São Paulo - SP, 01310-100',
      responsibleManager: 'Mariana Silveira (Jurídico & Compliance)',
      responsiblePeople: [
        { id: 'resp-sp-1', name: 'Mariana Silveira', role: 'Jurídico & Compliance', email: 'mariana@grupoalpha.com.br', phone: '+55 11 98877-6655', primary: true },
        { id: 'resp-sp-2', name: 'Rafael Moura', role: 'Facilities', email: 'rafael.moura@grupoalpha.com.br', phone: '+55 11 98810-4421' }
      ],
      complianceScore: 94,
      status: 'regular',
      licensesCount: { total: 12, regular: 10, attention: 2, urgent: 0 },
      assetsCount: { total: 48, withActiveWarranty: 31, maintenancePending: 1 }
    },
    {
      id: 'rj-filial',
      name: 'Filial Rio de Janeiro',
      cnpj: '12.345.678/0002-71',
      city: 'Rio de Janeiro',
      state: 'RJ',
      companyName: 'Grupo Alpha Brasil S.A.',
      address: 'Rua do Ouvidor, 86, Centro, Rio de Janeiro - RJ, 20040-030',
      responsibleManager: 'Carlos Eduardo Mendes (Operações RJ)',
      responsiblePeople: [
        { id: 'resp-rj-1', name: 'Carlos Eduardo Mendes', role: 'Operações RJ', email: 'carlos.mendes@grupoalpha.com.br', phone: '+55 21 99123-4567', primary: true },
        { id: 'resp-rj-2', name: 'Ana Ribeiro', role: 'Administrativo local', email: 'ana.ribeiro@grupoalpha.com.br', phone: '+55 21 99222-9120' }
      ],
      complianceScore: 78,
      status: 'attention',
      licensesCount: { total: 9, regular: 6, attention: 2, urgent: 1 },
      assetsCount: { total: 26, withActiveWarranty: 14, maintenancePending: 3 }
    },
    {
      id: 'pr-cd',
      name: 'Centro de Distribuição Curitiba',
      cnpj: '12.345.678/0003-52',
      city: 'Curitiba',
      state: 'PR',
      companyName: 'Grupo Alpha Brasil S.A.',
      address: 'Rod. BR-116, km 110, Tatuquara, Curitiba - PR, 81950-000',
      responsibleManager: 'Fernanda Becker (Logística & Facilities)',
      responsiblePeople: [
        { id: 'resp-pr-1', name: 'Fernanda Becker', role: 'Logística & Facilities', email: 'fernanda.becker@grupoalpha.com.br', phone: '+55 41 98234-5678', primary: true },
        { id: 'resp-pr-2', name: 'Diego Lopes', role: 'Segurança do Trabalho', email: 'diego.lopes@grupoalpha.com.br', phone: '+55 41 98910-0821' }
      ],
      complianceScore: 65,
      status: 'urgent',
      licensesCount: { total: 14, regular: 8, attention: 3, urgent: 3 },
      assetsCount: { total: 62, withActiveWarranty: 39, maintenancePending: 5 }
    }
  ]);

  readonly licenses = signal<LicenseDocument[]>([
    {
      id: 'lic-001',
      branchId: 'sp-matriz',
      branchName: 'Matriz São Paulo',
      title: 'Alvará de Funcionamento e Localização',
      category: 'Alvará',
      issuingBody: 'Prefeitura Municipal de São Paulo',
      documentNumber: 'ALV-2024-99812-SP',
      issueDate: '2024-03-10',
      expirationDate: '2027-03-10',
      daysRemaining: 540,
      status: 'regular',
      renewalCostEstimate: 1450,
      estimatedFineIfExpired: 25000,
      legalRequirementNote: 'Obrigatório para livre operação comercial e abertura das instalações.',
      fileName: 'Alvara_SP_Matriz_2024.pdf',
      fileSize: '1.4 MB',
      ocrExtracted: true,
      dossierIncluded: true
    },
    {
      id: 'lic-002',
      branchId: 'sp-matriz',
      branchName: 'Matriz São Paulo',
      title: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      category: 'Bombeiros',
      issuingBody: 'Corpo de Bombeiros da PMESP',
      documentNumber: 'AVCB-SP-88319-2025',
      issueDate: '2025-01-15',
      expirationDate: '2026-10-10',
      daysRemaining: 25,
      status: 'attention',
      renewalCostEstimate: 4200,
      estimatedFineIfExpired: 65000,
      linkedAssetId: 'ast-003',
      linkedAssetName: 'Bateria de Extintores e Hidrantes - Bloco A e B',
      legalRequirementNote: 'A renovação do AVCB exige atestado de recarga e teste hidrostático da bateria de extintores.',
      fileName: 'AVCB_Matriz_PMESP_2025.pdf',
      fileSize: '2.8 MB',
      ocrExtracted: true,
      dossierIncluded: true
    },
    {
      id: 'lic-003',
      branchId: 'pr-cd',
      branchName: 'Centro de Distribuição Curitiba',
      title: 'Licença Sanitária (CMVS)',
      category: 'Sanitária',
      issuingBody: 'Vigilância Sanitária Municipal (SMS Curitiba)',
      documentNumber: 'LS-CTBA-4412-2025',
      issueDate: '2025-09-20',
      expirationDate: '2026-09-22',
      daysRemaining: 6,
      status: 'urgent',
      renewalCostEstimate: 1200,
      estimatedFineIfExpired: 40000,
      legalRequirementNote: 'Fiscalização iminente. Risco de interdição total do setor de estocagem de produtos controlados.',
      fileName: 'Licenca_Sanitaria_Curitiba_2025.pdf',
      fileSize: '950 KB',
      ocrExtracted: true,
      dossierIncluded: true
    },
    {
      id: 'lic-004',
      branchId: 'pr-cd',
      branchName: 'Centro de Distribuição Curitiba',
      title: 'Licença de Operação Ambiental (LO)',
      category: 'Ambiental',
      issuingBody: 'Instituto Água e Terra (IAT Paraná)',
      documentNumber: 'LO-IAT-PR-7762',
      issueDate: '2025-05-12',
      expirationDate: '2027-05-12',
      daysRemaining: 605,
      status: 'regular',
      renewalCostEstimate: 8900,
      estimatedFineIfExpired: 180000,
      fileName: 'LO_IAT_Curitiba_Ambiental.pdf',
      fileSize: '3.2 MB',
      ocrExtracted: true,
      dossierIncluded: true
    },
    {
      id: 'lic-005',
      branchId: 'rj-filial',
      branchName: 'Filial Rio de Janeiro',
      title: 'Laudo Técnico de Inspeção Predial e SPDA (Para-raios)',
      category: 'Segurança do Trabalho',
      issuingBody: 'CREA-RJ / Engenharia Especializada',
      documentNumber: 'ART-CREA-RJ-2025-1029',
      issueDate: '2025-02-18',
      expirationDate: '2026-10-05',
      daysRemaining: 20,
      status: 'attention',
      renewalCostEstimate: 3600,
      estimatedFineIfExpired: 18000,
      linkedAssetId: 'ast-001',
      linkedAssetName: 'Gerador de Emergência Stemac 180kVA',
      legalRequirementNote: 'Interdependência com aterramento e gerador de suporte a emergências.',
      fileName: 'Laudo_SPDA_Predial_RJ.pdf',
      fileSize: '1.9 MB',
      ocrExtracted: true,
      dossierIncluded: true
    },
    {
      id: 'lic-006',
      branchId: 'rj-filial',
      branchName: 'Filial Rio de Janeiro',
      title: 'Certificado de Conformidade Sanitária e Qualidade da Água',
      category: 'Sanitária',
      issuingBody: 'Subvisa Rio de Janeiro',
      documentNumber: 'SUBVISA-RJ-9901',
      issueDate: '2026-01-10',
      expirationDate: '2027-01-10',
      daysRemaining: 116,
      status: 'regular',
      renewalCostEstimate: 950,
      estimatedFineIfExpired: 15000,
      fileName: 'Qualidade_Agua_Subvisa_RJ.pdf',
      fileSize: '820 KB',
      ocrExtracted: true,
      dossierIncluded: true
    }
  ]);

  readonly assets = signal<PhysicalAsset[]>([
    {
      id: 'ast-001',
      assetTag: 'EQ-0821',
      qrCodeValue: 'https://app.licenfy.com.br/asset/EQ-0821',
      name: 'Gerador Diesel de Emergência Stemac 180kVA',
      category: 'Geradores',
      branchId: 'rj-filial',
      branchName: 'Filial Rio de Janeiro',
      locationDetails: 'Subsolo 1 - Sala Técnica de Energia',
      brandModel: 'Stemac Cummins QSB7-G5',
      serialNumber: 'SN-STM-2024-9981',
      invoiceNumber: 'NF-e 004.891 / Série 1',
      purchaseDate: '2024-04-10',
      warrantyExpirationDate: '2026-10-25',
      isWarrantyActive: true,
      daysUntilWarrantyExpires: 40,
      lastMaintenanceDate: '2026-07-15',
      nextMaintenanceDate: '2026-10-15',
      maintenanceStatus: 'attention',
      linkedLicenseId: 'lic-005',
      linkedLicenseTitle: 'Laudo Técnico Predial e SPDA',
      maintenances: [
        {
          id: 'mnt-01',
          date: '2026-07-15',
          type: 'Preventiva',
          technicianOrCompany: 'Stemac Manutenções Autorizada',
          notes: 'Troca de filtros de óleo e diesel, teste de partida automática em 4.2 segundos com carga.',
          nextScheduledDate: '2026-10-15',
          costSavedByWarranty: 3200
        },
        {
          id: 'mnt-02',
          date: '2026-01-20',
          type: 'Inspeção',
          technicianOrCompany: 'Equipe Própria de Facilities',
          notes: 'Nível de combustível 100%, bateria em 26.8V, sem vazamentos.',
          nextScheduledDate: '2026-07-15'
        }
      ]
    },
    {
      id: 'ast-002',
      assetTag: 'EQ-0450',
      qrCodeValue: 'https://app.licenfy.com.br/asset/EQ-0450',
      name: 'Sistema de Climatização Central VRF Daikin 30HP',
      category: 'Climatização',
      branchId: 'sp-matriz',
      branchName: 'Matriz São Paulo',
      locationDetails: 'Cobertura Técnica - Prédio Administrativo',
      brandModel: 'Daikin VRV IV-S Heat Pump',
      serialNumber: 'DKN-VRV-2023-8871',
      invoiceNumber: 'NF-e 019.231 / Série 2',
      purchaseDate: '2023-11-20',
      warrantyExpirationDate: '2026-11-20',
      isWarrantyActive: true,
      daysUntilWarrantyExpires: 66,
      lastMaintenanceDate: '2026-08-01',
      nextMaintenanceDate: '2026-11-01',
      maintenanceStatus: 'regular',
      maintenances: [
        {
          id: 'mnt-03',
          date: '2026-08-01',
          type: 'Preventiva',
          technicianOrCompany: 'Daikin Service Brasil',
          notes: 'Higienização química das serpentinas, calibragem de sondas e medição de gás refrigerante R410A.',
          nextScheduledDate: '2026-11-01',
          costSavedByWarranty: 4800
        }
      ]
    },
    {
      id: 'ast-003',
      assetTag: 'EQ-0199',
      qrCodeValue: 'https://app.licenfy.com.br/asset/EQ-0199',
      name: 'Bateria de Extintores e Hidrantes - Bloco A e B',
      category: 'Extintores',
      branchId: 'sp-matriz',
      branchName: 'Matriz São Paulo',
      locationDetails: 'Corredores Centrais, Escadas de Emergência e Hall',
      brandModel: 'Mocelin / Extinpar PQS 12kg e CO2 6kg (Total 28 un.)',
      serialNumber: 'LOT-EXT-2025-01',
      invoiceNumber: 'NF-e 007.410 / Série 1',
      purchaseDate: '2025-01-10',
      warrantyExpirationDate: '2026-10-01',
      isWarrantyActive: true,
      daysUntilWarrantyExpires: 16,
      lastMaintenanceDate: '2025-10-01',
      nextMaintenanceDate: '2026-09-30',
      maintenanceStatus: 'urgent',
      linkedLicenseId: 'lic-002',
      linkedLicenseTitle: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      maintenances: [
        {
          id: 'mnt-04',
          date: '2025-10-01',
          type: 'Recarga',
          technicianOrCompany: 'Comercial de Extintores Paulistana Ltda',
          notes: 'Recarga anual e colocação do anel de identificação INMETRO cor azul.',
          nextScheduledDate: '2026-09-30',
          costSavedByWarranty: 0
        }
      ]
    },
    {
      id: 'ast-004',
      assetTag: 'EQ-0904',
      qrCodeValue: 'https://app.licenfy.com.br/asset/EQ-0904',
      name: 'Chiller de Refrigeração Industrial Trane 120TR',
      category: 'Climatização',
      branchId: 'pr-cd',
      branchName: 'Centro de Distribuição Curitiba',
      locationDetails: 'Galpão Frio B - Sala de Máquinas Primária',
      brandModel: 'Trane Sintesis RTAF',
      serialNumber: 'TRN-2024-3321',
      invoiceNumber: 'NF-e 088.192 / Série 3',
      purchaseDate: '2024-02-14',
      warrantyExpirationDate: '2027-02-14',
      isWarrantyActive: true,
      daysUntilWarrantyExpires: 516,
      lastMaintenanceDate: '2026-06-10',
      nextMaintenanceDate: '2026-12-10',
      maintenanceStatus: 'regular',
      maintenances: [
        {
          id: 'mnt-05',
          date: '2026-06-10',
          type: 'Corretiva',
          technicianOrCompany: 'Trane Brasil Autorizada',
          notes: 'Troca de válvula solenóide coberta integralmente pela garantia do fabricante.',
          nextScheduledDate: '2026-12-10',
          costSavedByWarranty: 14500
        }
      ]
    }
  ]);

  readonly notificationRules = signal<NotificationRule[]>([
    {
      id: 'rule-90',
      daysBeforeExpiration: 90,
      channels: ['email'],
      recipients: ['compliance@empresa.com.br', 'facilities@empresa.com.br'],
      active: true,
      alertLevel: 'informativo'
    },
    {
      id: 'rule-60',
      daysBeforeExpiration: 60,
      channels: ['email'],
      recipients: ['gerencia.operacoes@empresa.com.br', 'compliance@empresa.com.br'],
      active: true,
      alertLevel: 'alerta'
    },
    {
      id: 'rule-30',
      daysBeforeExpiration: 30,
      channels: ['email'],
      recipients: ['diretoria.juridica@empresa.com.br', 'gerente.unidade@empresa.com.br'],
      active: true,
      alertLevel: 'critico'
    },
    {
      id: 'rule-7',
      daysBeforeExpiration: 7,
      channels: ['email'],
      recipients: ['diretoria.executiva@empresa.com.br', 'compliance.head@empresa.com.br', 'auditoria@empresa.com.br'],
      active: true,
      alertLevel: 'critico'
    }
  ]);

  readonly notificationLogs = signal<NotificationLog[]>([
    {
      id: 'log-001',
      timestamp: 'Hoje, 09:15',
      channel: 'email',
      recipient: 'Mariana Silveira (mariana.silveira@empresa.com.br)',
      licenseOrAssetName: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      branchName: 'Matriz São Paulo',
      daysBefore: 25,
      status: 'Lido',
      messagePreview: 'Alerta Licenfy: O AVCB da Matriz SP vence em 25 dias. Ativo associado pendente: Extintores Bloco A/B.'
    },
    {
      id: 'log-002',
      timestamp: 'Hoje, 08:30',
      channel: 'email',
      recipient: 'Fernanda Becker (fernanda.becker@empresa.com.br)',
      licenseOrAssetName: 'Licença Sanitária (CMVS)',
      branchName: 'CD Curitiba',
      daysBefore: 6,
      status: 'Ação Tomada',
      messagePreview: 'Urgente Licenfy: Licença Sanitária expira em 6 dias. Protocolo de renovação já enviado ao despachante.'
    },
    {
      id: 'log-003',
      timestamp: 'Ontem, 17:40',
      channel: 'email',
      recipient: 'compliance@empresa.com.br',
      licenseOrAssetName: 'Laudo Técnico Predial e SPDA',
      branchName: 'Filial Rio de Janeiro',
      daysBefore: 20,
      status: 'Entregue',
      messagePreview: 'Notificação programada: Documento com vencimento próximo cadastrado no alerta de 30 dias.'
    },
    {
      id: 'log-004',
      timestamp: '14/09/2026, 11:00',
      channel: 'email',
      recipient: 'Carlos Eduardo Mendes (carlos.mendes@empresa.com.br)',
      licenseOrAssetName: 'Garantia: Gerador Stemac 180kVA',
      branchName: 'Filial Rio de Janeiro',
      daysBefore: 40,
      status: 'Lido',
      messagePreview: 'Aviso de Garantia: A garantia do Gerador Stemac vence em 40 dias. Agende a revisão sem custo.'
    }
  ]);

  readonly dossierHistory = signal<DossierHistoryItem[]>([
    { id: 'dos-001', branchId: 'sp-matriz', branchName: 'Matriz São Paulo', generatedAt: '12/09/2026, 09:20', documentCount: 2, hash: 'LCFY-218A-09C3' },
    { id: 'dos-002', branchId: 'rj-filial', branchName: 'Filial Rio de Janeiro', generatedAt: '28/08/2026, 16:42', documentCount: 2, hash: 'LCFY-8FD2-771B' }
  ]);

  readonly roiData = signal<RoiMetric>({
    totalFinesAvoided: 135000,
    warrantiesTriggeredSavings: 48900,
    operationalHoursSaved: 320,
    totalFinancialGain: 183900,
    finesAvoidedList: [
      {
        licenseTitle: 'Alvará de Funcionamento e Localização',
        branchName: 'Matriz São Paulo',
        estimatedFine: 25000,
        preventedDate: 'Renovado a 45 dias do prazo',
        regulatoryBody: 'Prefeitura SP'
      },
      {
        licenseTitle: 'Licença de Operação Ambiental - LO',
        branchName: 'Centro de Distribuição Curitiba',
        estimatedFine: 70000,
        preventedDate: 'Renovado sem interrupção de pátio',
        regulatoryBody: 'IAT Paraná'
      },
      {
        licenseTitle: 'Auto de Vistoria do Corpo de Bombeiros (AVCB)',
        branchName: 'Filial Rio de Janeiro',
        estimatedFine: 40000,
        preventedDate: 'Vistoria aprovada sem auto de infração',
        regulatoryBody: 'CBMERJ'
      }
    ],
    warrantiesSavedList: [
      {
        assetName: 'Chiller Trane 120TR',
        branchName: 'CD Curitiba',
        partOrService: 'Válvula solenóide + Carga de óleo de compressor',
        valueSaved: 14500,
        dateClaimed: '10/06/2026'
      },
      {
        assetName: 'Gerador Cummins 250kVA',
        branchName: 'Matriz São Paulo',
        partOrService: 'Placa de comando eletrônico DSE 7320',
        valueSaved: 16800,
        dateClaimed: '12/03/2026'
      },
      {
        assetName: 'VRF Daikin 30HP Cobertura',
        branchName: 'Matriz São Paulo',
        partOrService: 'Motor do ventilador axial + Sensor de degelo',
        valueSaved: 9400,
        dateClaimed: '18/11/2025'
      },
      {
        assetName: 'Bomba de Incêndio Schneider 15CV',
        branchName: 'Filial Rio de Janeiro',
        partOrService: 'Rebobinamento e selo mecânico em garantia',
        valueSaved: 8200,
        dateClaimed: '04/08/2026'
      }
    ]
  });

  // Métricas Computadas
  readonly filteredLicenses = computed(() => {
    const branchId = this.selectedBranchId();
    if (branchId === 'all') return this.licenses();
    return this.licenses().filter(l => l.branchId === branchId);
  });

  readonly filteredAssets = computed(() => {
    const branchId = this.selectedBranchId();
    if (branchId === 'all') return this.assets();
    return this.assets().filter(a => a.branchId === branchId);
  });

  readonly overallComplianceScore = computed(() => {
    const branchId = this.selectedBranchId();
    if (branchId === 'all') {
      const bList = this.branches();
      if (!bList.length) return 0;
      const total = bList.reduce((acc, curr) => acc + curr.complianceScore, 0);
      return Math.round(total / bList.length);
    }
    const found = this.branches().find(b => b.id === branchId);
    return found ? found.complianceScore : 0;
  });

  readonly overallComplianceStatus = computed<ComplianceStatus>(() => {
    const score = this.overallComplianceScore();
    if (score >= 90) return 'regular';
    if (score >= 70) return 'attention';
    return 'urgent';
  });

  readonly countsSummary = computed(() => {
    const licList = this.filteredLicenses();
    const regular = licList.filter(l => l.status === 'regular').length;
    const attention = licList.filter(l => l.status === 'attention').length;
    const urgent = licList.filter(l => l.status === 'urgent').length;
    return {
      total: licList.length,
      regular,
      attention,
      urgent
    };
  });

  // Ações
  setSelectedBranch(branchId: string) {
    this.selectedBranchId.set(branchId);
  }

  setTab(tab: 'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi') {
    this.currentTab.set(tab);
  }

  addLicense(license: LicenseDocument) {
    this.licenses.update(prev => [license, ...prev]);
  }

  addAsset(asset: PhysicalAsset) {
    this.assets.update(prev => [asset, ...prev]);
  }

  addBranch(branch: Branch) {
    this.branches.update(prev => [...prev, branch]);
  }

  addNotificationRule(daysBeforeExpiration: number, recipients: string[]) {
    this.notificationRules.update(rules => [{
      id: 'rule-' + Date.now(),
      daysBeforeExpiration,
      channels: ['email'],
      recipients,
      active: true,
      alertLevel: daysBeforeExpiration <= 30 ? 'critico' : 'alerta'
    }, ...rules]);
  }

  addDossierHistory(item: DossierHistoryItem) {
    this.dossierHistory.update(history => [item, ...history]);
  }

  toggleNotificationRule(ruleId: string) {
    this.notificationRules.update(rules =>
      rules.map(r => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  }

  sendSimulatedEmail(license: LicenseDocument) {
    const newLog: NotificationLog = {
      id: 'log-' + Date.now(),
      timestamp: 'Agora mesmo',
      channel: 'email',
      recipient: 'Gestão de Compliance (compliance@empresa.com.br)',
      licenseOrAssetName: license.title,
      branchName: license.branchName,
      daysBefore: license.daysRemaining,
      status: 'Entregue',
      messagePreview: `Alerta Corporativo Licenfy: Vencimento próximo de ${license.title} (${license.branchName}) em ${license.daysRemaining} dias.`
    };
    this.notificationLogs.update(logs => [newLog, ...logs]);
  }

  // Alias para compatibilidade
  sendSimulatedWhatsApp(license: LicenseDocument) {
    this.sendSimulatedEmail(license);
  }
}
