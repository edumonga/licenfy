import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { Branch, LicenseDocument } from '../../core/models/types';

@Component({
  selector: 'app-inspection-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection-mode.component.html',
  styleUrls: ['./inspection-mode.component.css']
})
export class InspectionModeComponent {
  readonly service = inject(LicenfyService);

  readonly branches = this.service.branches;
  readonly selectedBranchId = signal<string>('sp-matriz');
  readonly selectedDocumentIds = signal<string[]>(['lic-001', 'lic-002']);
  readonly dossierHistory = this.service.dossierHistory;

  readonly currentBranch = computed<Branch>(() => {
    return this.branches().find(b => b.id === this.selectedBranchId()) || this.branches()[0];
  });

  readonly branchLicenses = computed<LicenseDocument[]>(() => {
    return this.service.licenses().filter(l => l.branchId === this.selectedBranchId() && l.dossierIncluded && this.selectedDocumentIds().includes(l.id));
  });

  readonly availableDocuments = computed<LicenseDocument[]>(() => this.service.licenses().filter(l => l.branchId === this.selectedBranchId() && l.dossierIncluded));

  readonly generatedTimestamp = signal<string>('15/09/2026 às 14:32:10');
  readonly verificationHash = signal<string>('LCFY-8819-7261-F992-B831');

  selectBranch(id: string) {
    this.selectedBranchId.set(id);
    this.selectedDocumentIds.set(this.service.licenses().filter(doc => doc.branchId === id && doc.dossierIncluded).map(doc => doc.id));
    this.regenerateDossier();
  }

  toggleDocument(documentId: string) {
    this.selectedDocumentIds.update(ids => ids.includes(documentId) ? ids.filter(id => id !== documentId) : [...ids, documentId]);
    this.regenerateDossier();
  }

  regenerateDossier() {
    const now = new Date();
    this.generatedTimestamp.set(
      now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR')
    );
    this.verificationHash.set('LCFY-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString().slice(-4));
  }

  printDossier() {
    this.service.addDossierHistory({
      id: 'dos-' + Date.now(), branchId: this.selectedBranchId(), branchName: this.currentBranch().name,
      generatedAt: this.generatedTimestamp(), documentCount: this.branchLicenses().length, hash: this.verificationHash()
    });
    window.print();
  }
}
