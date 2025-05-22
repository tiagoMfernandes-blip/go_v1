import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';

interface UserProfile {
  name: string;
  email: string;
  profilePicture: string | null;
  preferredCurrency: string;
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
  },
  twoFactorEnabled: boolean;
}

const ProfilePage: React.FC = () => {
  const { theme, setTheme, showNotification } = useAppContext();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Utilizador Demo',
    email: 'utilizador@exemplo.com',
    profilePicture: null,
    preferredCurrency: 'EUR',
    notifications: {
      email: true,
      push: false,
      priceAlerts: true,
    },
    twoFactorEnabled: false,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setEditedProfile(profile);
    }
    setIsEditing(!isEditing);
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedProfile(prev => {
        // Garantir que a propriedade parent é um objeto antes de usar spread
        const parentObj = prev[parent as keyof UserProfile];
        if (parentObj && typeof parentObj === 'object' && !Array.isArray(parentObj)) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            }
          };
        }
        return prev;
      });
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };
  
  const handleSaveProfile = () => {
    // Simulate API call to save profile
    setTimeout(() => {
      setProfile(editedProfile);
      setIsEditing(false);
      showNotification({
        type: 'success',
        message: 'Perfil atualizado com sucesso'
      });
    }, 800);
  };
  
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      showNotification({
        type: 'error',
        message: 'As palavras-passe não coincidem'
      });
      return;
    }
    
    if (newPassword.length < 8) {
      showNotification({
        type: 'error',
        message: 'A palavra-passe deve ter pelo menos 8 caracteres'
      });
      return;
    }
    
    // Simulate API call to change password
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      showNotification({
        type: 'success',
        message: 'Palavra-passe alterada com sucesso'
      });
    }, 800);
  };
  
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showNotification({
      type: 'info',
      message: `Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Perfil do Utilizador</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações pessoais */}
        <div className="col-span-2">
          <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informações Pessoais</h2>
              <button 
                onClick={handleEditToggle}
                className={`px-4 py-2 rounded-md ${
                  isEditing 
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="name"
                    value={editedProfile.name}
                    onChange={handleProfileChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                ) : (
                  <p>{profile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    name="email"
                    value={editedProfile.email}
                    onChange={handleProfileChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                ) : (
                  <p>{profile.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Moeda Preferida</label>
                {isEditing ? (
                  <select 
                    name="preferredCurrency"
                    value={editedProfile.preferredCurrency}
                    onChange={handleProfileChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="GBP">Libra (GBP)</option>
                  </select>
                ) : (
                  <p>{profile.preferredCurrency === 'EUR' ? 'Euro (EUR)' : 
                      profile.preferredCurrency === 'USD' ? 'Dólar (USD)' : 'Libra (GBP)'}</p>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                  >
                    Guardar Alterações
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Segurança */}
          <div className={`mt-6 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Segurança</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Autenticação de dois fatores</span>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="twoFactorEnabled"
                    id="twoFactorToggle"
                    checked={isEditing ? editedProfile.twoFactorEnabled : profile.twoFactorEnabled}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className="sr-only"
                  />
                  <label 
                    htmlFor="twoFactorToggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      (isEditing ? editedProfile.twoFactorEnabled : profile.twoFactorEnabled) 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`block h-6 w-6 rounded-full transform transition-transform ${
                      (isEditing ? editedProfile.twoFactorEnabled : profile.twoFactorEnabled) 
                        ? 'translate-x-6 bg-white' 
                        : 'translate-x-0 bg-white'
                    }`}></span>
                  </label>
                </div>
              </div>
              
              <div>
                <button 
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className={`px-4 py-2 rounded-md ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {isChangingPassword ? 'Cancelar' : 'Alterar Palavra-passe'}
                </button>
                
                {isChangingPassword && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Palavra-passe Atual</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nova Palavra-passe</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirmar Palavra-passe</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <button 
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    >
                      Atualizar Palavra-passe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Preferências */}
        <div>
          <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Preferências</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tema</label>
                <div className="flex items-center">
                  <span className="mr-2">Claro</span>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="themeToggle"
                      checked={theme === 'dark'}
                      onChange={handleThemeToggle}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="themeToggle"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`block h-6 w-6 rounded-full transform transition-transform ${
                        theme === 'dark' ? 'translate-x-6 bg-white' : 'translate-x-0 bg-white'
                      }`}></span>
                    </label>
                  </div>
                  <span className="ml-2">Escuro</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notificações</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="emailNotif"
                      name="notifications.email"
                      checked={isEditing ? editedProfile.notifications.email : profile.notifications.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    <label htmlFor="emailNotif">Notificações por Email</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="pushNotif"
                      name="notifications.push"
                      checked={isEditing ? editedProfile.notifications.push : profile.notifications.push}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    <label htmlFor="pushNotif">Notificações Push</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="priceAlert"
                      name="notifications.priceAlerts"
                      checked={isEditing ? editedProfile.notifications.priceAlerts : profile.notifications.priceAlerts}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    <label htmlFor="priceAlert">Alertas de Preço</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 