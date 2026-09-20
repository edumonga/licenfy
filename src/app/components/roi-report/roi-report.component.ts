import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenfyService } from '../../core/services/licenfy.service';

@Component({
  selector: 'app-roi-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roi-report.component.html',
  styleUrls: ['./roi-report.component.css']
})
export class RoiReportComponent {
  readonly service = inject(LicenfyService);

  readonly roi = this.service.roiData;

  // Custo estimado de assinatura anual Licenfy para fins de cálculo de ROI
  readonly annualSoftwareCost = 14400;

  get netRoi(): number {
    return this.roi().totalFinancialGain - this.annualSoftwareCost;
  }

  get roiMultiplier(): string {
    return (this.roi().totalFinancialGain / this.annualSoftwareCost).toFixed(1) + 'x';
  }
}
