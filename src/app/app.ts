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
import { WorkspaceService } from './core/services/workspace.service';

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
  host: { '(window:beforeunload)': 'confirmUnsavedChanges($event)' },
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  readonly service = inject(LicenfyService);
  readonly auth = inject(AuthService);
  readonly workspace = inject(WorkspaceService);
  readonly prefs = inject(PreferenciasService);

  readonly currentView = this.service.currentView;
  readonly currentTab = this.service.currentTab;
  readonly currentUser = this.auth.user;
  readonly branches = this.service.branches;
  readonly selectedBranchId = this.service.selectedBranchId;
  readonly score = this.service.overallComplianceScore;
  readonly status = this.service.overallComplianceStatus;
  readonly selectedBranchName = computed(() => {
    const id = this.selectedBranchId();
    return id === 'all' ? this.prefs.t('shell.allUnits') : this.branches().find(branch => branch.id === id)?.name || this.prefs.t('shell.allUnits');
  });

  readonly isMobileMenuOpen = signal(false);
  readonly isDesktopSidebarOpen = signal(false);
  readonly isBranchPickerOpen = signal(false);
  readonly publicAssetTag = signal(this.getPublicAssetTag());
  readonly publicAsset = computed(() => {
    const assetTag = this.publicAssetTag();
    return assetTag ? this.service.assets().find(asset => asset.assetTag === assetTag) || null : null;
  });

  ngOnInit() {
    if (this.publicAssetTag()) return;
    const url = new URL(window.location.href);
    const result = url.searchParams.get('login');
    const passwordResults = {
      'manual-invalido': 'credentials',
      'manual-limite': 'rate',
      'manual-erro': 'unavailable',
    } as const;
    const passwordError = result && Object.hasOwn(passwordResults, result)
      ? passwordResults[result as keyof typeof passwordResults] : null;
    const needsContact = result === 'contato' || result === 'criar' || result === 'privacidade';
    if (passwordError || result === 'ok' || result === 'erro' || needsContact) {
      url.searchParams.delete('login');
      window.history.replaceState(null, '', url);
    }

    void this.auth.restaurarSessao().then(authenticated => {
      if (authenticated) void this.workspace.load();
      if (passwordError) {
        this.service.openLogin();
        this.service.erroSenha.set(passwordError);
      } else if (needsContact) {
        this.service.openLogin();
        this.service.acessoPorContato.set(true);
      } else if (result === 'erro' || (result === 'ok' && !authenticated)) {
        this.service.openLogin();
        this.service.erroAutenticacao.set(true);
      } else if (authenticated && this.currentView() === 'landing') {
        this.service.setView('app');
      }
    });
  }

  confirmUnsavedChanges(event: BeforeUnloadEvent) {
    if (this.workspace.hasUnsavedChanges()) event.preventDefault();
  }

  reloadWorkspace() {
    window.location.reload();
  }

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
    this.isBranchPickerOpen.set(false);
  }

  toggleBranchPicker() {
    this.isBranchPickerOpen.update(open => !open);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user || !user.name) return 'LC';
    const parts = user.name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  async logout() {
    try {
      await this.workspace.flush();
      if (this.workspace.hasUnsavedChanges()) return;
      await this.auth.logout();
      window.location.replace('/');
    } catch {
      window.alert(this.prefs.t('auth.logoutError'));
    }
  }
}
