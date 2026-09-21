export type ComplianceStatus = 'regular' | 'attention' | 'urgent';

export interface Branch {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  responsibleManager: string;
  address: string;
  companyName: string;
  responsiblePeople: UnitResponsible[];
  complianceScore: number; // 0 to 100
  status: ComplianceStatus;
  licensesCount: {
    total: number;
    regular: number;
    attention: number;
    urgent: number;
  };
  assetsCount: {
    total: number;
    withActiveWarranty: number;
    maintenancePending: number;
  };
}

export interface UnitResponsible {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  primary?: boolean;
}

export interface DocumentVersion {
  id: string;
  label: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  fileSize: string;
  status: 'current' | 'archived';
}

export interface LicenseDocument {
  id: string;
  branchId: string;
  branchName: string;
  title: string;
  category: 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros';
  issuingBody: string; // ex: Prefeitura Municipal, Corpo de Bombeiros Militar, ANVISA, CETESB
  documentNumber: string;
  issueDate: string;
  expirationDate: string;
  daysRemaining: number;
  status: ComplianceStatus;
  renewalCostEstimate: number;
  estimatedFineIfExpired: number;
  linkedAssetId?: string; // Unificação Legal + Operacional
  linkedAssetName?: string;
  legalRequirementNote?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  ocrExtracted: boolean;
  dossierIncluded: boolean;
  versions?: DocumentVersion[];
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Preventiva' | 'Corretiva' | 'Recarga' | 'Inspeção';
  technicianOrCompany: string;
  notes: string;
  nextScheduledDate: string;
  costSavedByWarranty?: number;
}

export interface PhysicalAsset {
  id: string;
  assetTag: string; // Código de patrimônio ex: EQ-0941
  qrCodeValue: string;
  name: string;
  category: 'Extintores' | 'Geradores' | 'Climatização' | 'Elétrica' | 'Segurança';
  branchId: string;
  branchName: string;
  locationDetails: string; // ex: Bloco B - Térreo - Próximo ao Datacenter
  brandModel: string;
  serialNumber: string;
  invoiceNumber: string; // Nota Fiscal
  purchaseDate: string;
  warrantyExpirationDate: string;
  isWarrantyActive: boolean;
  daysUntilWarrantyExpires: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceStatus: 'regular' | 'attention' | 'urgent';
  linkedLicenseId?: string; // Link to AVCB / Alvará
  linkedLicenseTitle?: string;
  maintenances: MaintenanceRecord[];
}

export interface NotificationRule {
  id: string;
  daysBeforeExpiration: number; // 90, 60, 30, 7
  channels: 'email'[];
  recipients: string[]; // Telefone celular ou emails
  active: boolean;
  alertLevel: 'informativo' | 'alerta' | 'critico';
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  channel: 'email';
  recipient: string;
  licenseOrAssetName: string;
  branchName: string;
  daysBefore: number;
  status: 'Entregue' | 'Lido' | 'Ação Tomada';
  messagePreview: string;
}

export interface DossierHistoryItem {
  id: string;
  branchId: string;
  branchName: string;
  generatedAt: string;
  documentCount: number;
  hash: string;
}

export interface RoiMetric {
  totalFinesAvoided: number; // R$
  warrantiesTriggeredSavings: number; // R$
  operationalHoursSaved: number;
  totalFinancialGain: number; // R$
  finesAvoidedList: {
    licenseTitle: string;
    branchName: string;
    estimatedFine: number;
    preventedDate: string;
    regulatoryBody: string;
  }[];
  warrantiesSavedList: {
    assetName: string;
    branchName: string;
    partOrService: string;
    valueSaved: number;
    dateClaimed: string;
  }[];
}
