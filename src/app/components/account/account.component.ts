import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LicenfyService } from '../../core/services/licenfy.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  readonly auth = inject(AuthService);
  readonly service = inject(LicenfyService);
  readonly user = this.auth.user;
  readonly saved = signal(false);
  readonly form = signal(this.formFromUser());
  readonly accountStats = computed(() => ({
    units: this.service.unidades().length,
    assets: this.service.ativos().length,
    documents: this.service.licencas().length
  }));

  private formFromUser() {
    const user = this.user();
    return {
      nome: user?.nome || 'Mariana Silveira',
      email: user?.email || 'mariana.silveira@empresa.com.br',
      cargo: user?.cargo || 'Jurídico e Compliance',
      telefone: user?.telefone || '+55 11 4000-1234',
      empresa: user?.empresa || 'Grupo Alpha Brasil S.A.',
      cnpj: user?.cnpj || '12.345.678/0001-90'
    };
  }

  initials() {
    const names = this.form().nome.trim().split(/\s+/).filter(Boolean);
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : (names[0] || 'LC').slice(0, 2).toUpperCase();
  }

  setField(field: keyof ReturnType<AccountComponent['formFromUser']>, value: string) {
    this.form.update(current => ({ ...current, [field]: value }));
  }

  save() {
    const data = this.form();
    if (!data.nome.trim() || !data.email.trim()) return;
    this.auth.atualizarPerfil(data);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
