package market

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/tiagofernandes/gofolio/internal/models"
	"github.com/tiagofernandes/gofolio/pkg/client"
)

// Service é o serviço para dados de mercado de criptomoedas
type Service struct {
	repo             models.CryptoRepository
	coinMarketCap    *client.CoinMarketCapScraper
	coinGecko        *client.CoinGeckoScraper
	cache            map[string]cacheItem
	lastGlobalUpdate time.Time
	mu               sync.RWMutex
}

type cacheItem struct {
	data      interface{}
	timestamp time.Time
	expiry    time.Duration
}

// NewService cria uma nova instância do serviço de mercado
func NewService(repo models.CryptoRepository) *Service {
	return &Service{
		repo:          repo,
		coinMarketCap: client.NewCoinMarketCapScraper(),
		coinGecko:     client.NewCoinGeckoScraper(),
		cache:         make(map[string]cacheItem),
	}
}

// isCacheValid verifica se um item no cache ainda é válido
func (s *Service) isCacheValid(key string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	item, exists := s.cache[key]
	if !exists {
		return false
	}
	return time.Since(item.timestamp) < item.expiry
}

// setCache salva um item no cache
func (s *Service) setCache(key string, data interface{}, expiry time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	s.cache[key] = cacheItem{
		data:      data,
		timestamp: time.Now(),
		expiry:    expiry,
	}
}

// getCache recupera um item do cache
func (s *Service) getCache(key string) (interface{}, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	item, exists := s.cache[key]
	if !exists {
		return nil, false
	}
	
	return item.data, true
}

// GetMarketData obtém dados de mercado de criptomoedas
func (s *Service) GetMarketData(currency string, limit int, page int, ids []string) ([]models.CryptoData, error) {
	cacheKey := fmt.Sprintf("market_data_%s_%d_%d_%v", currency, limit, page, ids)
	
	// Verificar cache
	if s.isCacheValid(cacheKey) {
		if data, ok := s.getCache(cacheKey); ok {
			return data.([]models.CryptoData), nil
		}
	}
	
	// Verificar no repositório
	data, err := s.repo.GetMarketData(currency, limit, page, ids)
	if err == nil && len(data) > 0 {
		s.setCache(cacheKey, data, 5*time.Minute)
		return data, nil
	}
	
	// Se não houver dados no repositório, fazer scraping
	var marketData []models.CryptoData
	var wg sync.WaitGroup
	var mu sync.Mutex
	var errors []error
	
	// CoinMarketCap
	wg.Add(1)
	go func() {
		defer wg.Done()
		
		cmcData, err := s.coinMarketCap.GetMarketData(limit)
		if err != nil {
			log.Printf("Erro ao obter dados do CoinMarketCap: %v\n", err)
			mu.Lock()
			errors = append(errors, err)
			mu.Unlock()
			return
		}
		
		mu.Lock()
		marketData = append(marketData, cmcData...)
		mu.Unlock()
	}()
	
	// CoinGecko
	wg.Add(1)
	go func() {
		defer wg.Done()
		
		cgData, err := s.coinGecko.GetMarketData(limit)
		if err != nil {
			log.Printf("Erro ao obter dados do CoinGecko: %v\n", err)
			mu.Lock()
			errors = append(errors, err)
			mu.Unlock()
			return
		}
		
		mu.Lock()
		marketData = append(marketData, cgData...)
		mu.Unlock()
	}()
	
	wg.Wait()
	
	if len(marketData) == 0 {
		return nil, fmt.Errorf("não foi possível obter dados de mercado: %v", errors)
	}
	
	// Salvar dados no repositório
	go func() {
		if err := s.repo.SaveMarketData(marketData); err != nil {
			log.Printf("Erro ao salvar dados de mercado: %v\n", err)
		}
	}()
	
	s.setCache(cacheKey, marketData, 5*time.Minute)
	
	return marketData, nil
}

// GetCoinDetails obtém detalhes de uma criptomoeda específica
func (s *Service) GetCoinDetails(id string) (*models.CoinDetails, error) {
	cacheKey := fmt.Sprintf("coin_details_%s", id)
	
	// Verificar cache
	if s.isCacheValid(cacheKey) {
		if data, ok := s.getCache(cacheKey); ok {
			return data.(*models.CoinDetails), nil
		}
	}
	
	// Verificar no repositório
	details, err := s.repo.GetCoinDetails(id)
	if err == nil && details != nil {
		s.setCache(cacheKey, details, 10*time.Minute)
		return details, nil
	}
	
	// Se não houver dados no repositório, fazer scraping
	var coinDetails *models.CoinDetails
	var getErr error
	
	// Tentar CoinGecko primeiro
	coinDetails, getErr = s.coinGecko.GetCoinDetails(id)
	if getErr != nil || coinDetails == nil {
		log.Printf("Erro ao obter detalhes do CoinGecko: %v. Tentando CoinMarketCap...\n", getErr)
		
		// Tentar CoinMarketCap como fallback
		coinDetails, getErr = s.coinMarketCap.GetCoinDetails(id)
		if getErr != nil || coinDetails == nil {
			return nil, fmt.Errorf("não foi possível obter detalhes da moeda: %v", getErr)
		}
	}
	
	// Salvar dados no repositório
	go func() {
		if err := s.repo.SaveCoinDetails(coinDetails); err != nil {
			log.Printf("Erro ao salvar detalhes da moeda: %v\n", err)
		}
	}()
	
	s.setCache(cacheKey, coinDetails, 10*time.Minute)
	
	return coinDetails, nil
}

