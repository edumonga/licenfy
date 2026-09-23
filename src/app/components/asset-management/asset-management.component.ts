import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { AtivoFisico, PhysicalAsset } from '../../core/models/types';
import { QrCanvasComponente } from '../qr-canvas/qr-canvas.component';

@Component({
  selector: 'app-asset-management',
  standalone: true,
  imports: [CommonModule, FormsModule, QrCanvasComponente],
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.css']
})
export class GestaoAtivosComponente {
  readonly servico = inject(ServicoLicenfy);

  readonly ativos = this.servico.ativosFiltrados;
  readonly unidades = this.servico.unidades;

  @ViewChild(QrCanvasComponente) referenciaQrCanvas?: QrCanvasComponente;
  get qrCanvas() { return this.referenciaQrCanvas; }

  readonly ativoSelecionadoParaQr = signal<AtivoFisico | null>(null);
  readonly ativoSelecionadoParaMobile = signal<AtivoFisico | null>(null);
  readonly categoriaSelecionada = signal<string>('all');

  readonly incidenteReportado = signal<boolean>(false);
  readonly exibirFormularioAtivo = signal<boolean>(false);

  novoAtivo = {
    nome: '',
    name: '',
    etiquetaPatrimonio: '',
    assetTag: '',
    unidadeId: 'sp-matriz',
    branchId: 'sp-matriz',
    numeroNotaFiscal: '',
    invoiceNumber: '',
    dataFimGarantia: '',
    warrantyExpirationDate: ''
  };

  get service() { return this.servico; }
  get assets() { return this.ativos; }
  get branches() { return this.unidades; }
  get selectedAssetForQr() { return this.ativoSelecionadoParaQr; }
  get selectedAssetForMobile() { return this.ativoSelecionadoParaMobile; }
  get selectedCategory() { return this.categoriaSelecionada; }
  get incidentReported() { return this.incidenteReportado; }
  get showAssetForm() { return this.exibirFormularioAtivo; }
  get newAsset() { return this.novoAtivo; }
  set newAsset(v: any) { this.novoAtivo = v; }

  get listaAtivosFiltrados(): AtivoFisico[] {
    const categoria = this.categoriaSelecionada();
    if (categoria === 'all') return this.ativos();
    return this.ativos().filter(a => (a.categoria || a.category) === categoria);
  }
  get filteredAssetsList(): AtivoFisico[] { return this.listaAtivosFiltrados; }

  abrirModalQr(ativo: AtivoFisico) {
    this.ativoSelecionadoParaQr.set(ativo);
  }
  openQrModal(a: AtivoFisico) { this.abrirModalQr(a); }

  fecharModalQr() {
    this.ativoSelecionadoParaQr.set(null);
  }
  closeQrModal() { this.fecharModalQr(); }

  abrirSimuladorMobile(ativo: AtivoFisico) {
    this.ativoSelecionadoParaMobile.set(ativo);
    this.incidenteReportado.set(false);
  }
  openMobileSimulator(a: AtivoFisico) { this.abrirSimuladorMobile(a); }

  fecharSimuladorMobile() {
    this.ativoSelecionadoParaMobile.set(null);
  }
  closeMobileSimulator() { this.fecharSimuladorMobile(); }

  reportarIncidente() {
    this.incidenteReportado.set(true);
    setTimeout(() => {
      this.incidenteReportado.set(false);
    }, 4000);
  }
  onReportIncident() { this.reportarIncidente(); }

  imprimirEtiqueta() {
    window.print();
  }
  printTag() { this.imprimirEtiqueta(); }

  salvarAtivo() {
    const nome = this.novoAtivo.nome || this.novoAtivo.name;
    const etiqueta = this.novoAtivo.etiquetaPatrimonio || this.novoAtivo.assetTag;
    const nota = this.novoAtivo.numeroNotaFiscal || this.novoAtivo.invoiceNumber;
    const unidadeId = this.novoAtivo.unidadeId || this.novoAtivo.branchId;
    const garantia = this.novoAtivo.dataFimGarantia || this.novoAtivo.warrantyExpirationDate || '2027-09-20';

    if (!nome || !etiqueta || !nota) return;

    const unidade = this.unidades().find(item => item.id === unidadeId) || this.unidades()[0];
    const dias = Math.max(1, Math.ceil((new Date(garantia).getTime() - new Date('2026-09-20').getTime()) / 86400000));

    this.servico.adicionarAtivo({
      id: 'ast-' + Date.now(),
      etiquetaPatrimonio: etiqueta,
      assetTag: etiqueta,
      valorQrCode: `https://licenfy.vercel.app/asset/${encodeURIComponent(etiqueta)}`,
      qrCodeValue: `https://licenfy.vercel.app/asset/${encodeURIComponent(etiqueta)}`,
      nome,
      name: nome,
      categoria: 'Segurança',
      category: 'Segurança',
      unidadeId: unidade.id,
      branchId: unidade.id,
      nomeUnidade: unidade.nome || unidade.name || '',
      branchName: unidade.nome || unidade.name || '',
      detalhesLocalizacao: 'Localização a confirmar',
      locationDetails: 'Localização a confirmar',
      marcaModelo: 'Modelo a confirmar',
      brandModel: 'Modelo a confirmar',
      numeroSerie: 'Não informado',
      serialNumber: 'Não informado',
      numeroNotaFiscal: nota,
      invoiceNumber: nota,
      dataAquisicao: '2026-09-20',
      purchaseDate: '2026-09-20',
      dataFimGarantia: garantia,
      warrantyExpirationDate: garantia,
      garantiaAtiva: true,
      isWarrantyActive: true,
      diasAteFimGarantia: dias,
      daysUntilWarrantyExpires: dias,
      dataUltimaManutencao: 'Sem registros',
      lastMaintenanceDate: 'Sem registros',
      dataProximaManutencao: 'A programar',
      nextMaintenanceDate: 'A programar',
      statusManutencao: 'regular',
      maintenanceStatus: 'regular',
      manutencoes: []
    });

    this.exibirFormularioAtivo.set(false);
    this.novoAtivo = {
      nome: '',
      name: '',
      etiquetaPatrimonio: '',
      assetTag: '',
      unidadeId: 'sp-matriz',
      branchId: 'sp-matriz',
      numeroNotaFiscal: '',
      invoiceNumber: '',
      dataFimGarantia: '',
      warrantyExpirationDate: ''
    };
  }
  saveAsset() { this.salvarAtivo(); }
}

export const AssetManagementComponent = GestaoAtivosComponente;
