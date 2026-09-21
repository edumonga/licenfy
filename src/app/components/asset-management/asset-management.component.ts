import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { PhysicalAsset } from '../../core/models/types';
import { QrCanvasComponent } from '../qr-canvas/qr-canvas.component';

@Component({
  selector: 'app-asset-management',
  standalone: true,
  imports: [CommonModule, FormsModule, QrCanvasComponent],
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.css']
})
export class AssetManagementComponent {
  readonly service = inject(LicenfyService);

  readonly assets = this.service.filteredAssets;
  readonly branches = this.service.branches;

  // QR Canvas reference para download
  @ViewChild(QrCanvasComponent) qrCanvas?: QrCanvasComponent;
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
  readonly showAssetForm = signal<boolean>(false);
  newAsset = { name: '', assetTag: '', branchId: 'sp-matriz', invoiceNumber: '', warrantyExpirationDate: '' };

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

  saveAsset() {
    if (!this.newAsset.name || !this.newAsset.assetTag || !this.newAsset.invoiceNumber) return;
    const branch = this.branches().find(item => item.id === this.newAsset.branchId) || this.branches()[0];
    const warranty = this.newAsset.warrantyExpirationDate || '2027-09-20';
    const days = Math.max(1, Math.ceil((new Date(warranty).getTime() - new Date('2026-09-20').getTime()) / 86400000));
    this.service.addAsset({
      id: 'ast-' + Date.now(), assetTag: this.newAsset.assetTag, qrCodeValue: `https://app.licenfy.com.br/asset/${this.newAsset.assetTag}`,
      name: this.newAsset.name, category: 'Segurança', branchId: branch.id, branchName: branch.name,
      locationDetails: 'Localização a confirmar', brandModel: 'Modelo a confirmar', serialNumber: 'Não informado', invoiceNumber: this.newAsset.invoiceNumber,
      purchaseDate: '2026-09-20', warrantyExpirationDate: warranty, isWarrantyActive: true, daysUntilWarrantyExpires: days,
      lastMaintenanceDate: 'Sem registros', nextMaintenanceDate: 'A programar', maintenanceStatus: 'regular', maintenances: []
    });
    this.showAssetForm.set(false);
    this.newAsset = { name: '', assetTag: '', branchId: 'sp-matriz', invoiceNumber: '', warrantyExpirationDate: '' };
  }
}
