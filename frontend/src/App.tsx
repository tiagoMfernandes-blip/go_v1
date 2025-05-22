import React, { ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardLayout from './components/Layout/DashboardLayout';
import PublicLayout from './components/Layout/PublicLayout';
import MarketPage from './pages/MarketPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsPage from './pages/NewsPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import CryptoDetailPage from './pages/CryptoDetailPage';
import TradePage from './pages/TradePage';
import AnalysisPage from './pages/AnalysisPage';
import TradingSignalsPage from './components/Signals/TradingSignalsPage';

// Página de exemplo para configurações
const SettingsPage: React.FC = () => {
  const { theme } = useAppContext();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <p className="text-lg mb-6">Esta página está em desenvolvimento.</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Aqui poderá configurar preferências de notificação, aparência e outras opções da aplicação.
        </p>
      </div>
    </div>
  );
};

// Componente de Rota Privada
interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user) {
    // Redireciona para o login se não estiver autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAppContext();

  return (
    <Routes>
      {/* Utilizador não autenticado - Layout público */}
      {!user && (
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registar" element={<RegisterPage />} />
          <Route path="/mercado" element={<MarketPage />} />
          <Route path="/moeda/:coinId" element={<CryptoDetailPage />} />
          <Route path="/noticias" element={<NewsPage />} />
        </Route>
      )}
      
      {/* Utilizador autenticado - Layout do dashboard */}
      <Route 
        path="/*" 
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Rotas dentro do layout do dashboard */}
        <Route path="" element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="mercado" element={<MarketPage />} />
        <Route path="moeda/:coinId" element={<CryptoDetailPage />} />
        <Route path="noticias" element={<NewsPage />} />
        <Route path="alertas" element={<AlertsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="negociar" element={<TradePage />} />
        <Route path="analise" element={<AnalysisPage />} />
        <Route path="sinais" element={<TradingSignalsPage />} />
        
        {/* Análise técnica e outros módulos de análise */}
        <Route path="analysis/technical" element={<AnalysisPage />} />
        <Route path="analysis/backtesting" element={<AnalysisPage />} />
        <Route path="analysis/onchain" element={<TradingSignalsPage />} />
        
        {/* Rota de fallback dentro do dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* Rota para página não encontrada - redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
