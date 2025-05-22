import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Footer: React.FC = () => {
  const { theme } = useAppContext();
  const year = new Date().getFullYear();
  
  return (
    <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {year} GoFolio. Todos os direitos reservados.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className={`text-sm ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
              onClick={(e) => e.preventDefault()}
            >
              Termos de Uso
            </a>
            <a 
              href="#" 
              className={`text-sm ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
              onClick={(e) => e.preventDefault()}
            >
              Política de Privacidade
            </a>
            <a 
              href="#" 
              className={`text-sm ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
              onClick={(e) => e.preventDefault()}
            >
              Suporte
            </a>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-xs">
              Dados fornecidos por CoinGecko API. Não é aconselhamento financeiro.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 