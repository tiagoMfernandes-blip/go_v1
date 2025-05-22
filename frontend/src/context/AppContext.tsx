import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Definição dos tipos
interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'pt' | 'en';
  };
}

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
}

interface PortfolioData {
  assets: Asset[];
  totalBalance: number;
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

interface SentimentData {
  symbol: string;
  score: number;
  source: string;
  timestamp: Date;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextState {
  user: User | null;
  portfolio: PortfolioData | null;
  sentimentData: SentimentData[];
  isLoading: {
    user: boolean;
    portfolio: boolean;
    sentiment: boolean;
  };
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setPortfolio: (portfolio: PortfolioData | null) => void;
  setSentimentData: (data: SentimentData[]) => void;
  setIsLoading: (loading: {
    user: boolean;
    portfolio: boolean;
    sentiment: boolean;
  }) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Valor padrão do contexto
const defaultContextValue: AppContextState = {
  user: null,
  portfolio: null,
  sentimentData: [],
  isLoading: {
    user: false,
    portfolio: false,
    sentiment: false,
  },
  theme: 'light',
  toggleTheme: () => {},
  logout: () => {},
  setUser: () => {},
  setPortfolio: () => {},
  setSentimentData: () => {},
  setIsLoading: () => {},
  setTheme: () => {},
  notifications: [],
  showNotification: () => {},
  dismissNotification: () => {},
  loading: false,
  setLoading: () => {},
};

// Criação do contexto
const AppContext = createContext<AppContextState>(defaultContextValue);

// Hook personalizado para usar o contexto
export const useAppContext = () => useContext(AppContext);

// Provedor do contexto
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [isLoading, setIsLoading] = useState({
    user: false,
    portfolio: false,
    sentiment: false,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Verifica se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Efeito para atualizar o localStorage e o data-theme quando o tema muda
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Adiciona ou remove a classe dark do body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Verificar se há um token salvo no localStorage ao inicializar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Alternar tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    // Lógica adicional de logout (limpar tokens, etc.)
    localStorage.removeItem('token');
  };

  // Adicionar uma nova notificação
  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);
  
  // Remover uma notificação pelo ID
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Valores do contexto
  const contextValue: AppContextState = {
    user,
    portfolio,
    sentimentData,
    isLoading,
    theme,
    toggleTheme,
    setTheme,
    logout,
    setUser,
    setPortfolio,
    setSentimentData,
    setIsLoading,
    notifications,
    showNotification,
    dismissNotification,
    loading,
    setLoading,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext; 