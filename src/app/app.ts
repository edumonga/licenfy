import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from './core/services/licenfy.service';
import { AuthService } from './core/services/auth.service';
import { GeminiOcrService } from './core/services/gemini-ocr.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DigitalVaultComponent } from './components/digital-vault/digital-vault.component';
import { AssetManagementComponent } from './components/asset-management/asset-management.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { InspectionModeComponent } from './components/inspection-mode/inspection-mode.component';
import { RoiReportComponent } from './components/roi-report/roi-report.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { UnitManagementComponent } from './components/unit-management/unit-management.component';
import { AuthComponent } from './components/auth/auth.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LandingPageComponent,
    AuthComponent,
    UnitManagementComponent,
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
  readonly auth = inject(AuthService);
  readonly gemini = inject(GeminiOcrService);

  readonly currentView = this.service.currentView;
  readonly currentTab = this.service.currentTab;
  readonly currentUser = this.auth.user;
  readonly branches = this.service.branches;
  readonly selectedBranchId = this.service.selectedBranchId;
  readonly score = this.service.overallComplianceScore;
  readonly status = this.service.overallComplianceStatus;

  constructor() {
    // Configura a chave Gemini no localStorage se ainda não estiver configurada
    if (!this.gemini.isConfigured()) {
      this.gemini.setApiKey('');
    }
  }

  setView(view: 'landing' | 'auth' | 'app') {
    this.service.setView(view);
  }

  setTab(tab: 'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi') {
    this.service.setTab(tab);
  }

  onBranchChange(id: string) {
    this.service.setSelectedBranch(id);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user || !user.name) return 'LC';
    const parts = user.name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.service.setView('landing');
  }
}
