import { Component, computed, inject } from '@angular/core';
import { LicenfyService } from '../../core/services/licenfy.service';
import { PreferenciasService } from '../../core/services/preferencias.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  readonly service = inject(LicenfyService);
  readonly prefs = inject(PreferenciasService);
  readonly annual = computed(() => this.service.planoCheckout() === 'annual');
  readonly planName = computed(() =>
    this.prefs.t(this.annual() ? 'landing.annual' : 'landing.monthly'),
  );
}
