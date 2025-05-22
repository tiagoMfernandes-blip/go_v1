package scraper

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"
)

// Constantes para URLs de APIs gratuitas
const (
	COINGECKO_API      = "https://api.coingecko.com/api/v3"
	ALTERNATIVE_ME_API = "https://api.alternative.me/v2/ticker/"
	COINMARKETCAP_URL  = "https://coinmarketcap.com/currencies/"
	TRADINGVIEW_URL    = "https://www.tradingview.com/symbols/"
	CRYPTOCOMPARE_API  = "https://min-api.cryptocompare.com/data/"
)

// CryptoData representa os dados de uma criptomoeda
type CryptoData struct {
	ID                 string  `json:"id"`
	Symbol             string  `json:"symbol"`
	Name               string  `json:"name"`
	CurrentPrice       float64 `json:"current_price"`
	MarketCap          float64 `json:"market_cap"`
	MarketCapRank      int     `json:"market_cap_rank"`
	TotalVolume        float64 `json:"total_volume"`
	High24h            float64 `json:"high_24h"`
	Low24h             float64 `json:"low_24h"`
	PriceChange24h     float64 `json:"price_change_24h"`
	PriceChangePercent float64 `json:"price_change_percentage_24h"`
	ATH                float64 `json:"ath"`
	ATHChangePercent   float64 `json:"ath_change_percentage"`
	LastUpdated        string  `json:"last_updated"`
}

// TechnicalIndicator representa um indicador técnico
type TechnicalIndicator struct {
	Name   string  `json:"name"`
	Value  float64 `json:"value"`
	Signal string  `json:"signal"` // "buy", "sell", ou "neutral"
}

// TechnicalAnalysis representa uma análise técnica completa
type TechnicalAnalysis struct {
	Symbol     string               `json:"symbol"`
	Indicators []TechnicalIndicator `json:"indicators"`
	Summary    struct {
		Signal      string  `json:"signal"`      // "buy", "sell", ou "neutral"
		Strength    float64 `json:"strength"`    // 0-1
		Description string  `json:"description"` // Explicação da análise
	} `json:"summary"`
	LastUpdated time.Time `json:"last_updated"`
}

// SentimentData representa dados de sentimento de mercado
type SentimentData struct {
	Symbol    string    `json:"symbol"`
	Score     float64   `json:"score"`  // 0-1, onde 1 é muito positivo
	Source    string    `json:"source"` // "social", "news", etc.
	Timestamp time.Time `json:"timestamp"`
	Details   struct {
		PositiveCount int `json:"positive_count"`
		NegativeCount int `json:"negative_count"`
		NeutralCount  int `json:"neutral_count"`
	} `json:"details"`
}

// ScraperService implementa o serviço de raspagem de dados
type ScraperService struct {
	httpClient *http.Client
	cache      *CacheService
	// Canal para transmitir novos dados para assinantes
	dataUpdateChan chan interface{}
	// Mutex para proteção de recursos compartilhados
	mu sync.RWMutex
}

// CacheService implementa o serviço de cache
type CacheService struct {
	items map[string]CacheItem
	mu    sync.RWMutex
}

// CacheItem representa um item no cache
type CacheItem struct {
	Value      interface{}
	Expiration int64
}

// NewCacheService cria um novo serviço de cache
func NewCacheService() *CacheService {
	cache := &CacheService{
		items: make(map[string]CacheItem),
	}

	// Iniciar rotina para limpar itens expirados
	go cache.janitor()

	return cache
}

// Set adiciona um item ao cache com tempo de expiração
func (c *CacheService) Set(key string, value interface{}, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	expiration := time.Now().Add(duration).UnixNano()
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: expiration,
	}
}

// Get obtém um item do cache
func (c *CacheService) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	// Verificar se expirou
	if time.Now().UnixNano() > item.Expiration {
		return nil, false
	}

	return item.Value, true
}

// Delete remove um item do cache
func (c *CacheService) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
}

// Janitor limpa itens expirados periodicamente
func (c *CacheService) janitor() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C
		c.deleteExpired()
	}
}

// DeleteExpired remove todos os itens expirados
func (c *CacheService) deleteExpired() {
	now := time.Now().UnixNano()

	c.mu.Lock()
	defer c.mu.Unlock()

	for k, v := range c.items {
		if now > v.Expiration {
			delete(c.items, k)
		}
	}
}

// NewScraperService cria um novo serviço de raspagem
func NewScraperService() *ScraperService {
	return &ScraperService{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		cache:          NewCacheService(),
		dataUpdateChan: make(chan interface{}),
	}
}

