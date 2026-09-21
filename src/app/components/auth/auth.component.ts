import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  readonly app = inject(LicenfyService);
  readonly auth = inject(AuthService);
  readonly mode = this.app.authMode;
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly successMessage = signal('');

  readonly loginData = { login: '', password: '' };
  readonly signupData = { name: '', email: '', password: '', confirmPassword: '' };

  changeMode(mode: 'login' | 'signup') {
    this.error.set('');
    this.successMessage.set('');
    this.app.setAuthMode(mode);
  }

  backToSite() {
    this.app.setView('landing');
  }

  fillDemo(login = 'teste', pass = '123') {
    this.loginData.login = login;
    this.loginData.password = pass;
    this.error.set('');
  }

  async submitLogin() {
    this.error.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const result = await this.auth.login(this.loginData.login, this.loginData.password);
    this.isLoading.set(false);

    if (!result.success) {
      this.error.set(result.message || 'Falha ao entrar. Confira seus dados.');
      return;
    }

    this.app.setTab('dashboard');
    this.app.setView('app');
  }

  submitSignup() {
    this.error.set('');
    this.successMessage.set('');

    if (!this.signupData.name.trim() || !this.signupData.email.trim() || this.signupData.password.length < 3) {
      this.error.set('Preencha todos os campos. A senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.error.set('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    const result = this.auth.register(this.signupData.name, this.signupData.email, this.signupData.password);
    if (!result.success) {
      this.error.set(result.message || 'Não foi possível criar a conta.');
      return;
    }

    this.app.setTab('dashboard');
    this.app.setView('app');
  }
}
