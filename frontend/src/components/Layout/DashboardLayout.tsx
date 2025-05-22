import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Navbar from '../Dashboard/Navbar';
import Footer from '../Dashboard/Footer';
import Notifications from '../common/Notifications';

const DashboardLayout: React.FC = () => {
  const { theme } = useAppContext();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Notificações */}
      <Notifications />
      
      {/* Navbar lateral */}
      <Navbar />
      
      {/* Conteúdo principal */}
      <div className="ml-20 md:ml-64 transition-all duration-300 ease-in-out min-h-screen flex flex-col">
        <main className="flex-grow p-6">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout; 