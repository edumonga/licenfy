import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { ServicoGeminiOcr } from '../../core/services/gemini-ocr.service';
import { DocumentoLicenca, StatusConformidade, LicenseDocument, ComplianceStatus } from '../../core/models/types';

@Component({
  selector: 'app-digital-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './digital-vault.component.html',
  styleUrls: ['./digital-vault.component.css']
})
export class CofreDigitalComponente {
  readonly servico = inject(ServicoLicenfy);
  readonly gemini = inject(ServicoGeminiOcr);

  readonly licencas = this.servico.licencasFiltradas;
  readonly unidades = this.servico.unidades;

  readonly estaDigitalizando = signal<boolean>(false);
  readonly etapaDigitalizacao = signal<string>('');
  readonly digitalizadoComSucesso = signal<boolean>(false);
  readonly nomeArquivoEnviado = signal<string>('');
  readonly documentoHistoricoSelecionado = signal<DocumentoLicenca | null>(null);
  readonly erroOcr = signal<string>('');
  readonly usouIaReal = signal<boolean>(false);

  get service() { return this.servico; }
  get licenses() { return this.licencas; }
  get branches() { return this.unidades; }
  get isScanning() { return this.estaDigitalizando; }
  get scanStep() { return this.etapaDigitalizacao; }
  get scannedSuccess() { return this.digitalizadoComSucesso; }
  get uploadedFileName() { return this.nomeArquivoEnviado; }
  get selectedHistoryDocument() { return this.documentoHistoricoSelecionado; }
  get ocrError() { return this.erroOcr; }
  get usedRealAi() { return this.usouIaReal; }

  dadosExtraidos = {
    titulo: 'Alvará de Licença e Localização - 2026/2027',
    title: 'Alvará de Licença e Localização - 2026/2027',
    categoria: 'Alvará' as 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros',
    category: 'Alvará' as 'Alvará' | 'Bombeiros' | 'Sanitária' | 'Ambiental' | 'Segurança do Trabalho' | 'Outros',
    orgaoEmissor: 'Prefeitura Municipal - Secretaria de Finanças',
    issuingBody: 'Prefeitura Municipal - Secretaria de Finanças',
    numeroDocumento: 'ALV-EXT-2026-9041',
    documentNumber: 'ALV-EXT-2026-9041',
    unidadeId: 'sp-matriz',
    branchId: 'sp-matriz',
    dataEmissao: '2026-09-15',
    issueDate: '2026-09-15',
    dataVencimento: '2027-09-15',
    expirationDate: '2027-09-15',
    estimativaCustoRenovacao: 1850,
    renewalCostEstimate: 1850,
    estimativaMultaVencida: 35000,
    estimatedFineIfExpired: 35000,
    nomeAtivoVinculado: 'Nenhum ativo direto',
    linkedAssetName: 'Nenhum ativo direto',
    notaRequisitoLegal: 'Aguardando extração via OCR.',
    legalRequirementNote: 'Aguardando extração via OCR.'
  };
  get extractedData() { return this.dadosExtraidos; }
  set extractedData(v: any) { this.dadosExtraidos = v; }

  termoBusca = signal<string>('');
  categoriaFiltro = signal<string>('all');
  get searchTerm() { return this.termoBusca; }
  get filterCategory() { return this.categoriaFiltro; }

  get listaFiltrada(): DocumentoLicenca[] {
    return this.licencas().filter(l => {
      const termo = this.termoBusca().toLowerCase();
      const titulo = (l.titulo || l.title || '').toLowerCase();
      const numero = (l.numeroDocumento || l.documentNumber || '').toLowerCase();
      const orgao = (l.orgaoEmissor || l.issuingBody || '').toLowerCase();
      const categoria = l.categoria || l.category;

      const coincideBusca = titulo.includes(termo) || numero.includes(termo) || orgao.includes(termo);
      const coincideCategoria = this.categoriaFiltro() === 'all' || categoria === this.categoriaFiltro();
      return coincideBusca && coincideCategoria;
    });
  }
  get filteredList(): DocumentoLicenca[] { return this.listaFiltrada; }

