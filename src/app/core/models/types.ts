export type StatusConformidade = 'regular' | 'atencao' | 'urgente' | 'attention' | 'urgent';
export type ComplianceStatus = StatusConformidade;

export interface ResponsavelUnidade {
  id: string;
  nome?: string;
  name?: string;
  cargo?: string;
  role?: string;
  email: string;
  telefone?: string;
  phone?: string;
  principal?: boolean;
  primary?: boolean;
}
export type UnitResponsible = ResponsavelUnidade;

export interface VersaoDocumento {
  id: string;
  rotulo?: string;
  label?: string;
  dataEnvio?: string;
  uploadedAt?: string;
  enviadoPor?: string;
  uploadedBy?: string;
  nomeArquivo?: string;
  fileName?: string;
  tamanhoArquivo?: string;
  fileSize?: string;
  status: 'atual' | 'arquivado' | 'current' | 'archived';
}
export type DocumentVersion = VersaoDocumento;

export interface Unidade {
  id: string;
  nome?: string;
  name?: string;
  cnpj: string;
  cidade?: string;
  city?: string;
  estado?: string;
  state?: string;
  gerenteResponsavel?: string;
  responsibleManager?: string;
  endereco?: string;
  address?: string;
  razaoSocial?: string;
  companyName?: string;
  responsaveis?: ResponsavelUnidade[];
  responsiblePeople?: ResponsavelUnidade[];
  pontuacaoConformidade?: number;
  complianceScore?: number;
  status: StatusConformidade;
  contagemLicencas?: {
    total: number;
    regular: number;
    atencao: number;
    urgente: number;
    attention?: number;
    urgent?: number;
  };
  licensesCount?: {
    total: number;
    regular: number;
    attention: number;
    urgent: number;
  };
  contagemAtivos?: {
    total: number;
    comGarantiaAtiva: number;
    manutencaoPendente: number;
    withActiveWarranty?: number;
    maintenancePending?: number;
  };
  assetsCount?: {
    total: number;
    withActiveWarranty: number;
    maintenancePending: number;
  };
}
export type Branch = Unidade;

export interface DocumentoLicenca {
  id: string;
  unidadeId?: string;
  branchId?: string;
  nomeUnidade?: string;
  branchName?: string;
  titulo?: string;
  title?: string;
  categoria?: 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros';
  category?: 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros';
  orgaoEmissor?: string;
  issuingBody?: string;
  numeroDocumento?: string;
  documentNumber?: string;
  dataEmissao?: string;
  issueDate?: string;
  dataVencimento?: string;
  expirationDate?: string;
  diasRestantes?: number;
  daysRemaining?: number;
  status: StatusConformidade;
  estimativaCustoRenovacao?: number;
  renewalCostEstimate?: number;
  estimativaMultaVencida?: number;
  estimatedFineIfExpired?: number;
  ativoVinculadoId?: string;
  linkedAssetId?: string;
  nomeAtivoVinculado?: string;
  linkedAssetName?: string;
  notaRequisitoLegal?: string;
  legalRequirementNote?: string;
  urlArquivo?: string;
  fileUrl?: string;
  nomeArquivo?: string;
  fileName?: string;
  tamanhoArquivo?: string;
  fileSize?: string;
  extraidoViaOcr?: boolean;
  ocrExtracted?: boolean;
  inclusoNoDossie?: boolean;
  dossierIncluded?: boolean;
  versoes?: VersaoDocumento[];
  versions?: VersaoDocumento[];
}
export type LicenseDocument = DocumentoLicenca;

export interface RegistroManutencao {
  id: string;
  data?: string;
  date?: string;
  tipo?: 'Preventiva' | 'Corretiva' | 'Recarga' | 'Inspeção';
  type?: 'Preventiva' | 'Corretiva' | 'Recarga' | 'Inspeção';
  tecnicoOuEmpresa?: string;
  technicianOrCompany?: string;
  observacoes?: string;
  notes?: string;
  proximaData?: string;
  nextScheduledDate?: string;
  economiaGarantia?: number;
  costSavedByWarranty?: number;
}
export type MaintenanceRecord = RegistroManutencao;

