import { Component, inject } from '@angular/core';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { PreferenciasService } from '../../core/services/preferencias.service';
import { PreferencesToolbarComponent } from '../preferences-toolbar/preferences-toolbar.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [PreferencesToolbarComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AutenticacaoComponente {
  readonly servico = inject(ServicoLicenfy);
  readonly prefs = inject(PreferenciasService);

  voltarAoSite() {
    this.servico.definirVisao('landing');
  }
}

export const AuthComponent = AutenticacaoComponente;
