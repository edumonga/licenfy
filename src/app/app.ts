import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from './core/services/licenfy.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DigitalVaultComponent } from './components/digital-vault/digital-vault.component';
import { AssetManagementComponent } from './components/asset-management/asset-management.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { InspectionModeComponent } from './components/inspection-mode/inspection-mode.component';
import { RoiReportComponent } from './components/roi-report/roi-report.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LandingPageComponent,
    DashboardComponent,
    DigitalVaultComponent,
    AssetManagementComponent,
    NotificationsComponent,
    InspectionModeComponent,
    RoiReportComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  readonly service = inject(LicenfyService);

  readonly currentView = this.service.currentView;
  readonly currentTab = this.service.currentTab;
  readonly branches = this.service.branches;
  readonly selectedBranchId = this.service.selectedBranchId;
  readonly score = this.service.overallComplianceScore;
  readonly status = this.service.overallComplianceStatus;

  setView(view: 'landing' | 'app') {
    this.service.setView(view);
  }

  setTab(tab: 'dashboard' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi') {
    this.service.setTab(tab);
  }

  onBranchChange(id: string) {
    this.service.setSelectedBranch(id);
  }
}
