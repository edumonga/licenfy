import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  name?: string;
  email: string;
  cargo?: string;
  telefone?: string;
  empresa?: string;
  cnpj?: string;
  teste?: boolean;
  trial?: boolean;
}

export type AuthUser = UsuarioAutenticado;

@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private readonly usuario = signal<UsuarioAutenticado | null>(null);
  readonly user = this.usuario.asReadonly();

  constructor(private readonly http: HttpClient) {
    try {
      for (const key of ['licenfy-contas-teste', 'licenfy-trial-accounts', 'licenfy-sessao', 'licenfy-session']) {
        localStorage.removeItem(key);
      }
    } catch {
      // O navegador pode bloquear o acesso ao armazenamento.
    }
  }

  async restaurarSessao() {
    try {
      const user = await firstValueFrom(
        this.http.get<UsuarioAutenticado>('/api/auth?action=session').pipe(timeout(6000)),
      );
      if (!user?.id || !user.email) return false;
      this.usuario.set({ ...user, name: user.nome });
      return true;
    } catch {
      return false;
    }
  }

  async logout() {
    if (this.user()) {
      await firstValueFrom(this.http.post('/api/auth?action=logout', null).pipe(timeout(6000)));
    }
    this.usuario.set(null);
  }

  atualizarPerfil(dados: Partial<UsuarioAutenticado>) {
    this.usuario.update(user => user && {
      ...user,
      nome: dados.nome?.trim() || user.nome,
      name: dados.nome?.trim() || user.nome,
      cargo: dados.cargo,
      telefone: dados.telefone,
      empresa: dados.empresa,
      cnpj: dados.cnpj,
    });
  }
}

export const AuthService = ServicoAutenticacao;
