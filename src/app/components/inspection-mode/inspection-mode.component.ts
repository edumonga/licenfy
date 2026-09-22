import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { Unidade, DocumentoLicenca, Branch, LicenseDocument } from '../../core/models/types';

@Component({
  selector: 'app-inspection-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection-mode.component.html',
  styleUrls: ['./inspection-mode.component.css']
})
export class ModoInspecaoComponente {
  readonly servico = inject(ServicoLicenfy);

  readonly unidades = this.servico.unidades;
  readonly unidadeSelecionadaId = signal<string>('sp-matriz');
  readonly idsDocumentosSelecionados = signal<string[]>(['lic-001', 'lic-002']);
  readonly historicoDossie = this.servico.historicoDossie;

  readonly unidadeAtual = computed<Unidade>(() => {
    return this.unidades().find(b => b.id === this.unidadeSelecionadaId()) || this.unidades()[0];
  });

  readonly licencasDaUnidade = computed<DocumentoLicenca[]>(() => {
    return this.servico.licencas().filter(l =>
      (l.unidadeId === this.unidadeSelecionadaId() || l.branchId === this.unidadeSelecionadaId()) &&
      (l.inclusoNoDossie || l.dossierIncluded) &&
      this.idsDocumentosSelecionados().includes(l.id)
    );
  });

  readonly documentosDisponiveis = computed<DocumentoLicenca[]>(() =>
    this.servico.licencas().filter(l =>
      (l.unidadeId === this.unidadeSelecionadaId() || l.branchId === this.unidadeSelecionadaId()) &&
      (l.inclusoNoDossie || l.dossierIncluded)
    )
  );

  readonly dataHoraGeracao = signal<string>('15/09/2026 às 14:32:10');
  readonly hashVerificacao = signal<string>('LCFY-8819-7261-F992-B831');

  // Compatibilidade
  get service() { return this.servico; }
  get branches() { return this.unidades; }
  get selectedBranchId() { return this.unidadeSelecionadaId; }
  get selectedDocumentIds() { return this.idsDocumentosSelecionados; }
  get dossierHistory() { return this.historicoDossie; }
  get currentBranch() { return this.unidadeAtual; }
  get branchLicenses() { return this.licencasDaUnidade; }
  get availableDocuments() { return this.documentosDisponiveis; }
  get generatedTimestamp() { return this.dataHoraGeracao; }
  get verificationHash() { return this.hashVerificacao; }

  selecionarUnidade(id: string) {
    this.unidadeSelecionadaId.set(id);
    this.idsDocumentosSelecionados.set(
      this.servico.licencas()
        .filter(doc => (doc.unidadeId === id || doc.branchId === id) && (doc.inclusoNoDossie || doc.dossierIncluded))
        .map(doc => doc.id)
    );
    this.regenerarDossie();
  }
  selectBranch(id: string) { this.selecionarUnidade(id); }

  alternarDocumento(documentId: string) {
    this.idsDocumentosSelecionados.update(ids =>
      ids.includes(documentId) ? ids.filter(id => id !== documentId) : [...ids, documentId]
    );
    this.regenerarDossie();
  }
  toggleDocument(id: string) { this.alternarDocumento(id); }

  regenerarDossie() {
    const agora = new Date();
    this.dataHoraGeracao.set(
      agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR')
    );
    this.hashVerificacao.set('LCFY-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString().slice(-4));
  }
  regenerateDossier() { this.regenerarDossie(); }

  imprimirDossie() {
    const nomeUnidade = this.unidadeAtual().nome || this.unidadeAtual().name || '';
    this.servico.adicionarHistoricoDossie({
      id: 'dos-' + Date.now(),
      unidadeId: this.unidadeSelecionadaId(),
      branchId: this.unidadeSelecionadaId(),
      nomeUnidade,
      branchName: nomeUnidade,
      geradoEm: this.dataHoraGeracao(),
      generatedAt: this.dataHoraGeracao(),
      quantidadeDocumentos: this.licencasDaUnidade().length,
      documentCount: this.licencasDaUnidade().length,
      codigoVerificacao: this.hashVerificacao(),
      hash: this.hashVerificacao()
    });
    window.print();
  }
  printDossier() { this.imprimirDossie(); }
}

export const InspectionModeComponent = ModoInspecaoComponente;
