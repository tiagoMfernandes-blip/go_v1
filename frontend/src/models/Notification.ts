/**
 * Tipos de notificação suportados
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'default';

/**
 * Interface para notificações exibidas na aplicação
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  createdAt: Date;
  read?: boolean;
}

/**
 * Requisição para criação de notificação
 */
export interface NotificationRequest {
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  playSound?: boolean;
  requireInteraction?: boolean;
} 