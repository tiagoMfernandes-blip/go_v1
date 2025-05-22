import { NotificationType } from '../models/Notification';

interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  playSound?: boolean;
  requireInteraction?: boolean;
}

/**
 * Serviço para gerenciar notificações na aplicação
 */
const NotificationService = {
  /**
   * Solicita permissão para enviar notificações do navegador
   * @returns Promessa que resolve com o estado da permissão
   */
  requestPermission: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações de desktop');
      return 'denied';
    }
    
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }
    
    return Notification.permission;
  },
  
  /**
   * Verifica se as notificações estão permitidas
   * @returns Boolean indicando se as notificações estão permitidas
   */
  isPermissionGranted: (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
  },
  
  /**
   * Envia uma notificação do navegador
   * @param options Opções da notificação
   */
  sendBrowserNotification: (options: NotificationOptions): void => {
    if (!NotificationService.isPermissionGranted()) {
      console.warn('Permissão para notificações não concedida');
      return;
    }
    
    try {
      const { title = 'GoFolio', message, type, requireInteraction = false } = options;
      
      // Determinar o ícone baseado no tipo
      let icon = '/logo192.png';
      if (type === 'success') icon = '/assets/icons/success.png';
      if (type === 'error') icon = '/assets/icons/error.png';
      if (type === 'warning') icon = '/assets/icons/warning.png';
      if (type === 'info') icon = '/assets/icons/info.png';
      
      // Criar a notificação
      const notification = new Notification(title, {
        body: message,
        icon,
        requireInteraction
      });
      
      // Reproduzir som se solicitado
      if (options.playSound) {
        NotificationService.playNotificationSound(type);
      }
      
      // Evento de clique
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  },
  
  /**
   * Reproduz um som de notificação
   * @param type Tipo da notificação
   */
  playNotificationSound: (type: NotificationType): void => {
    try {
      let soundFile = '/assets/sounds/notification.mp3';
      
      if (type === 'success') soundFile = '/assets/sounds/success.mp3';
      if (type === 'error') soundFile = '/assets/sounds/error.mp3';
      if (type === 'warning') soundFile = '/assets/sounds/warning.mp3';
      
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Não foi possível reproduzir o som:', error);
      });
    } catch (error) {
      console.error('Erro ao reproduzir som:', error);
    }
  },
  
  /**
   * Envia uma notificação completa (in-app e browser se permitido)
   * @param options Opções da notificação
   * @returns Identificador da notificação
   */
  notify: (options: NotificationOptions): string => {
    const notificationId = Date.now().toString();
    
    // Enviar notificação do navegador se permitido
    if (NotificationService.isPermissionGranted() && options.type !== 'default') {
      NotificationService.sendBrowserNotification(options);
    } 
    // Se não tiver permissão mas for um alerta importante, tocar som
    else if (options.type === 'error' || options.type === 'warning') {
      NotificationService.playNotificationSound(options.type);
    }
    
    return notificationId;
  }
};

export default NotificationService; 