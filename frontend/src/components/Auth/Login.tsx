import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAppContext } from '../../context/AppContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validações básicas
      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      await authService.login({ email, password });
      
      // Redirecionar para dashboard após login bem-sucedido
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha no login. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">GoFolio</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Faça login para aceder ao seu portfólio</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button" 
                className="text-blue-600 hover:underline"
                onClick={() => navigate('/esqueci-senha')}
              >
                Esqueceu a senha?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
            disabled={isLoading}
          >
            {isLoading ? 'A processar...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p>
            Não tem uma conta?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => navigate('/register')}
            >
              Registe-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 