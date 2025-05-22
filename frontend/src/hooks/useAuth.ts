import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const useAuth = (): UseAuthResult => {
  const { user, setUser, logout: contextLogout, showNotification } = useAppContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica se o token é válido ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      validateToken();
    }
  }, [user]);

  // Função para validar o token
  const validateToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    setIsLoading(true);
    setError(null);
    
    try {
      // Numa implementação real, aqui verificaríamos o token com o backend
      // Por enquanto, simulamos uma verificação bem-sucedida
      
      // Simulação de uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular dados do usuário
      const userData = {
        id: "user-123",
        name: "Utilizador",
        email: "usuario@exemplo.com",
        preferences: {
          theme: 'light' as 'light' | 'dark',
          language: 'pt' as 'pt' | 'en'
        }
      };
      
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Erro ao validar token:', err);
      setError('Sessão expirada. Por favor, faça login novamente.');
      localStorage.removeItem('auth_token');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  // Função de login
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Numa implementação real, aqui enviaríamos as credenciais para o backend
      // Por enquanto, simulamos um login bem-sucedido com algumas validações básicas
      
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      if (!credentials.email.includes('@')) {
        throw new Error('Email inválido');
      }
      
      if (credentials.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      // Simulação de uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resposta e token
      const token = 'simulated_jwt_token_' + Date.now();
      localStorage.setItem('auth_token', token);
      
      // Simular dados do usuário
      const userData = {
        id: "user-123",
        name: credentials.email.split('@')[0],
        email: credentials.email,
        preferences: {
          theme: 'light' as 'light' | 'dark',
          language: 'pt' as 'pt' | 'en'
        }
      };
      
      setUser(userData);
      
      showNotification({
        type: 'success',
        message: 'Login efetuado com sucesso.'
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err instanceof Error ? err.message : 'Falha ao fazer login. Tente novamente.');
      
      showNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao fazer login. Tente novamente.'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, showNotification]);

  // Função de registro
  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Numa implementação real, aqui enviaríamos os dados para criar uma conta no backend
      // Por enquanto, simulamos um registro bem-sucedido com algumas validações básicas
      
      if (!credentials.name || !credentials.email || !credentials.password) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      if (!credentials.email.includes('@')) {
        throw new Error('Email inválido');
      }
      
      if (credentials.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      // Simulação de uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resposta e token
      const token = 'simulated_jwt_token_' + Date.now();
      localStorage.setItem('auth_token', token);
      
      // Simular dados do usuário
      const userData = {
        id: "user-" + Date.now(),
        name: credentials.name,
        email: credentials.email,
        preferences: {
          theme: 'light' as 'light' | 'dark',
          language: 'pt' as 'pt' | 'en'
        }
      };
      
      setUser(userData);
      
      showNotification({
        type: 'success',
        message: 'Sua conta foi criada com sucesso.'
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError(err instanceof Error ? err.message : 'Falha ao criar conta. Tente novamente.');
      
      showNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao criar conta. Tente novamente.'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, showNotification]);

  // Função de logout
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    contextLogout();
    
    showNotification({
      type: 'info',
      message: 'Você saiu da sua conta.'
    });
  }, [contextLogout, showNotification]);

  return {
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    validateToken
  };
};

export default useAuth; 