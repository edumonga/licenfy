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

  testPhone = signal<string>('+55 11 98877-6655');
  isSendingTest = signal<boolean>(false);
  testSentSuccess = signal<boolean>(false);

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
        channel: 'whatsapp',
        recipient: this.testPhone(),
        licenseOrAssetName: 'Alvará de Funcionamento e Localização',
        branchName: 'Matriz São Paulo',
        daysBefore: 30,
        status: 'Lido',
        messagePreview: 'Alerta Licenfy (Simulação): Alvará SP vence em 30 dias. Nenhuma ação pendente no momento.'
      };
      this.service.notificationLogs.update(prev => [newLog, ...prev]);

      setTimeout(() => {
        this.testSentSuccess.set(false);
      }, 4000);
    }, 1200);
  }
}