// GetMarketData obtém dados do mercado de criptomoedas
func (s *ScraperService) GetMarketData(ctx context.Context) ([]CryptoData, error) {
	// Tentar buscar do cache primeiro
	cacheKey := "market_data"
	if cachedData, found := s.cache.Get(cacheKey); found {
		return cachedData.([]CryptoData), nil
	}

	// Tentar primeiro CoinGecko
	data, err := s.fetchCoinGeckoMarketData(ctx)
	if err != nil {
		// Fallback para CryptoCompare
		data, err = s.fetchCryptoCompareMarketData(ctx)
		if err != nil {
			// Último fallback para Alternative.me
			data, err = s.fetchAlternativeMeMarketData(ctx)
			if err != nil {
				return nil, fmt.Errorf("todos os serviços de dados falharam: %w", err)
			}
		}
	}

	// Armazenar em cache por 15 minutos
	s.cache.Set(cacheKey, data, 15*time.Minute)

	// Notificar assinantes sobre novos dados
	select {
	case s.dataUpdateChan <- data:
		// Enviado com sucesso
	default:
		// Canal está cheio ou não há assinantes, ignorar
	}

	return data, nil
}

// FetchCoinGeckoMarketData obtém dados da API do CoinGecko
func (s *ScraperService) fetchCoinGeckoMarketData(ctx context.Context) ([]CryptoData, error) {
	url := fmt.Sprintf("%s/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100", COINGECKO_API)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status inválido: %d", resp.StatusCode)
	}

	var data []CryptoData
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return data, nil
}

// FetchCryptoCompareMarketData obtém dados da API do CryptoCompare
func (s *ScraperService) fetchCryptoCompareMarketData(ctx context.Context) ([]CryptoData, error) {
	url := fmt.Sprintf("%sprice?fsym=BTC,ETH,BNB,XRP,ADA,SOL,DOGE,DOT&tsyms=EUR&extraParams=GoFolio", CRYPTOCOMPARE_API)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status inválido: %d", resp.StatusCode)
	}

	// Adaptar a resposta para o formato CryptoData
	var rawData map[string]map[string]float64
	if err := json.NewDecoder(resp.Body).Decode(&rawData); err != nil {
		return nil, err
	}

	// Converter para nosso formato
	result := make([]CryptoData, 0, len(rawData))
	for symbol, prices := range rawData {
		data := CryptoData{
			Symbol:       symbol,
			CurrentPrice: prices["EUR"],
			LastUpdated:  time.Now().Format(time.RFC3339),
		}
		result = append(result, data)
	}

	return result, nil
}

