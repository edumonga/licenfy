import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { ServicoAutenticacao } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AutenticacaoComponente {
  readonly servico = inject(ServicoLicenfy);
  readonly autenticacao = inject(ServicoAutenticacao);

  readonly modo = this.servico.modoAutenticacao;
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly mensagemSucesso = signal('');

  readonly dadosLogin = { login: '', senha: '', password: '' };
  readonly dadosCadastro = { nome: '', email: '', senha: '', confirmarSenha: '', name: '', password: '', confirmPassword: '' };

  // Compatibilidade
  get app() { return this.servico; }
  get auth() { return this.autenticacao; }
  get mode() { return this.modo; }
  get isLoading() { return this.carregando; }
  get error() { return this.erro; }
  get successMessage() { return this.mensagemSucesso; }
  get loginData() { return this.dadosLogin; }
  get signupData() { return this.dadosCadastro; }

  alterarModo(novoModo: 'login' | 'signup') {
    this.erro.set('');
    this.mensagemSucesso.set('');
    this.servico.definirModoAutenticacao(novoModo);
  }
  changeMode(modo: 'login' | 'signup') { this.alterarModo(modo); }

  voltarAoSite() {
    this.servico.definirVisao('landing');
  }
  backToSite() { this.voltarAoSite(); }

  preencherTeste(login = 'teste', pass = '123') {
    this.dadosLogin.login = login;
    this.dadosLogin.senha = pass;
    this.dadosLogin.password = pass;
    this.erro.set('');
  }
  fillDemo(login = 'teste', pass = '123') { this.preencherTeste(login, pass); }

  async enviarLogin() {
    this.erro.set('');
    this.mensagemSucesso.set('');
    this.carregando.set(true);

    const senha = this.dadosLogin.senha || this.dadosLogin.password;
    const resultado = await this.autenticacao.entrar(this.dadosLogin.login, senha);
    this.carregando.set(false);

    if (!resultado.sucesso) {
      this.erro.set(resultado.mensagem || 'Falha ao entrar. Confira seus dados.');
      return;
    }

    this.servico.definirAba('dashboard');
    this.servico.definirVisao('app');
  }
  submitLogin() { return this.enviarLogin(); }

  enviarCadastro() {
    this.erro.set('');
    this.mensagemSucesso.set('');

    const nome = (this.dadosCadastro.nome || this.dadosCadastro.name || '').trim();
    const email = (this.dadosCadastro.email || '').trim();
    const senha = this.dadosCadastro.senha || this.dadosCadastro.password;
    const confirmarSenha = this.dadosCadastro.confirmarSenha || this.dadosCadastro.confirmPassword;

    if (!nome || !email || (senha && senha.length < 3)) {
      this.erro.set('Preencha todos os campos. A senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      this.erro.set('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    const resultado = this.autenticacao.cadastrar(nome, email, senha);
    if (!resultado.sucesso) {
      this.erro.set(resultado.mensagem || 'Não foi possível criar a conta.');
      return;
    }

    this.servico.definirAba('dashboard');
    this.servico.definirVisao('app');
  }
  submitSignup() { return this.enviarCadastro(); }
}

export const AuthComponent = AutenticacaoComponente;
