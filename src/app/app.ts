import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from './core/services/licenfy.service';
import { AuthService } from './core/services/auth.service';
import { PreferenciasService } from './core/services/preferencias.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DigitalVaultComponent } from './components/digital-vault/digital-vault.component';
import { AssetManagementComponent } from './components/asset-management/asset-management.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { InspectionModeComponent } from './components/inspection-mode/inspection-mode.component';
import { RoiReportComponent } from './components/roi-report/roi-report.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { UnitManagementComponent } from './components/unit-management/unit-management.component';
import { AuthComponent } from './components/auth/auth.component';
import { PreferencesToolbarComponent } from './components/preferences-toolbar/preferences-toolbar.component';
import { AccountComponent } from './components/account/account.component';
import { CheckoutComponent } from './components/checkout/checkout.component';

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
    RoiReportComponent,
    AccountComponent,
    CheckoutComponent,
    PreferencesToolbarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  readonly service = inject(LicenfyService);
  readonly auth = inject(AuthService);
  readonly prefs = inject(PreferenciasService);

  readonly currentView = this.service.currentView;
  readonly currentTab = this.service.currentTab;
  readonly currentUser = this.auth.user;
  readonly branches = this.service.branches;
  readonly selectedBranchId = this.service.selectedBranchId;
  readonly score = this.service.overallComplianceScore;
  readonly status = this.service.overallComplianceStatus;

  readonly isMobileMenuOpen = signal(false);
  readonly isDesktopSidebarOpen = signal(false);
  readonly publicAssetTag = signal(this.getPublicAssetTag());
  readonly publicAsset = computed(() => {
    const assetTag = this.publicAssetTag();
    return assetTag ? this.service.assets().find(asset => asset.assetTag === assetTag) || null : null;
  });

  private getPublicAssetTag(): string | null {
    const match = window.location.pathname.match(/^\/asset\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  toggleDesktopSidebar() {
    this.isDesktopSidebarOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  setView(view: 'landing' | 'auth' | 'app') {
    this.service.setView(view);
    this.closeMobileMenu();
  }

  setTab(tab: 'dashboard' | 'units' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi' | 'account') {
    this.service.setTab(tab);
    this.closeMobileMenu();
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
