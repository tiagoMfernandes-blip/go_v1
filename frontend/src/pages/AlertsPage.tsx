import React, { useState, useEffect } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useAppContext } from '../context/AppContext';
import useCryptoData from '../hooks/useCryptoData';
import AlertsList from '../components/Alerts/AlertsList';
import AlertsHistory from '../components/Alerts/AlertsHistory';
import CreateAlertForm from '../components/Alerts/CreateAlertForm';
import { CreatePriceAlertRequest, PriceAlert } from '../models/PriceAlert';
import NotificationService from '../services/notificationService';
import AlertsStatistics from '../components/Alerts/AlertsStatistics';
import { CryptoPrice } from '../services/cryptoService';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const AlertsPage: React.FC = () => {
  const { showNotification } = useAppContext();
  const { alerts, loading, error, createAlert, updateAlert, deleteAlert, checkAlerts } = useAlerts();
  const { assets: cryptoData, isLoading: isLoadingCrypto } = useCryptoData();
  
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptoPrice | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission | null>(null);

  // Verificar permissão de notificações ao carregar
  useEffect(() => {
    const checkPermission = async () => {
      // Utilizando o método requestPermission para verificar permissão atual
      const permission = await NotificationService.requestPermission();
      setNotificationsPermission(permission);
    };
    
    checkPermission();
  }, []);

  const handleCreateAlert = async (data: CreatePriceAlertRequest) => {
    try {
      await createAlert(data);
      closeCreateForm();
      
      // Notificar sucesso
      showNotification({
        type: 'success',
        message: `Alerta para ${data.name} (${data.symbol.toUpperCase()}) criado com sucesso`
      });
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
      
      // Notificar erro
      showNotification({
        type: 'error',
        message: 'Erro ao criar alerta. Tente novamente.'
      });
    }
  };

  const handleToggleActive = async (alert: PriceAlert) => {
    try {
      await updateAlert({
        id: alert.id,
        active: !alert.active
      });
      
      showNotification({
        type: 'info',
        message: `Alerta ${!alert.active ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (err) {
      console.error('Erro ao atualizar alerta:', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteAlert(id);
      
      // Enviar notificação
      showNotification({
        message: 'Alerta removido com sucesso',
        type: 'info'
      });
    } catch (err) {
      console.error('Erro ao remover alerta:', err);
    }
  };

  const openCreateForm = (asset: CryptoPrice) => {
    setSelectedAsset(asset);
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setSelectedAsset(null);
  };

  const requestNotificationPermission = async () => {
    const permission = await NotificationService.requestPermission();
    setNotificationsPermission(permission);
    
    if (permission === 'granted') {
      showNotification({
        type: 'success',
        message: 'Notificações ativadas com sucesso!'
      });
    } else if (permission === 'denied') {
      showNotification({
        type: 'error',
        message: 'Permissão para notificações negada.'
      });
    }
  };

  // Defina as categorias para as tabs
  const categories = {
    'Meus Alertas': true,
    'Estatísticas': true,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Erro ao carregar os alertas: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            {Object.keys(categories).map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-blue-500 shadow text-white'
                      : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-900'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel
              className={classNames(
                'rounded-xl bg-white dark:bg-gray-800 p-3',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Meus Alertas de Preço</h1>
                  
                  {/* Botão para solicitar permissão de notificações se não estiver concedida */}
                  {notificationsPermission !== 'granted' && (
                    <button
                      onClick={requestNotificationPermission}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
                    >
                      Ativar Notificações
                    </button>
                  )}
                </div>
                
                {/* Abas para os diferentes tipos de alertas */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'current'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('current')}
                    >
                      Alertas Ativos
                    </button>
                    <button
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'history'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('history')}
                    >
                      Histórico de Alertas
                    </button>
                  </nav>
                </div>

                {/* Formulário de criação de alerta */}
                {showCreateForm && selectedAsset && (
                  <div className="mb-6">
                    <CreateAlertForm 
                      asset={selectedAsset}
                      currentPrice={selectedAsset.current_price}
                      onSubmit={handleCreateAlert} 
                      onCancel={closeCreateForm}
                    />
                  </div>
                )}
                
                {/* Conteúdo baseado na aba selecionada */}
                {activeTab === 'current' ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Meus Alertas</h2>
                    <AlertsList
                      alerts={alerts.filter(alert => alert.active)}
                      onDelete={handleDeleteAlert}
                      onToggleActive={(alertId, active) => {
                        const alert = alerts.find(a => a.id === alertId);
                        if (alert) handleToggleActive(alert);
                      }}
                    />
                    
                    {/* Lista de criptomoedas para criar alertas */}
                    <div className="mt-8">
                      <h2 className="text-lg font-semibold mb-3">Criar Novos Alertas</h2>
                      
                      {isLoadingCrypto ? (
                        <div className="text-center py-4">
                          <div className="animate-spin inline-block w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cryptoData && cryptoData.slice(0, 6).map((asset: CryptoPrice) => (
                            <div 
                              key={asset.id}
                              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={asset.image || '/assets/placeholder-news.jpg'}
                                  alt={asset.symbol}
                                  className="w-10 h-10 rounded-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/assets/placeholder-news.jpg';
                                  }}
                                />
                                <div>
                                  <h3 className="font-medium">{asset.name}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {asset.symbol.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-2 flex justify-between items-center">
                                <div>
                                  <p className="text-lg font-semibold">
                                    €{asset.current_price.toFixed(2)}
                                  </p>
                                  <p className={`text-sm ${
                                    (asset.price_change_percentage_24h || 0) >= 0
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {(asset.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                                    {(asset.price_change_percentage_24h || 0).toFixed(2)}%
                                  </p>
                                </div>
                                
                                <button
                                  onClick={() => openCreateForm(asset)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  Criar Alerta
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <AlertsHistory alerts={alerts.filter(alert => !alert.active)} />
                  </div>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                'rounded-xl bg-white dark:bg-gray-800 p-3',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Estatísticas de Alertas</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Análise detalhada dos seus alertas de preço e insights para melhorar suas estratégias.
                  </p>
                </div>
                
                <AlertsStatistics alerts={alerts} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AlertsPage; 