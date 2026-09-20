import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenfyService } from '../../core/services/licenfy.service';
import { LicenseDocument } from '../../core/models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  readonly service = inject(LicenfyService);

  readonly branches = this.service.branches;
  readonly selectedBranchId = this.service.selectedBranchId;
  readonly licenses = this.service.filteredLicenses;
  readonly score = this.service.overallComplianceScore;
  readonly status = this.service.overallComplianceStatus;
  readonly summary = this.service.countsSummary;

  // Feedback visual de disparo de notificação
  justNotifiedId = '';

  selectBranch(id: string) {
    this.service.setSelectedBranch(id);
  }

  notifyManager(license: LicenseDocument) {
    this.service.sendSimulatedWhatsApp(license);
    this.justNotifiedId = license.id;
    setTimeout(() => {
      this.justNotifiedId = '';
    }, 3000);
  }

  goToVault() {
    this.service.setTab('vault');
  }

  goToAssets() {
    this.service.setTab('assets');
  }

  goToInspection() {
    this.service.setTab('inspection');
  }
}
