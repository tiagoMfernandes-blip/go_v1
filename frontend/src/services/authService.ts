import axios from 'axios';

// Constantes
const _API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'gofolio_auth_token';

// Interfaces
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  confirmPassword: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    preferences: {
      theme: 'light' | 'dark';
      language: 'pt' | 'en';
    };
  };
}

// Funções de autenticação
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Esta será a chamada real para a API quando o backend estiver pronto
    // const response = await axios.post(`${_API_URL}/auth/login`, credentials);
    // return response.data;
    
    // Simulação para desenvolvimento enquanto o backend não está pronto
    return new Promise(resolve => {
      setTimeout(() => {
        const mockResponse: AuthResponse = {
          token: 'mock-jwt-token',
          user: {
            id: '1234',
            email: credentials.email,
            preferences: {
              theme: 'light',
              language: 'pt',
            },
          },
        };
        
        // Salvar token no localStorage
        localStorage.setItem(TOKEN_KEY, mockResponse.token);
        
        resolve(mockResponse);
      }, 800);
    });
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Esta será a chamada real para a API quando o backend estiver pronto
    // const response = await axios.post(`${_API_URL}/auth/register`, data);
    // return response.data;
    
    // Simulação para desenvolvimento
    return new Promise(resolve => {
      setTimeout(() => {
        const mockResponse: AuthResponse = {
          token: 'mock-jwt-token-new-user',
          user: {
            id: new Date().getTime().toString(),
            email: data.email,
            preferences: {
              theme: 'light',
              language: 'pt',
            },
          },
        };
        
        // Salvar token no localStorage
        localStorage.setItem(TOKEN_KEY, mockResponse.token);
        
        resolve(mockResponse);
      }, 800);
    });
  } catch (error) {
    console.error('Erro no registo:', error);
    throw error;
  }
};

const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Interceptor para incluir o token em todas as requisições
axios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação (401)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  login,
  register,
  logout,
  getToken,
  isAuthenticated,
};

export default authService; 