// Tipo para a condição do alerta
export type AlertCondition = 'above' | 'below';

// Interface para o modelo de alerta de preço
export interface PriceAlert {
  id: string;
  userId: string;
  assetId: string;
  name: string;
  symbol: string;
  assetSymbol?: string; // Compatibilidade com novos componentes
  condition: AlertCondition;
  targetPrice: number;
  currency: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
  triggered?: Date | null;
  notified: boolean;
}

// Interface para criar um novo alerta
export interface CreatePriceAlertRequest {
  assetId: string;
  name: string;
  symbol: string;
  assetSymbol?: string; // Compatibilidade com novos componentes
  condition: AlertCondition;
  targetPrice: number;
  currency: string;
  notes?: string;
}

// Interface para atualizar um alerta existente
export interface UpdatePriceAlertRequest {
  id: string;
  assetId?: string;
  name?: string;
  symbol?: string;
  assetSymbol?: string; // Compatibilidade com novos componentes
  condition?: AlertCondition;
  targetPrice?: number;
  currency?: string;
  notes?: string;
  active?: boolean;
  triggered?: Date | null;
  notified?: boolean;
} 