  async aoSelecionarArquivo(evento: Event) {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];
    if (!arquivo) return;

    this.nomeArquivoEnviado.set(arquivo.name);
    this.erroOcr.set('');
    this.usouIaReal.set(false);
    this.estaDigitalizando.set(true);
    this.digitalizadoComSucesso.set(false);

    if (arquivo.size > 4 * 1024 * 1024) {
      this.estaDigitalizando.set(false);
      this.erroOcr.set('O arquivo excede o limite de 4 MB para OCR.');
      return;
    }

    this.etapaDigitalizacao.set('Enviando documento para leitura segura...');
    try {
      setTimeout(() => {
        if (this.estaDigitalizando()) this.etapaDigitalizacao.set('Extraindo campos: órgão emissor, datas e CNPJ...');
      }, 1500);
      setTimeout(() => {
        if (this.estaDigitalizando()) this.etapaDigitalizacao.set('Validando os dados extraídos...');
      }, 4000);

      const resultado = await this.gemini.extrairDeArquivo(arquivo);

      this.dadosExtraidos = {
        titulo: resultado.titulo,
        title: resultado.titulo,
        categoria: resultado.categoria,
        category: resultado.categoria,
        orgaoEmissor: resultado.orgaoEmissor,
        issuingBody: resultado.orgaoEmissor,
        numeroDocumento: resultado.numeroDocumento,
        documentNumber: resultado.numeroDocumento,
        unidadeId: this.dadosExtraidos.unidadeId,
        branchId: this.dadosExtraidos.unidadeId,
        dataEmissao: resultado.dataEmissao,
        issueDate: resultado.dataEmissao,
        dataVencimento: resultado.dataVencimento,
        expirationDate: resultado.dataVencimento,
        estimativaCustoRenovacao: resultado.estimativaCustoRenovacao,
        renewalCostEstimate: resultado.estimativaCustoRenovacao,
        estimativaMultaVencida: resultado.estimativaMultaVencida,
        estimatedFineIfExpired: resultado.estimativaMultaVencida,
        nomeAtivoVinculado: resultado.nomeAtivoVinculado,
        linkedAssetName: resultado.nomeAtivoVinculado,
        notaRequisitoLegal: resultado.notaRequisitoLegal,
        legalRequirementNote: resultado.notaRequisitoLegal
      };

      this.usouIaReal.set(true);
      this.estaDigitalizando.set(false);
      this.digitalizadoComSucesso.set(true);
    } catch (erro: any) {
      this.estaDigitalizando.set(false);
      this.erroOcr.set(erro?.message || 'Erro ao processar o documento.');
      this.digitalizadoComSucesso.set(false);
    }
  }
  onFileSelected(e: Event) { return this.aoSelecionarArquivo(e); }

  simularEnvioOcr(tipoExemplo: 'alvara' | 'bombeiros' | 'sanitaria') {
    this.estaDigitalizando.set(true);
    this.digitalizadoComSucesso.set(false);
    this.erroOcr.set('');
    this.usouIaReal.set(false);
    this.etapaDigitalizacao.set('1/3: Processando arquivo e aplicando OCR...');

    if (tipoExemplo === 'alvara') {
      this.dadosExtraidos = {
        titulo: 'Alvará de Funcionamento e Localização',
        title: 'Alvará de Funcionamento e Localização',
        categoria: 'Alvará',
        category: 'Alvará',
        orgaoEmissor: 'Prefeitura de São Paulo - Subprefeitura Sé',
        issuingBody: 'Prefeitura de São Paulo - Subprefeitura Sé',
        numeroDocumento: 'ALV-PMSP-2026-8819',
        documentNumber: 'ALV-PMSP-2026-8819',
        unidadeId: 'sp-matriz',
        branchId: 'sp-matriz',
        dataEmissao: '2026-09-01',
        issueDate: '2026-09-01',
        dataVencimento: '2027-09-01',
        expirationDate: '2027-09-01',
        estimativaCustoRenovacao: 1600,
        renewalCostEstimate: 1600,
        estimativaMultaVencida: 30000,
        estimatedFineIfExpired: 30000,
        nomeAtivoVinculado: 'Nenhum ativo direto',
        linkedAssetName: 'Nenhum ativo direto',
        notaRequisitoLegal: 'OCR detectou: Inscrição Municipal 4.819.002-1 com atividade compatível.',
        legalRequirementNote: 'OCR detectou: Inscrição Municipal 4.819.002-1 com atividade compatível.'
      };
    } else if (tipoExemplo === 'bombeiros') {
      this.dadosExtraidos = {
        titulo: 'AVCB - Renovação Auto de Vistoria dos Bombeiros',
        title: 'AVCB - Renovação Auto de Vistoria dos Bombeiros',
        categoria: 'Bombeiros',
        category: 'Bombeiros',
        orgaoEmissor: 'Corpo de Bombeiros Militar do Estado de SP',
        issuingBody: 'Corpo de Bombeiros Militar do Estado de SP',
        numeroDocumento: 'AVCB-BM-2026-4401',
        documentNumber: 'AVCB-BM-2026-4401',
        unidadeId: 'sp-matriz',
        branchId: 'sp-matriz',
        dataEmissao: '2026-09-10',
        issueDate: '2026-09-10',
        dataVencimento: '2027-09-10',
        expirationDate: '2027-09-10',
        estimativaCustoRenovacao: 3900,
        renewalCostEstimate: 3900,
        estimativaMultaVencida: 55000,
        estimatedFineIfExpired: 55000,
        nomeAtivoVinculado: 'Bateria de Extintores e Hidrantes - Bloco A e B',
        linkedAssetName: 'Bateria de Extintores e Hidrantes - Bloco A e B',
        notaRequisitoLegal: 'OCR detectou: Relação obrigatória com laudo de pressurização e recargas de extintores.',
        legalRequirementNote: 'OCR detectou: Relação obrigatória com laudo de pressurização e recargas de extintores.'
      };
    } else {
      this.dadosExtraidos = {
        titulo: 'Alvará Sanitário de Depósito de Insumos',
        title: 'Alvará Sanitário de Depósito de Insumos',
        categoria: 'Sanitária',
        category: 'Sanitária',
        orgaoEmissor: 'ANVISA / Vigilância Sanitária Estadual',
        issuingBody: 'ANVISA / Vigilância Sanitária Estadual',
        numeroDocumento: 'CMVS-SAN-9932-2026',
        documentNumber: 'CMVS-SAN-9932-2026',
        unidadeId: 'pr-cd',
        branchId: 'pr-cd',
        dataEmissao: '2026-08-20',
        issueDate: '2026-08-20',
        dataVencimento: '2027-08-20',
        expirationDate: '2027-08-20',
        estimativaCustoRenovacao: 2100,
        renewalCostEstimate: 2100,
        estimativaMultaVencida: 45000,
        estimatedFineIfExpired: 45000,
        nomeAtivoVinculado: 'Chiller de Refrigeração Industrial Trane',
        linkedAssetName: 'Chiller de Refrigeração Industrial Trane',
        notaRequisitoLegal: 'OCR detectou: Controle térmico contínuo e PMOC de refrigeração obrigatório.',
        legalRequirementNote: 'OCR detectou: Controle térmico contínuo e PMOC de refrigeração obrigatório.'
      };
    }

    setTimeout(() => { this.etapaDigitalizacao.set('2/3: Extraindo datas de vigência, CNPJ e valores regulatórios...'); }, 1200);
    setTimeout(() => { this.etapaDigitalizacao.set('3/3: Validando conformidade e regras de fiscalização...'); }, 2400);
    setTimeout(() => { this.estaDigitalizando.set(false); this.digitalizadoComSucesso.set(true); }, 3200);
  }
  simulateOcrUpload(sample: 'alvara' | 'bombeiros' | 'sanitaria') { this.simularEnvioOcr(sample); }

  salvarDocumentoExtraido() {
    const unidade = this.unidades().find(u => u.id === (this.dadosExtraidos.unidadeId || this.dadosExtraidos.branchId)) || this.unidades()[0];
    const dataVenc = new Date(this.dadosExtraidos.dataVencimento || this.dadosExtraidos.expirationDate);
    const agora = new Date();
    const diasRestantes = Math.max(1, Math.ceil((dataVenc.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)));

    let status: StatusConformidade = 'regular';
    if (diasRestantes <= 30) status = 'attention';
    if (diasRestantes <= 7) status = 'urgent';

    const titulo = this.dadosExtraidos.titulo || this.dadosExtraidos.title;
    const nomeArquivo = this.nomeArquivoEnviado() || titulo.replace(/\s+/g, '_') + '.pdf';

    const novoDocumento: DocumentoLicenca = {
      id: 'lic-' + Date.now(),
      unidadeId: unidade.id,
      branchId: unidade.id,
      nomeUnidade: unidade.nome || unidade.name || '',
      branchName: unidade.nome || unidade.name || '',
      titulo,
      title: titulo,
      categoria: this.dadosExtraidos.categoria,
      category: this.dadosExtraidos.categoria,
      orgaoEmissor: this.dadosExtraidos.orgaoEmissor,
      issuingBody: this.dadosExtraidos.orgaoEmissor,
      numeroDocumento: this.dadosExtraidos.numeroDocumento,
      documentNumber: this.dadosExtraidos.numeroDocumento,
      dataEmissao: this.dadosExtraidos.dataEmissao,
      issueDate: this.dadosExtraidos.dataEmissao,
      dataVencimento: this.dadosExtraidos.dataVencimento,
      expirationDate: this.dadosExtraidos.dataVencimento,
      diasRestantes,
      daysRemaining: diasRestantes,
      status,
      estimativaCustoRenovacao: this.dadosExtraidos.estimativaCustoRenovacao,
      renewalCostEstimate: this.dadosExtraidos.estimativaCustoRenovacao,
      estimativaMultaVencida: this.dadosExtraidos.estimativaMultaVencida,
      estimatedFineIfExpired: this.dadosExtraidos.estimativaMultaVencida,
      nomeAtivoVinculado: (this.dadosExtraidos.nomeAtivoVinculado === 'Nenhum ativo direto') ? undefined : this.dadosExtraidos.nomeAtivoVinculado,
      linkedAssetName: (this.dadosExtraidos.nomeAtivoVinculado === 'Nenhum ativo direto') ? undefined : this.dadosExtraidos.nomeAtivoVinculado,
      notaRequisitoLegal: this.dadosExtraidos.notaRequisitoLegal,
      legalRequirementNote: this.dadosExtraidos.notaRequisitoLegal,
      nomeArquivo,
      fileName: nomeArquivo,
      tamanhoArquivo: '—',
      fileSize: '—',
      extraidoViaOcr: true,
      ocrExtracted: true,
      inclusoNoDossie: true,
      dossierIncluded: true,
      versoes: [{
        id: 'ver-' + Date.now(),
        rotulo: 'Versão 1 · vigente',
        label: 'Versão 1 · vigente',
        dataEnvio: 'Agora mesmo',
        uploadedAt: 'Agora mesmo',
        enviadoPor: 'Usuário Logado',
        uploadedBy: 'Usuário Logado',
        nomeArquivo,
        fileName: nomeArquivo,
        tamanhoArquivo: '—',
        fileSize: '—',
        status: 'current'
      }]
    };

    this.servico.adicionarLicenca(novoDocumento);
    this.nomeArquivoEnviado.set('');
    this.digitalizadoComSucesso.set(false);
    this.usouIaReal.set(false);
  }
  saveExtractedDocument() { this.salvarDocumentoExtraido(); }

  abrirHistorico(documento: DocumentoLicenca) { this.documentoHistoricoSelecionado.set(documento); }
  openHistory(d: DocumentoLicenca) { this.abrirHistorico(d); }

  fecharHistorico() { this.documentoHistoricoSelecionado.set(null); }
  closeHistory() { this.fecharHistorico(); }
}

export const DigitalVaultComponent = CofreDigitalComponente;
