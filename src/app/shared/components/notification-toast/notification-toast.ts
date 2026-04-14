import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Subscription, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppNotification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.css',
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);

  private readonly autoHideDurationMs = 10000;
  private readonly exitDurationMs = 450;

  private activeTimerSubscription?: Subscription;
  private exitTimerSubscription?: Subscription;
  private loadSubscription?: Subscription;
  private markAsReadSubscription?: Subscription;

  fila: AppNotification[] = [];
  notificacaoAtiva: AppNotification | null = null;
  saindo = false;

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  ngOnDestroy(): void {
    this.activeTimerSubscription?.unsubscribe();
    this.exitTimerSubscription?.unsubscribe();
    this.loadSubscription?.unsubscribe();
    this.markAsReadSubscription?.unsubscribe();
  }

  fecharNotificacao(): void {
    if (!this.notificacaoAtiva || this.saindo) {
      return;
    }

    this.iniciarSaida();
  }

  getIcon(tipo: string): string {
    return tipo === 'CRITICO' ? 'warning' : 'notifications';
  }

  getTitle(tipo: string): string {
    return tipo === 'CRITICO' ? 'Alerta importante' : 'Aviso do sistema';
  }

  formatarData(dataIso: string): string {
    const data = new Date(dataIso);

    if (Number.isNaN(data.getTime())) {
      return 'Agora';
    }

    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private carregarNotificacoes(): void {
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.notificationService.listarNotificacoes().pipe(
      catchError(() => EMPTY)
    ).subscribe((notifications) => {
      const naoLidas = notifications.filter((notification) => !notification.lida);

      if (!naoLidas.length) {
        return;
      }

      this.fila = this.fila.length
        ? [...this.fila, ...naoLidas.filter((item) => !this.existeNaFila(item.id))]
        : naoLidas;

      if (!this.notificacaoAtiva) {
        this.exibirProxima();
      }
    });
  }

  private existeNaFila(notificationId: number): boolean {
    return (
      this.notificacaoAtiva?.id === notificationId ||
      this.fila.some((notification) => notification.id === notificationId)
    );
  }

  private exibirProxima(): void {
    this.activeTimerSubscription?.unsubscribe();
    this.exitTimerSubscription?.unsubscribe();

    this.notificacaoAtiva = this.fila.shift() ?? null;
    this.saindo = false;

    if (!this.notificacaoAtiva) {
      return;
    }

    this.activeTimerSubscription = timer(this.autoHideDurationMs).subscribe(() => {
      this.iniciarSaida();
    });
  }

  private iniciarSaida(): void {
    if (!this.notificacaoAtiva) {
      return;
    }

    this.saindo = true;
    this.activeTimerSubscription?.unsubscribe();
    this.exitTimerSubscription?.unsubscribe();

    this.exitTimerSubscription = timer(this.exitDurationMs).subscribe(() => {
      const notificationId = this.notificacaoAtiva?.id;

      if (notificationId !== undefined) {
        this.markAsReadSubscription?.unsubscribe();
        this.markAsReadSubscription = this.notificationService.marcarComoLida(notificationId).pipe(
          catchError(() => EMPTY)
        ).subscribe();
      }

      this.notificacaoAtiva = null;
      this.saindo = false;
      this.exibirProxima();
    });
  }
}
