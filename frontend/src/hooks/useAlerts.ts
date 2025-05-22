import { useState, useEffect, useCallback } from 'react';
import { PriceAlert, CreatePriceAlertRequest, UpdatePriceAlertRequest } from '../models/PriceAlert';
import AlertService from '../services/alertService';
import { useAppContext } from '../context/AppContext';
import NotificationService from '../services/notificationService';

interface UseAlertsResult {
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;
  createAlert: (data: CreatePriceAlertRequest) => Promise<PriceAlert | null>;
  updateAlert: (data: UpdatePriceAlertRequest) => Promise<PriceAlert | null>;
  deleteAlert: (id: string) => Promise<boolean>;
  checkAlerts: () => Promise<PriceAlert[]>;
}

export const useAlerts = (): UseAlertsResult => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useAppContext();

  // Carregar alertas iniciais
  useEffect(() => {
    try {
      const savedAlerts = AlertService.getAlerts();
      setAlerts(savedAlerts);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
      setError('Falha ao carregar os alertas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar alertas periodicamente
  useEffect(() => {
    const checkForTriggeredAlerts = async () => {
      try {
        const triggeredAlerts = await AlertService.checkAlerts();
        
        if (triggeredAlerts.length > 0) {
          // Atualizar a lista de alertas
          setAlerts(AlertService.getAlerts());
          
          // Notificar o utilizador sobre os alertas acionados
          triggeredAlerts.forEach(alert => {
            const condition = alert.condition === 'above' ? 'acima' : 'abaixo';
            const message = `Alerta: ${alert.name} (${alert.symbol}) está ${condition} de ${alert.targetPrice} ${alert.currency.toUpperCase()}`;
            
            // Mostrar notificação na aplicação
            showNotification({
              type: 'info',
              message
            });
            
            // Enviar notificação do navegador com som
            NotificationService.notify({
              title: 'Alerta de Preço Acionado',
              message,
              type: 'warning',
              playSound: true,
              requireInteraction: true
            });
          });
        }
      } catch (err) {
        console.error('Erro ao verificar alertas:', err);
      }
    };

    // Verificar a cada 5 minutos
    const checkInterval = setInterval(checkForTriggeredAlerts, 5 * 60 * 1000);
    
    // Verificar imediatamente ao carregar
    checkForTriggeredAlerts();
    
    return () => clearInterval(checkInterval);
  }, [showNotification]);

  // Criar um novo alerta
  const createAlert = useCallback(async (data: CreatePriceAlertRequest): Promise<PriceAlert | null> => {
    setLoading(true);
    try {
      const newAlert = AlertService.createAlert(data);
      
      // Atualizar a lista de alertas
      setAlerts(current => [...current, newAlert]);
      
      showNotification({
        type: 'success',
        message: `Alerta criado com sucesso para ${newAlert.name}`
      });
      
      return newAlert;
    } catch (err: any) {
      console.error('Erro ao criar alerta:', err);
      setError(err.message || 'Falha ao criar o alerta. Por favor, tente novamente.');
      showNotification({
        type: 'error',
        message: err.message || 'Falha ao criar o alerta'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Atualizar um alerta existente
  const updateAlert = useCallback(async (data: UpdatePriceAlertRequest): Promise<PriceAlert | null> => {
    setLoading(true);
    try {
      const updatedAlert = AlertService.updateAlert(data);
      
      if (updatedAlert) {
        // Atualizar a lista de alertas
        setAlerts(current => 
          current.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert)
        );
        
        showNotification({
          type: 'success',
          message: `Alerta atualizado com sucesso para ${updatedAlert.name}`
        });
      }
      
      return updatedAlert;
    } catch (err: any) {
      console.error('Erro ao atualizar alerta:', err);
      setError(err.message || 'Falha ao atualizar o alerta. Por favor, tente novamente.');
      showNotification({
        type: 'error',
        message: err.message || 'Falha ao atualizar o alerta'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Remover um alerta
  const deleteAlert = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = AlertService.deleteAlert(id);
      
      if (success) {
        // Atualizar a lista de alertas
        setAlerts(current => current.filter(alert => alert.id !== id));
        
        showNotification({
          type: 'info',
          message: 'Alerta removido com sucesso'
        });
      }
      
      return success;
    } catch (err: any) {
      console.error('Erro ao remover alerta:', err);
      setError(err.message || 'Falha ao remover o alerta. Por favor, tente novamente.');
      showNotification({
        type: 'error',
        message: err.message || 'Falha ao remover o alerta'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Verificar alertas manualmente
  const checkAlerts = useCallback(async (): Promise<PriceAlert[]> => {
    try {
      const triggeredAlerts = await AlertService.checkAlerts();
      
      if (triggeredAlerts.length > 0) {
        // Atualizar a lista de alertas
        setAlerts(AlertService.getAlerts());
        
        // Notificar sobre os alertas acionados
        triggeredAlerts.forEach(alert => {
          const condition = alert.condition === 'above' ? 'acima' : 'abaixo';
          showNotification({
            type: 'info',
            message: `Alerta: ${alert.name} (${alert.symbol}) está ${condition} de ${alert.targetPrice} ${alert.currency.toUpperCase()}`
          });
        });
      }
      
      return triggeredAlerts;
    } catch (err) {
      console.error('Erro ao verificar alertas:', err);
      return [];
    }
  }, [showNotification]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    checkAlerts
  };
}; 