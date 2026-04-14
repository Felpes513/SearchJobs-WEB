export type NotificationType = 'AVISO' | 'CRITICO' | string;

export interface AppNotification {
  id: number;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  createdAt: string;
}
