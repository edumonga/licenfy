import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  name?: string;
  email: string;
  teste?: boolean;
  trial?: boolean;
}
export type AuthUser = UsuarioAutenticado;

interface ContaArmazenada extends UsuarioAutenticado {
  senha: string;
  password?: string;
}

interface RespostaLoginApi {
  id: number;
  nome: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private readonly chaveContas = 'licenfy-contas-teste';
  private readonly chaveSessao = 'licenfy-sessao';
  private readonly urlBaseApi = 'http://localhost:3001';

  readonly usuario = signal<UsuarioAutenticado | null>(this.carregarSessao());
  readonly user = this.usuario;

  constructor(private readonly http: HttpClient) {}

  async entrar(login: string, senha: string): Promise<{ sucesso: boolean; mensagem?: string; success?: boolean; message?: string }> {
    const loginNormalizado = login.trim().toLowerCase();
    const contaLocal = this.obterContas().find(conta =>
      conta.email.toLowerCase() === loginNormalizado || conta.nome.toLowerCase() === loginNormalizado
    );

    if (contaLocal) {
      if (contaLocal.senha !== senha && contaLocal.password !== senha) {
        return { sucesso: false, mensagem: 'Senha incorreta. Tente novamente.', success: false, message: 'Senha incorreta. Tente novamente.' };
      }
      this.iniciarSessao(contaLocal);
      return { sucesso: true, success: true };
    }

    if (loginNormalizado === 'teste' && senha === '123') {
      this.iniciarSessao({ id: 'demo-teste', nome: 'Conta de Teste', name: 'Conta de Teste', email: 'teste@licenfy.com.br', teste: true, trial: true });
      return { sucesso: true, success: true };
    }

    if (loginNormalizado === 'admin' && senha === '123456') {
      this.iniciarSessao({ id: 'demo-admin', nome: 'Administrador', name: 'Administrador', email: 'admin@email.com' });
      return { sucesso: true, success: true };
    }

    try {
      const resposta = await firstValueFrom(this.http.post<RespostaLoginApi>(`${this.urlBaseApi}/login`, {
        nome: login,
        senha
      }).pipe(timeout(1500)));
      this.iniciarSessao({ id: String(resposta.id), nome: resposta.nome, name: resposta.nome, email: resposta.email });
      return { sucesso: true, success: true };
    } catch {
      return {
        sucesso: false,
        success: false,
        mensagem: 'Usuário ou senha inválidos. Para teste rápido utilize login: teste e senha: 123, ou confira suas credenciais.',
        message: 'Usuário ou senha inválidos. Para teste rápido utilize login: teste e senha: 123, ou confira suas credenciais.'
      };
    }
  }

  login(login: string, pass: string) {
    return this.entrar(login, pass);
  }

  cadastrar(nome: string, email: string, senha: string): { sucesso: boolean; mensagem?: string; success?: boolean; message?: string } {
    const nomeLimpo = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();
    if (this.obterContas().some(conta => conta.email.toLowerCase() === emailNormalizado)) {
      return { sucesso: false, success: false, mensagem: 'Já existe uma conta com este e-mail.', message: 'Já existe uma conta com este e-mail.' };
    }
    const novaConta: ContaArmazenada = {
      id: 'teste-' + Date.now(),
      nome: nomeLimpo,
      name: nomeLimpo,
      email: emailNormalizado,
      senha,
      password: senha,
      teste: true,
      trial: true
    };
    this.salvarContas([...this.obterContas(), novaConta]);
    this.iniciarSessao(novaConta);
    return { sucesso: true, success: true };
  }

  register(name: string, email: string, pass: string) {
    return this.cadastrar(name, email, pass);
  }

  sair() {
    localStorage.removeItem(this.chaveSessao);
    localStorage.removeItem('licenfy-session');
    this.usuario.set(null);
  }

  logout() {
    this.sair();
  }

  private iniciarSessao(usuario: UsuarioAutenticado) {
    localStorage.setItem(this.chaveSessao, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  private obterContas(): ContaArmazenada[] {
    try {
      const salvas = localStorage.getItem(this.chaveContas) || localStorage.getItem('licenfy-trial-accounts') || '[]';
      return JSON.parse(salvas);
    } catch {
      return [];
    }
  }

  private salvarContas(contas: ContaArmazenada[]) {
    localStorage.setItem(this.chaveContas, JSON.stringify(contas));
  }

  private carregarSessao(): UsuarioAutenticado | null {
    try {
      const sessao = localStorage.getItem(this.chaveSessao) || localStorage.getItem('licenfy-session') || 'null';
      return JSON.parse(sessao);
    } catch {
      return null;
    }
  }
}

export const AuthService = ServicoAutenticacao;
