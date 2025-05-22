import React, { useState } from 'react';
import { CryptoPrice } from '../../services/cryptoService';
import { AlertCondition, CreatePriceAlertRequest } from '../../models/PriceAlert';

interface CreateAlertFormProps {
  asset: CryptoPrice;
  currentPrice: number;
  onSubmit: (data: CreatePriceAlertRequest) => Promise<void>;
  onCancel: () => void;
}

const CreateAlertForm: React.FC<CreateAlertFormProps> = ({
  asset,
  currentPrice,
  onSubmit,
  onCancel
}) => {
  const [price, setPrice] = useState<number>(currentPrice);
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const alertData: CreatePriceAlertRequest = {
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        condition,
        targetPrice: price,
        currency: 'eur' // Atualmente fixo em EUR
      };
      
      await onSubmit(alertData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar o preço com 2 casas decimais
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Criar Alerta para {asset.name}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preço Atual
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700">
            €{formatPrice(currentPrice)}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Condição
          </label>
          <select
            id="condition"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            value={condition}
            onChange={(e) => setCondition(e.target.value as AlertCondition)}
          >
            <option value="above">Preço acima de</option>
            <option value="below">Preço abaixo de</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preço Alvo (€)
          </label>
          <input
            type="number"
            id="price"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'A criar...' : 'Criar Alerta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAlertForm; 