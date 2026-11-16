import { Component, inject, signal } from '@angular/core';
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
  readonly privacyRead = signal(false);

  openMode(mode: 'login' | 'signup') {
    this.privacyRead.set(false);
    if (mode === 'signup') this.servico.openSignup();
    else this.servico.openLogin();
  }

  voltarAoSite() {
    this.servico.definirVisao('landing');
  }
}

export const AuthComponent = AutenticacaoComponente;
