import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { RegistroNotificacao, NotificationLog } from '../../core/models/types';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificacoesComponente {
  readonly servico = inject(ServicoLicenfy);

  readonly regras = this.servico.regrasNotificacao;
  readonly registros = this.servico.registrosNotificacao;

  emailTeste = signal<string>('diretoria.compliance@empresa.com.br');
  enviandoTeste = signal<boolean>(false);
  testeEnviadoComSucesso = signal<boolean>(false);
  diasNovaRegra = signal<number>(45);
  destinatariosNovaRegra = signal<string>('compliance@empresa.com.br, gerencia.risco@empresa.com.br');

  // Compatibilidade
  get service() { return this.servico; }
  get rules() { return this.regras; }
  get logs() { return this.registros; }
  get testEmail() { return this.emailTeste; }
  get isSendingTest() { return this.enviandoTeste; }
  get testSentSuccess() { return this.testeEnviadoComSucesso; }
  get newRuleDays() { return this.diasNovaRegra; }
  get newRuleRecipients() { return this.destinatariosNovaRegra; }

  alternarRegra(regraId: string) {
    this.servico.alternarRegraNotificacao(regraId);
  }
  toggleRule(id: string) { this.alternarRegra(id); }

  enviarTesteManual() {
    this.enviandoTeste.set(true);
    setTimeout(() => {
      this.enviandoTeste.set(false);
      this.testeEnviadoComSucesso.set(true);

      const novoRegistro: RegistroNotificacao = {
        id: 'test-' + Date.now(),
        horario: 'Agora mesmo',
        timestamp: 'Agora mesmo',
        canal: 'email',
        channel: 'email',
        destinatario: this.emailTeste(),
        recipient: this.emailTeste(),
        nomeLicencaOuAtivo: 'Alvará de Funcionamento e Localização',
        licenseOrAssetName: 'Alvará de Funcionamento e Localização',
        nomeUnidade: 'Matriz São Paulo',
        branchName: 'Matriz São Paulo',
        diasAntes: 30,
        daysBefore: 30,
        status: 'Entregue',
        previaMensagem: 'Alerta Corporativo Licenfy: Alvará SP vence em 30 dias. Ação preventiva requerida.',
        messagePreview: 'Alerta Corporativo Licenfy: Alvará SP vence em 30 dias. Ação preventiva requerida.'
      };
      this.servico.registrosNotificacao.update(ant => [novoRegistro, ...ant]);

      setTimeout(() => {
        this.testeEnviadoComSucesso.set(false);
      }, 4000);
    }, 1200);
  }
  sendManualTest() { this.enviarTesteManual(); }

  adicionarRegraPersonalizada() {
    const destinatarios = this.destinatariosNovaRegra().split(',').map(item => item.trim()).filter(Boolean);
    if (this.diasNovaRegra() < 1 || !destinatarios.length) return;
    this.servico.adicionarRegraNotificacao(this.diasNovaRegra(), destinatarios);
  }
  addCustomRule() { this.adicionarRegraPersonalizada(); }
}

export const NotificationsComponent = NotificacoesComponente;
