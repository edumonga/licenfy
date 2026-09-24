import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { PreferenciasService } from '../../core/services/preferencias.service';

@Component({
  selector: 'app-roi-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roi-report.component.html',
  styleUrls: ['./roi-report.component.css']
})
export class RelatorioRoiComponente {
  readonly servico = inject(ServicoLicenfy);
  readonly prefs = inject(PreferenciasService);
  readonly roi = this.servico.dadosRoi;

  readonly custoAnualSoftware = 14400;

  get roiLiquido(): number {
    const ganho = this.roi().ganhoFinanceiroTotal ?? this.roi().totalFinancialGain ?? 0;
    return ganho - this.custoAnualSoftware;
  }

  get multiplicadorRoi(): string {
    const ganho = this.roi().ganhoFinanceiroTotal ?? this.roi().totalFinancialGain ?? 0;
    return (ganho / this.custoAnualSoftware).toFixed(1) + 'x';
  }

  get service() { return this.servico; }
  get annualSoftwareCost() { return this.custoAnualSoftware; }
  get netRoi(): number { return this.roiLiquido; }
  get roiMultiplier(): string { return this.multiplicadorRoi; }
}

export const RoiReportComponent = RelatorioRoiComponente;