// FetchAlternativeMeMarketData obtém dados da API do Alternative.me
func (s *ScraperService) fetchAlternativeMeMarketData(ctx context.Context) ([]CryptoData, error) {
	url := ALTERNATIVE_ME_API

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status inválido: %d", resp.StatusCode)
	}

	// Adaptar a resposta para o formato CryptoData
	var rawData struct {
		Data map[string]struct {
			ID               string `json:"id"`
			Name             string `json:"name"`
			Symbol           string `json:"symbol"`
			PriceEur         string `json:"price_eur"`
			PercentChange24h string `json:"percent_change_24h"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&rawData); err != nil {
		return nil, err
	}

	// Converter para nosso formato
	result := make([]CryptoData, 0, len(rawData.Data))
	for _, crypto := range rawData.Data {
		// Converter strings para float64
		price, _ := strconv.ParseFloat(crypto.PriceEur, 64)
		change, _ := strconv.ParseFloat(crypto.PercentChange24h, 64)

		data := CryptoData{
			ID:                 crypto.ID,
			Name:               crypto.Name,
			Symbol:             crypto.Symbol,
			CurrentPrice:       price,
			PriceChangePercent: change,
			LastUpdated:        time.Now().Format(time.RFC3339),
		}
		result = append(result, data)
	}

	return result, nil
}

// GetTechnicalAnalysis obtém análise técnica para uma criptomoeda
func (s *ScraperService) GetTechnicalAnalysis(ctx context.Context, symbol string) (*TechnicalAnalysis, error) {
	// Tentar buscar do cache primeiro
	cacheKey := fmt.Sprintf("technical_%s", symbol)
	if cachedData, found := s.cache.Get(cacheKey); found {
		return cachedData.(*TechnicalAnalysis), nil
	}

	// Obter dados históricos para calcular indicadores
	historicalData, err := s.GetHistoricalData(ctx, symbol, "1d", 30)
	if err != nil {
		return nil, fmt.Errorf("falha ao obter dados históricos: %w", err)
	}

	// Calcular indicadores técnicos
	analysis := &TechnicalAnalysis{
		Symbol:      symbol,
		Indicators:  make([]TechnicalIndicator, 0),
		LastUpdated: time.Now(),
	}

	// Calcular RSI
	rsi := s.calculateRSI(historicalData)
	rsiSignal := "neutral"
	if rsi < 30 {
		rsiSignal = "buy"
	} else if rsi > 70 {
		rsiSignal = "sell"
	}

	analysis.Indicators = append(analysis.Indicators, TechnicalIndicator{
		Name:   "RSI",
		Value:  rsi,
		Signal: rsiSignal,
	})

	// Calcular MACD
	macd, signal := s.calculateMACD(historicalData)
	macdSignal := "neutral"
	if macd > signal {
		macdSignal = "buy"
	} else if macd < signal {
		macdSignal = "sell"
	}

	analysis.Indicators = append(analysis.Indicators, TechnicalIndicator{
		Name:   "MACD",
		Value:  macd,
		Signal: macdSignal,
	})

	// Adicionar outros indicadores aqui

	// Calcular resumo geral
	buySignals := 0
	sellSignals := 0

	for _, indicator := range analysis.Indicators {
		if indicator.Signal == "buy" {
			buySignals++
		} else if indicator.Signal == "sell" {
			sellSignals++
		}
	}

	if buySignals > sellSignals {
		analysis.Summary.Signal = "buy"
		analysis.Summary.Strength = float64(buySignals) / float64(len(analysis.Indicators))
		analysis.Summary.Description = fmt.Sprintf("%d/%d indicadores sugerem compra", buySignals, len(analysis.Indicators))
	} else if sellSignals > buySignals {
		analysis.Summary.Signal = "sell"
		analysis.Summary.Strength = float64(sellSignals) / float64(len(analysis.Indicators))
		analysis.Summary.Description = fmt.Sprintf("%d/%d indicadores sugerem venda", sellSignals, len(analysis.Indicators))
	} else {
		analysis.Summary.Signal = "neutral"
		analysis.Summary.Strength = 0.5
		analysis.Summary.Description = "Indicadores técnicos estão mistos"
	}

	// Armazenar em cache por 1 hora
	s.cache.Set(cacheKey, analysis, 1*time.Hour)

	return analysis, nil
}

// GetHistoricalData obtém dados históricos para uma criptomoeda
func (s *ScraperService) GetHistoricalData(ctx context.Context, symbol string, interval string, limit int) ([]map[string]interface{}, error) {
	// Tentar buscar do cache primeiro
	cacheKey := fmt.Sprintf("history_%s_%s_%d", symbol, interval, limit)
	if cachedData, found := s.cache.Get(cacheKey); found {
		return cachedData.([]map[string]interface{}), nil
	}

	// Tentar CoinGecko primeiro
	data, err := s.fetchCoinGeckoHistoricalData(ctx, symbol, interval, limit)
	if err != nil {
		// Fallback para CryptoCompare
		data, err = s.fetchCryptoCompareHistoricalData(ctx, symbol, interval, limit)
		if err != nil {
			return nil, fmt.Errorf("falha ao obter dados históricos: %w", err)
		}
	}

	// Armazenar em cache por 2 horas
	s.cache.Set(cacheKey, data, 2*time.Hour)

	return data, nil
}

// Implementações de cálculo de indicadores técnicos e obtenção de dados históricos
// Essas são simplificações e devem ser expandidas com algoritmos reais

func (s *ScraperService) calculateRSI(data []map[string]interface{}) float64 {
	// Simulação simplificada de cálculo de RSI
	// Em um caso real, implementaríamos o algoritmo completo do RSI

	if len(data) < 14 {
		return 50.0 // Valor neutro para dados insuficientes
	}

	// Simulação para demonstração
	// Valor aleatório entre 0 e 100, tendendo para o meio (30-70)
	return 30.0 + (70.0 * rand.Float64())
}

func (s *ScraperService) calculateMACD(data []map[string]interface{}) (float64, float64) {
	// Simulação simplificada de cálculo de MACD
	// Em um caso real, implementaríamos o algoritmo completo do MACD

	if len(data) < 26 {
		return 0.0, 0.0 // Valores neutros para dados insuficientes
	}

	// Simulação para demonstração
	macd := -1.0 + (2.0 * rand.Float64())   // Valor entre -1 e 1
	signal := -1.0 + (2.0 * rand.Float64()) // Valor entre -1 e 1

	return macd, signal
}

// GetSentimentAnalysis obtém análise de sentimento para uma criptomoeda
func (s *ScraperService) GetSentimentAnalysis(ctx context.Context, symbol string) (*SentimentData, error) {
	// Tentar buscar do cache primeiro
	cacheKey := fmt.Sprintf("sentiment_%s", symbol)
	if cachedData, found := s.cache.Get(cacheKey); found {
		return cachedData.(*SentimentData), nil
	}

	// Em um ambiente real, faríamos scraping de dados de sentimento de redes sociais
	// Para fins de demonstração, vamos simular dados de sentimento

	positiveCount := rand.Intn(1000)
	negativeCount := rand.Intn(500)
	neutralCount := rand.Intn(300)
	total := float64(positiveCount + negativeCount + neutralCount)

	sentiment := &SentimentData{
		Symbol:    symbol,
		Score:     float64(positiveCount) / total,
		Source:    "social",
		Timestamp: time.Now(),
	}

	sentiment.Details.PositiveCount = positiveCount
	sentiment.Details.NegativeCount = negativeCount
	sentiment.Details.NeutralCount = neutralCount

	// Armazenar em cache por 30 minutos
	s.cache.Set(cacheKey, sentiment, 30*time.Minute)

	return sentiment, nil
}

// StartPeriodicDataCollection inicia a coleta periódica de dados
func (s *ScraperService) StartPeriodicDataCollection(ctx context.Context) {
	go s.collectMarketDataPeriodically(ctx)
	go s.collectTechnicalAnalysisPeriodically(ctx)
	go s.collectSentimentDataPeriodically(ctx)
}

// CollectMarketDataPeriodically coleta dados de mercado periodicamente
func (s *ScraperService) collectMarketDataPeriodically(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			_, err := s.GetMarketData(ctx)
			if err != nil {
				// Logar erro, mas continuar tentando
				fmt.Printf("Erro ao coletar dados de mercado: %v\n", err)
			}
		case <-ctx.Done():
			return
		}
	}
}

// CollectTechnicalAnalysisPeriodically coleta análises técnicas periodicamente
func (s *ScraperService) collectTechnicalAnalysisPeriodically(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	// Lista de símbolos populares para analisar
	symbols := []string{"BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOGE", "DOT"}

	for {
		select {
		case <-ticker.C:
			for _, symbol := range symbols {
				_, err := s.GetTechnicalAnalysis(ctx, symbol)
				if err != nil {
					fmt.Printf("Erro ao coletar análise técnica para %s: %v\n", symbol, err)
				}

				// Pequeno delay para não sobrecarregar as APIs
				time.Sleep(5 * time.Second)
			}
		case <-ctx.Done():
			return
		}
	}
}

// CollectSentimentDataPeriodically coleta dados de sentimento periodicamente
func (s *ScraperService) collectSentimentDataPeriodically(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()

	// Lista de símbolos populares para analisar
	symbols := []string{"BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOGE", "DOT"}

	for {
		select {
		case <-ticker.C:
			for _, symbol := range symbols {
				_, err := s.GetSentimentAnalysis(ctx, symbol)
				if err != nil {
					fmt.Printf("Erro ao coletar dados de sentimento para %s: %v\n", symbol, err)
				}

				// Pequeno delay para não sobrecarregar as APIs
				time.Sleep(3 * time.Second)
			}
		case <-ctx.Done():
			return
		}
	}
}

// GetFearAndGreedIndex obtém o índice de medo e ganância do mercado
func (s *ScraperService) GetFearAndGreedIndex(ctx context.Context) (map[string]interface{}, error) {
	// Tentar buscar do cache primeiro
	cacheKey := "fear_greed_index"
	if cachedData, found := s.cache.Get(cacheKey); found {
		return cachedData.(map[string]interface{}), nil
	}

	// URL da API do Alternative.me para o índice de medo e ganância
	url := "https://api.alternative.me/fng/"

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status inválido: %d", resp.StatusCode)
	}

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	// Armazenar em cache por 6 horas
	s.cache.Set(cacheKey, data, 6*time.Hour)

	return data, nil
}

// SubscribeToDataUpdates permite que outros serviços assinem atualizações de dados
func (s *ScraperService) SubscribeToDataUpdates() <-chan interface{} {
	return s.dataUpdateChan
}
