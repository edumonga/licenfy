import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenfyService } from '../../core/services/licenfy.service';
import { PhysicalAsset } from '../../core/models/types';

@Component({
  selector: 'app-asset-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.css']
})
export class AssetManagementComponent {
  readonly service = inject(LicenfyService);

  readonly assets = this.service.filteredAssets;
  readonly branches = this.service.branches;

  // Modais de QR Code e Visão Mobile
  readonly selectedAssetForQr = signal<PhysicalAsset | null>(null);
  readonly selectedAssetForMobile = signal<PhysicalAsset | null>(null);

  // Filtro de Categoria
  selectedCategory = signal<string>('all');

  get filteredAssetsList(): PhysicalAsset[] {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.assets();
    return this.assets().filter(a => a.category === cat);
  }

  readonly incidentReported = signal<boolean>(false);

  openQrModal(asset: PhysicalAsset) {
    this.selectedAssetForQr.set(asset);
  }

  closeQrModal() {
    this.selectedAssetForQr.set(null);
  }

  openMobileSimulator(asset: PhysicalAsset) {
    this.selectedAssetForMobile.set(asset);
    this.incidentReported.set(false);
  }

  closeMobileSimulator() {
    this.selectedAssetForMobile.set(null);
  }

  onReportIncident() {
    this.incidentReported.set(true);
    setTimeout(() => {
      this.incidentReported.set(false);
    }, 4000);
  }

  printTag() {
    window.print();
  }
}
