import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Idioma, PreferenciasService } from '../../core/services/preferencias.service';

@Component({
  selector: 'app-preferences-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preferences-toolbar.component.html',
  styleUrls: ['./preferences-toolbar.component.css']
})
export class PreferencesToolbarComponent {
  readonly prefs = inject(PreferenciasService);
  abrirMenu = false;

  alternarMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.abrirMenu = !this.abrirMenu;
  }

  selecionar(idioma: Idioma) {
    this.prefs.definirIdioma(idioma);
    this.abrirMenu = false;
  }

  @HostListener('document:click', ['$event'])
  fecharMenu(event: MouseEvent) {
    const alvo = event.target as HTMLElement;
    if (!alvo.closest('.prefs-toolbar')) this.abrirMenu = false;
  }
}
