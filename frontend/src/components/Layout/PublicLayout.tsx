import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Notifications from '../common/Notifications';

const PublicLayout: React.FC = () => {
  const { theme, setTheme } = useAppContext();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 
      'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 
      'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Notificações */}
      <Notifications />
      
      {/* Barra de navegação superior */}
      <nav className={`py-4 px-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              GoFolio
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center space-x-1 md:space-x-4">
            <Link to="/" className={`px-3 py-2 rounded-md ${isActive('/')}`}>
              Início
            </Link>
            <Link to="/mercado" className={`px-3 py-2 rounded-md ${isActive('/mercado')}`}>
              Mercado
            </Link>
            <Link to="/noticias" className={`px-3 py-2 rounded-md ${isActive('/noticias')}`}>
              Notícias
            </Link>
            
            {/* Botão para alternar tema */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <div className="border-l border-gray-300 dark:border-gray-700 h-6 mx-2"></div>
            
            <Link to="/login" className={`px-3 py-2 rounded-md ${isActive('/login')}`}>
              Entrar
            </Link>
            <Link to="/registar" className={`px-3 py-2 ml-1 rounded-md bg-blue-600 text-white hover:bg-blue-700`}>
              Registar
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            &copy; {new Date().getFullYear()} GoFolio. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout; 