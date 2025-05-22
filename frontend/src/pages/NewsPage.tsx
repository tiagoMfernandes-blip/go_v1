import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import CryptoService, { CryptoNews } from '../services/cryptoService';

// Interface para as notícias - já definida no CryptoService, então podemos reutilizá-la

const NewsPage: React.FC = () => {
  const { showNotification } = useAppContext();
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Categorias disponíveis
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'regulação', name: 'Regulação' },
    { id: 'tecnologia', name: 'Tecnologia' },
    { id: 'portugal', name: 'Portugal' },
    { id: 'mercado', name: 'Mercado' }
  ];

  // Carregar notícias usando o serviço
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const newsData = await CryptoService.getNews();
        setNews(newsData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        setError('Falha ao carregar notícias. Por favor, tente novamente mais tarde.');
        showNotification({
          type: 'error',
          message: 'Não foi possível obter as notícias mais recentes.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [showNotification]);

  // Filtra notícias com base na categoria selecionada e no termo de busca
  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categories.includes(selectedCategory);
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Formata a data no padrão pt-PT
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return dateString; // Caso haja erro, retorna a string original
    }
  };

  // Tratamento de erros para imagens
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/assets/placeholder-news.jpg'; // Fallback para imagem local
    e.currentTarget.onerror = null; // Prevenir loop infinito
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notícias de Criptomoedas</h1>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Pesquisar notícias..."
            className="w-full px-4 py-2 pl-10 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de notícias */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Nenhuma notícia encontrada para "{searchTerm}" na categoria selecionada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(item => (
            <div key={item.id} className="card overflow-hidden shadow-md rounded-lg bg-white dark:bg-gray-800">
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-48 object-cover object-center transition-transform hover:scale-105"
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.source}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.published_at)}</span>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.categories.map(cat => (
                    <span 
                      key={cat} 
                      className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      onClick={() => setSelectedCategory(cat)}
                      style={{ cursor: 'pointer' }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => showNotification({ type: 'info', message: 'Funcionalidade de notícias apenas para demonstração.' })}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Ler mais →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>As notícias apresentadas são apenas para fins demonstrativos.</p>
        <p>Em uma implementação real, seriam obtidas através de APIs como CryptoCompare, CoinDesk ou Cryptopanic.</p>
      </div>
    </div>
  );
};

export default NewsPage; 