export interface AtivoFisico {
  id: string;
  etiquetaPatrimonio?: string;
  assetTag?: string;
  valorQrCode?: string;
  qrCodeValue?: string;
  nome?: string;
  name?: string;
  categoria?: 'Extintores' | 'Geradores' | 'Climatização' | 'Elétrica' | 'Segurança';
  category?: 'Extintores' | 'Geradores' | 'Climatização' | 'Elétrica' | 'Segurança';
  unidadeId?: string;
  branchId?: string;
  nomeUnidade?: string;
  branchName?: string;
  detalhesLocalizacao?: string;
  locationDetails?: string;
  marcaModelo?: string;
  brandModel?: string;
  numeroSerie?: string;
  serialNumber?: string;
  numeroNotaFiscal?: string;
  invoiceNumber?: string;
  dataAquisicao?: string;
  purchaseDate?: string;
  dataFimGarantia?: string;
  warrantyExpirationDate?: string;
  garantiaAtiva?: boolean;
  isWarrantyActive?: boolean;
  diasAteFimGarantia?: number;
  daysUntilWarrantyExpires?: number;
  dataUltimaManutencao?: string;
  lastMaintenanceDate?: string;
  dataProximaManutencao?: string;
  nextMaintenanceDate?: string;
  statusManutencao?: StatusConformidade;
  maintenanceStatus?: StatusConformidade;
  licencaVinculadaId?: string;
  linkedLicenseId?: string;
  licencaVinculadaTitulo?: string;
  linkedLicenseTitle?: string;
  manutencoes?: RegistroManutencao[];
  maintenances?: RegistroManutencao[];
}
export type PhysicalAsset = AtivoFisico;

export interface RegraNotificacao {
  id: string;
  diasAntesVencimento?: number;
  daysBeforeExpiration?: number;
  canais?: 'email'[];
  channels?: 'email'[];
  destinatarios?: string[];
  recipients?: string[];
  ativa?: boolean;
  active?: boolean;
  nivelAlerta?: 'informativo' | 'alerta' | 'critico';
  alertLevel?: 'informativo' | 'alerta' | 'critico';
}
export type NotificationRule = RegraNotificacao;

export interface RegistroNotificacao {
  id: string;
  horario?: string;
  timestamp?: string;
  canal?: 'email';
  channel?: 'email';
  destinatario?: string;
  recipient?: string;
  nomeLicencaOuAtivo?: string;
  licenseOrAssetName?: string;
  nomeUnidade?: string;
  branchName?: string;
  diasAntes?: number;
  daysBefore?: number;
  status: 'Entregue' | 'Lido' | 'Ação Tomada';
  previaMensagem?: string;
  messagePreview?: string;
}
export type NotificationLog = RegistroNotificacao;

export interface ItemHistoricoDossie {
  id: string;
  unidadeId?: string;
  branchId?: string;
  nomeUnidade?: string;
  branchName?: string;
  geradoEm?: string;
  generatedAt?: string;
  quantidadeDocumentos?: number;
  documentCount?: number;
  codigoVerificacao?: string;
  hash?: string;
}
export type DossierHistoryItem = ItemHistoricoDossie;

export interface ItemMultaEvitada {
  tituloLicenca?: string;
  licenseTitle?: string;
  nomeUnidade?: string;
  branchName?: string;
  multaEstimada?: number;
  estimatedFine?: number;
  dataEvitada?: string;
  preventedDate?: string;
  orgaoRegulador?: string;
  regulatoryBody?: string;
}

export interface ItemGarantiaPoupada {
  nomeAtivo?: string;
  assetName?: string;
  nomeUnidade?: string;
  branchName?: string;
  pecaOuServico?: string;
  partOrService?: string;
  valorEconomizado?: number;
  valueSaved?: number;
  dataReivindicada?: string;
  dateClaimed?: string;
}

export interface MetricaRoi {
  totalMultasEvitadas?: number;
  totalFinesAvoided?: number;
  economiaGarantias?: number;
  warrantiesTriggeredSavings?: number;
  horasOperacionaisPoupadas?: number;
  operationalHoursSaved?: number;
  ganhoFinanceiroTotal?: number;
  totalFinancialGain?: number;
  listaMultasEvitadas?: ItemMultaEvitada[];
  finesAvoidedList?: ItemMultaEvitada[];
  listaGarantiasPoupadas?: ItemGarantiaPoupada[];
  warrantiesSavedList?: ItemGarantiaPoupada[];
}
export type RoiMetric = MetricaRoi;
