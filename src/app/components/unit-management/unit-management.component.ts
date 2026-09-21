import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { Branch } from '../../core/models/types';

@Component({
  selector: 'app-unit-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-management.component.html',
  styleUrls: ['./unit-management.component.css']
})
export class UnitManagementComponent {
  readonly service = inject(LicenfyService);
  readonly branches = this.service.branches;
  readonly selectedUnitId = signal('sp-matriz');
  readonly showForm = signal(false);

  newUnit = { name: '', cnpj: '', city: '', state: '', address: '', manager: '', email: '', phone: '' };

  get selectedUnit(): Branch {
    return this.branches().find(unit => unit.id === this.selectedUnitId()) || this.branches()[0];
  }

  selectUnit(id: string) { this.selectedUnitId.set(id); }

  saveUnit() {
    if (!this.newUnit.name || !this.newUnit.cnpj || !this.newUnit.manager) return;
    const id = 'unit-' + Date.now();
    this.service.addBranch({
      id,
      name: this.newUnit.name,
      cnpj: this.newUnit.cnpj,
      city: this.newUnit.city || 'Não informado',
      state: this.newUnit.state || 'SP',
      address: this.newUnit.address || 'Endereço a confirmar',
      companyName: 'Grupo Alpha Brasil S.A.',
      responsibleManager: `${this.newUnit.manager} (Gestor da unidade)`,
      responsiblePeople: [{ id: id + '-primary', name: this.newUnit.manager, role: 'Gestor da unidade', email: this.newUnit.email, phone: this.newUnit.phone, primary: true }],
      complianceScore: 100,
      status: 'regular',
      licensesCount: { total: 0, regular: 0, attention: 0, urgent: 0 },
      assetsCount: { total: 0, withActiveWarranty: 0, maintenancePending: 0 }
    });
    this.selectedUnitId.set(id);
    this.showForm.set(false);
    this.newUnit = { name: '', cnpj: '', city: '', state: '', address: '', manager: '', email: '', phone: '' };
  }
}
