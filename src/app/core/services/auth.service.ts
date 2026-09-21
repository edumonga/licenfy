import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  trial?: boolean;
}

interface StoredAccount extends AuthUser {
  password: string;
}

interface ApiLoginResponse {
  id: number;
  nome: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accountsKey = 'licenfy-trial-accounts';
  private readonly sessionKey = 'licenfy-session';
  private readonly apiBaseUrl = 'http://localhost:3001';

  readonly user = signal<AuthUser | null>(this.loadSession());

  constructor(private readonly http: HttpClient) {}

  async login(login: string, password: string): Promise<{ success: boolean; message?: string }> {
    const normalizedLogin = login.trim().toLowerCase();
    const localAccount = this.getAccounts().find(account =>
      account.email.toLowerCase() === normalizedLogin || account.name.toLowerCase() === normalizedLogin
    );

    if (localAccount) {
      if (localAccount.password !== password) {
        return { success: false, message: 'Senha incorreta. Tente novamente.' };
      }
      this.startSession(localAccount);
      return { success: true };
    }

    // Acesso demonstrativo oficial solicitado (sem banco de dados)
    if (normalizedLogin === 'teste' && password === '123') {
      this.startSession({ id: 'demo-teste', name: 'Conta de Teste', email: 'teste@licenfy.com.br', trial: true });
      return { success: true };
    }

    // Suporte direto às credenciais padrão da API Sprint 7
    if (normalizedLogin === 'admin' && password === '123456') {
      this.startSession({ id: 'demo-admin', name: 'Administrador', email: 'admin@email.com' });
      return { success: true };
    }

    // Tentar chamada na API externa se estiver rodando localmente
    try {
      const response = await firstValueFrom(this.http.post<ApiLoginResponse>(`${this.apiBaseUrl}/login`, {
        nome: login,
        senha: password
      }).pipe(timeout(1500)));
      this.startSession({ id: String(response.id), name: response.nome, email: response.email });
      return { success: true };
    } catch {
      return {
        success: false,
        message: 'Usuário ou senha inválidos. Para teste rápido use login: teste e senha: 123, ou crie uma conta.'
      };
    }
  }

  register(name: string, email: string, password: string): { success: boolean; message?: string } {
    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (this.getAccounts().some(account => account.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'Já existe uma conta com este e-mail. Se já tiver conta, clique em Entrar.' };
    }
    const account: StoredAccount = { id: 'trial-' + Date.now(), name: cleanName, email: normalizedEmail, password, trial: true };
    this.saveAccounts([...this.getAccounts(), account]);
    this.startSession(account);
    return { success: true };
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    this.user.set(null);
  }

  private startSession(user: AuthUser) {
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.user.set(user);
  }

  private getAccounts(): StoredAccount[] {
    try { return JSON.parse(localStorage.getItem(this.accountsKey) || '[]'); } catch { return []; }
  }

  private saveAccounts(accounts: StoredAccount[]) {
    localStorage.setItem(this.accountsKey, JSON.stringify(accounts));
  }

  private loadSession(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem(this.sessionKey) || 'null'); } catch { return null; }
  }
}