// GetHistoricalData obtém dados históricos de preço para uma criptomoeda
func (s *Service) GetHistoricalData(id, currency string, days int) (*models.HistoricalData, error) {
	cacheKey := fmt.Sprintf("historical_data_%s_%s_%d", id, currency, days)
	
	// Verificar cache
	if s.isCacheValid(cacheKey) {
		if data, ok := s.getCache(cacheKey); ok {
			return data.(*models.HistoricalData), nil
		}
	}
	
	// Verificar no repositório
	historicalData, err := s.repo.GetHistoricalData(id, currency, days)
	if err == nil && historicalData != nil && len(historicalData.Prices) > 0 {
		s.setCache(cacheKey, historicalData, 1*time.Hour)
		return historicalData, nil
	}
	
	// Se não houver dados no repositório, fazer scraping
	// Nota: web scraping para dados históricos é limitado
	// Em uma implementação real, seria necessário usar APIs oficiais
	historicalData, err = s.coinGecko.GetHistoricalData(id, currency, days)
	if err != nil || historicalData == nil || len(historicalData.Prices) == 0 {
		log.Printf("Erro ao obter dados históricos do CoinGecko: %v. Tentando CoinMarketCap...\n", err)
		
		historicalData, err = s.coinMarketCap.GetHistoricalData(id, currency, days)
		if err != nil || historicalData == nil || len(historicalData.Prices) == 0 {
			return nil, fmt.Errorf("não foi possível obter dados históricos: %v", err)
		}
	}
	
	// Salvar dados no repositório
	go func() {
		if err := s.repo.SaveHistoricalData(historicalData); err != nil {
			log.Printf("Erro ao salvar dados históricos: %v\n", err)
		}
	}()
	
	s.setCache(cacheKey, historicalData, 1*time.Hour)
	
	return historicalData, nil
}

// GetGlobalMarketData obtém dados globais do mercado de criptomoedas
func (s *Service) GetGlobalMarketData() (*models.GlobalMarketData, error) {
	cacheKey := "global_market_data"
	
	// Verificar cache
	if s.isCacheValid(cacheKey) {
		if data, ok := s.getCache(cacheKey); ok {
			return data.(*models.GlobalMarketData), nil
		}
	}
	
	// Verificar no repositório
	globalData, err := s.repo.GetGlobalMarketData()
	if err == nil && globalData != nil {
		s.setCache(cacheKey, globalData, 15*time.Minute)
		return globalData, nil
	}
	
	// Se não houver dados no repositório, fazer scraping
	var globalMarketData *models.GlobalMarketData
	var getErr error
	
	// Tentar CoinGecko primeiro
	globalMarketData, getErr = s.coinGecko.GetGlobalMarketData()
	if getErr != nil || globalMarketData == nil {
		log.Printf("Erro ao obter dados globais do CoinGecko: %v. Tentando CoinMarketCap...\n", getErr)
		
		// Tentar CoinMarketCap como fallback
		globalMarketData, getErr = s.coinMarketCap.GetGlobalMarketData()
		if getErr != nil || globalMarketData == nil {
			return nil, fmt.Errorf("não foi possível obter dados globais: %v", getErr)
		}
	}
	
	// Salvar dados no repositório
	go func() {
		if err := s.repo.SaveGlobalMarketData(globalMarketData); err != nil {
			log.Printf("Erro ao salvar dados globais: %v\n", err)
		}
	}()
	
	s.setCache(cacheKey, globalMarketData, 15*time.Minute)
	
	return globalMarketData, nil
}

// StartDataCollection inicia a coleta periódica de dados
func (s *Service) StartDataCollection() {
	// Coletar dados iniciais
	s.collectData()
	
	// Iniciar coleta periódica
	go func() {
		ticker := time.NewTicker(15 * time.Minute)
		defer ticker.Stop()
		
		for range ticker.C {
			s.collectData()
		}
	}()
}

// collectData coleta dados de mercado de diferentes fontes
func (s *Service) collectData() {
	log.Println("Iniciando coleta de dados de mercado...")
	
	// Coletar dados de mercado
	go func() {
		marketData, err := s.GetMarketData("usd", 100, 1, nil)
		if err != nil {
			log.Printf("Erro ao coletar dados de mercado: %v\n", err)
			return
		}
		log.Printf("Coletados dados de %d criptomoedas\n", len(marketData))
	}()
	
	// Coletar dados globais
	go func() {
		globalData, err := s.GetGlobalMarketData()
		if err != nil {
			log.Printf("Erro ao coletar dados globais: %v\n", err)
			return
		}
		log.Printf("Dados globais coletados com sucesso. Cap. Total: $%.2f\n", globalData.TotalMarketCap["usd"])
	}()
	
	// Coletar detalhes das principais moedas
	go func() {
		topCoins := []string{"bitcoin", "ethereum", "ripple", "cardano", "solana"}
		var wg sync.WaitGroup
		
		for _, coin := range topCoins {
			wg.Add(1)
			go func(id string) {
				defer wg.Done()
				
				_, err := s.GetCoinDetails(id)
				if err != nil {
					log.Printf("Erro ao coletar detalhes de %s: %v\n", id, err)
					return
				}
				
				_, err = s.GetHistoricalData(id, "usd", 7)
				if err != nil {
					log.Printf("Erro ao coletar dados históricos de %s: %v\n", id, err)
				}
			}(coin)
		}
		
		wg.Wait()
		log.Println("Coleta de detalhes das principais moedas concluída")
	}()
} 