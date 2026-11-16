import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { LicenfyService } from './licenfy.service';
import {
  AtivoFisico, DocumentoLicenca, ItemHistoricoDossie, RegistroNotificacao,
  RegraNotificacao, Unidade,
} from '../models/types';

interface WorkspaceState {
  units: Unidade[];
  licenses: DocumentoLicenca[];
  assets: AtivoFisico[];
  rules: RegraNotificacao[];
  notifications: RegistroNotificacao[];
  dossiers: ItemHistoricoDossie[];
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly licenfy = inject(LicenfyService);
  private readonly revision = signal<number | null>(null);
  private saved = '';
  private inFlight: Promise<void> | null = null;

  readonly ready = signal(false);
  readonly status = signal<'loading' | 'load-error' | 'saved' | 'saving' | 'save-error' | 'conflict'>('loading');

  constructor() {
    effect(() => {
      if (!this.ready()) return;
      const state = this.snapshot();
      untracked(() => {
        if (JSON.stringify(state) !== this.saved && this.status() === 'saved') {
          void this.flush();
        }
      });
    });
  }

  async load() {
    if (this.ready() || this.status() === 'saving') return;
    this.status.set('loading');
    try {
      const workspace = await firstValueFrom(
        this.http.get<{ revision: number; state: WorkspaceState | null }>('/api/workspace').pipe(timeout(10000)),
      );
      this.licenfy.unidades.set(workspace.state?.units ?? []);
      this.licenfy.licencas.set(workspace.state?.licenses ?? []);
      this.licenfy.ativos.set(workspace.state?.assets ?? []);
      this.licenfy.regrasNotificacao.set(workspace.state?.rules ?? []);
      this.licenfy.registrosNotificacao.set(workspace.state?.notifications ?? []);
      this.licenfy.historicoDossie.set(workspace.state?.dossiers ?? []);
      this.saved = JSON.stringify(this.snapshot());
      this.revision.set(workspace.revision);
      this.status.set('saved');
      this.ready.set(true);
    } catch {
      this.status.set('load-error');
    }
  }

  hasUnsavedChanges() {
    return this.ready() && JSON.stringify(this.snapshot()) !== this.saved;
  }

  flush(): Promise<void> {
    if (!this.ready() || this.status() === 'conflict') return Promise.resolve();
    if (!this.inFlight) {
      this.inFlight = this.persistChanges().finally(() => { this.inFlight = null; });
    }
    return this.inFlight;
  }

  private snapshot(): WorkspaceState {
    return {
      units: this.licenfy.unidades(),
      licenses: this.licenfy.licencas(),
      assets: this.licenfy.ativos(),
      rules: this.licenfy.regrasNotificacao(),
      notifications: this.licenfy.registrosNotificacao(),
      dossiers: this.licenfy.historicoDossie(),
    };
  }

  private async persistChanges() {
    while (this.hasUnsavedChanges()) {
      const state = this.snapshot();
      const pending = JSON.stringify(state);
      this.status.set('saving');
      try {
        const updated = await firstValueFrom(this.http.put<{ revision: number }>('/api/workspace', {
          revision: this.revision(),
          state,
        }).pipe(timeout(10000)));
        this.revision.set(updated.revision);
        this.saved = pending;
      } catch (error) {
        this.status.set(error instanceof HttpErrorResponse && error.status === 409 ? 'conflict' : 'save-error');
        return;
      }
    }
    this.status.set('saved');
  }
}
