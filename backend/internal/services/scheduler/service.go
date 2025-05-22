package scheduler

import (
	"context"
	"log"
	"time"

	"github.com/tiagofernandes/gofolio/internal/models"
	"github.com/tiagofernandes/gofolio/internal/services/scraper"
)

// SchedulerService gerencia a coleta periódica de dados
type SchedulerService struct {
	scraper    *scraper.ScraperService
	repository models.HistoricalDataRepository
	stopChan   chan struct{}
}

// NewSchedulerService cria um novo serviço de agendamento
func NewSchedulerService(scraper *scraper.ScraperService, repository models.HistoricalDataRepository) *SchedulerService {
	return &SchedulerService{
		scraper:    scraper,
		repository: repository,
		stopChan:   make(chan struct{}),
	}
}

// Start inicia todos os agendamentos
func (s *SchedulerService) Start() {
	log.Println("Iniciando agendador de coleta de dados...")
	
	// Iniciar coleta periódica de dados
	go s.scheduleMarketDataCollection()
	go s.scheduleTechnicalAnalysis()
	go s.scheduleSentimentAnalysis()
	go s.scheduleDataCleanup()
	
	log.Println("Agendador iniciado com sucesso")
}

// Stop interrompe todos os agendamentos
func (s *SchedulerService) Stop() {
	log.Println("Parando agendador...")
	close(s.stopChan)
}

// ScheduleMarketDataCollection agenda coleta de dados de mercado
func (s *SchedulerService) scheduleMarketDataCollection() {
	// Coletar imediatamente na inicialização
	s.collectAndStoreMarketData()
	
	// Agendar coletas periódicas
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			s.collectAndStoreMarketData()
		case <-s.stopChan:
			log.Println("Agendamento de coleta de dados de mercado parado")
			return
		}
	}
}

// CollectAndStoreMarketData coleta dados e armazena no histórico
func (s *SchedulerService) collectAndStoreMarketData() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	log.Println("Coletando dados de mercado...")
	
	data, err := s.scraper.GetMarketData(ctx)
	if err != nil {
		log.Printf("Erro ao coletar dados de mercado: %v", err)
		return
	}
	
	log.Printf("Dados coletados para %d criptomoedas", len(data))
	
	// Converter para formato de histórico
	historicalData := make([]models.HistoricalData, len(data))
	now := time.Now()
	
	for i, d := range data {
		historicalData[i] = models.HistoricalData{
			Symbol:    d.Symbol,
			Price:     d.CurrentPrice,
			Volume:    d.TotalVolume,
			MarketCap: d.MarketCap,
			Timestamp: now,
			CreatedAt: now,
		}
	}
	
	// Salvar no repositório
	if err := s.repository.SaveHistoricalData(historicalData); err != nil {
		log.Printf("Erro ao salvar dados históricos: %v", err)
		return
	}
	
	log.Println("Dados de mercado armazenados com sucesso")
}

// ScheduleTechnicalAnalysis agenda cálculo de análise técnica
func (s *SchedulerService) scheduleTechnicalAnalysis() {
	// Agendar análises periódicas
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	
	// Lista de símbolos populares para analisar
	symbols := []string{"BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOGE", "DOT"}
	
	for {
		select {
		case <-ticker.C:
			s.calculateTechnicalIndicators(symbols)
		case <-s.stopChan:
			log.Println("Agendamento de análise técnica parado")
			return
		}
	}
}

// CalculateTechnicalIndicators calcula indicadores técnicos para uma lista de símbolos
func (s *SchedulerService) calculateTechnicalIndicators(symbols []string) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	
	log.Println("Calculando indicadores técnicos...")
	
	for _, symbol := range symbols {
		_, err := s.scraper.GetTechnicalAnalysis(ctx, symbol)
		if err != nil {
			log.Printf("Erro ao calcular indicadores técnicos para %s: %v", symbol, err)
			continue
		}
		
		log.Printf("Indicadores técnicos calculados para %s", symbol)
		
		// Pequeno delay para não sobrecarregar as APIs
		time.Sleep(5 * time.Second)
	}
}

// ScheduleSentimentAnalysis agenda coleta de análise de sentimento
func (s *SchedulerService) scheduleSentimentAnalysis() {
	// Agendar análises periódicas
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()
	
	// Lista de símbolos populares para analisar
	symbols := []string{"BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOGE", "DOT"}
	
	for {
		select {
		case <-ticker.C:
			s.collectSentimentData(symbols)
		case <-s.stopChan:
			log.Println("Agendamento de análise de sentimento parado")
			return
		}
	}
}

// CollectSentimentData coleta dados de sentimento para uma lista de símbolos
func (s *SchedulerService) collectSentimentData(symbols []string) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	
	log.Println("Coletando dados de sentimento...")
	
	for _, symbol := range symbols {
		_, err := s.scraper.GetSentimentAnalysis(ctx, symbol)
		if err != nil {
			log.Printf("Erro ao coletar dados de sentimento para %s: %v", symbol, err)
			continue
		}
		
		log.Printf("Dados de sentimento coletados para %s", symbol)
		
		// Pequeno delay para não sobrecarregar as APIs
		time.Sleep(3 * time.Second)
	}
}

// ScheduleDataCleanup agenda limpeza de dados antigos
func (s *SchedulerService) scheduleDataCleanup() {
	// Executar limpeza uma vez por dia
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			s.cleanupOldData()
		case <-s.stopChan:
			log.Println("Agendamento de limpeza de dados parado")
			return
		}
	}
}

// CleanupOldData limpa dados mais antigos que 90 dias
func (s *SchedulerService) cleanupOldData() {
	log.Println("Limpando dados antigos...")
	
	// Calcular data limite (90 dias atrás)
	cutoffDate := time.Now().AddDate(0, 0, -90)
	
	err := s.repository.DeleteOldData(cutoffDate)
	if err != nil {
		log.Printf("Erro ao limpar dados antigos: %v", err)
		return
	}
	
	log.Println("Dados antigos limpos com sucesso")
} 