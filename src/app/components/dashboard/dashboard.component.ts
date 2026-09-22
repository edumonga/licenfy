import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { DocumentoLicenca } from '../../core/models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class PainelComponente {
  readonly servico = inject(ServicoLicenfy);

  readonly unidades = this.servico.unidades;
  readonly unidadeSelecionadaId = this.servico.unidadeSelecionadaId;
  readonly licencas = this.servico.licencasFiltradas;
  readonly pontuacao = this.servico.pontuacaoGeralConformidade;
  readonly status = this.servico.statusGeralConformidade;
  readonly resumo = this.servico.resumoContadores;

  idRecemNotificado = '';

  // Compatibilidade
  get service() { return this.servico; }
  get branches() { return this.unidades; }
  get selectedBranchId() { return this.unidadeSelecionadaId; }
  get licenses() { return this.licencas; }
  get score() { return this.pontuacao; }
  get summary() { return this.resumo; }
  get justNotifiedId() { return this.idRecemNotificado; }
  set justNotifiedId(valor: string) { this.idRecemNotificado = valor; }

  selecionarUnidade(id: string) {
    this.servico.definirUnidadeSelecionada(id);
  }
  selectBranch(id: string) { this.selecionarUnidade(id); }

  notificarGestor(licenca: DocumentoLicenca) {
    this.servico.enviarEmailSimulado(licenca);
    this.idRecemNotificado = licenca.id;
    setTimeout(() => {
      this.idRecemNotificado = '';
    }, 3000);
  }
  notifyManager(licenca: DocumentoLicenca) { this.notificarGestor(licenca); }

  irParaCofre() {
    this.servico.definirAba('vault');
  }
  goToVault() { this.irParaCofre(); }

  irParaAtivos() {
    this.servico.definirAba('assets');
  }
  goToAssets() { this.irParaAtivos(); }

  irParaInspecao() {
    this.servico.definirAba('inspection');
  }
  goToInspection() { this.irParaInspecao(); }
}

export const DashboardComponent = PainelComponente;
