import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import authService from '../../services/authService';

interface HeaderProps {
  onRefreshData: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefreshData }) => {
  const { theme, toggleTheme, user, logout } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    authService.logout();
    navigate('/login');
  };

  return (
    <header className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">GoFolio</h1>
        
        <div className="flex items-center space-x-4">
          <button 
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            onClick={onRefreshData}
          >
            Atualizar Dados
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              className={`flex items-center space-x-1 p-2 rounded-md ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </span>
              <span className="hidden md:inline">{user?.email || 'Utilizador'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              } ring-1 ring-black ring-opacity-5 z-10`}>
                <div className="px-4 py-2 text-sm border-b">
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <button
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
                </button>
                
                <button
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/perfil');
                  }}
                >
                  👤 Perfil
                </button>
                
                <button
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/configuracoes');
                  }}
                >
                  ⚙️ Configurações
                </button>
                
                <button
                  className="block px-4 py-2 text-sm w-full text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 