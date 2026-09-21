import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { NotificationRule, NotificationLog } from '../../core/models/types';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
  readonly service = inject(LicenfyService);

  readonly rules = this.service.notificationRules;
  readonly logs = this.service.notificationLogs;

  testEmail = signal<string>('diretoria.compliance@empresa.com.br');
  isSendingTest = signal<boolean>(false);
  testSentSuccess = signal<boolean>(false);
  newRuleDays = signal<number>(45);
  newRuleRecipients = signal<string>('compliance@empresa.com.br, gerencia.risco@empresa.com.br');

  toggleRule(ruleId: string) {
    this.service.toggleNotificationRule(ruleId);
  }

  sendManualTest() {
    this.isSendingTest.set(true);
    setTimeout(() => {
      this.isSendingTest.set(false);
      this.testSentSuccess.set(true);

      const newLog: NotificationLog = {
        id: 'test-' + Date.now(),
        timestamp: 'Agora mesmo',
        channel: 'email',
        recipient: this.testEmail(),
        licenseOrAssetName: 'Alvará de Funcionamento e Localização',
        branchName: 'Matriz São Paulo',
        daysBefore: 30,
        status: 'Entregue',
        messagePreview: 'Alerta Corporativo Licenfy: Alvará SP vence em 30 dias. Ação preventiva requerida.'
      };
      this.service.notificationLogs.update(prev => [newLog, ...prev]);

      setTimeout(() => {
        this.testSentSuccess.set(false);
      }, 4000);
    }, 1200);
  }

  addCustomRule() {
    const recipients = this.newRuleRecipients().split(',').map(item => item.trim()).filter(Boolean);
    if (this.newRuleDays() < 1 || !recipients.length) return;
    this.service.addNotificationRule(this.newRuleDays(), recipients);
  }
}
