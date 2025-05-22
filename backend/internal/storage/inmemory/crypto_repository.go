package inmemory

import (
	"errors"
	"sort"
	"sync"
	"time"

	"github.com/tiagofernandes/gofolio/internal/models"
)

// CryptoRepository implementa a interface models.CryptoRepository com armazenamento em memória
// Este é um repositório simples para desenvolvimento. Em produção, deve ser substituído por um banco de dados.
type CryptoRepository struct {
	marketData     map[string]models.CryptoData
	coinDetails    map[string]models.CoinDetails
	historicalData map[string]models.HistoricalData
	globalData     *models.GlobalMarketData
	mu             sync.RWMutex
}

// NewCryptoRepository cria uma nova instância do repositório em memória
func NewCryptoRepository() *CryptoRepository {
	return &CryptoRepository{
		marketData:     make(map[string]models.CryptoData),
		coinDetails:    make(map[string]models.CoinDetails),
		historicalData: make(map[string]models.HistoricalData),
		globalData:     nil,
	}
}

// GetMarketData obtém dados de mercado de criptomoedas
func (r *CryptoRepository) GetMarketData(currency string, limit int, page int, ids []string) ([]models.CryptoData, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if len(r.marketData) == 0 {
		return nil, errors.New("nenhum dado de mercado disponível")
	}

	var data []models.CryptoData

	// Se ids não for nil, filtrar por ids
	if ids != nil && len(ids) > 0 {
		for _, id := range ids {
			if crypto, ok := r.marketData[id]; ok {
				data = append(data, crypto)
			}
		}
	} else {
		// Se não, retornar todos os dados
		for _, crypto := range r.marketData {
			data = append(data, crypto)
		}
	}

	// Ordenar por capitalização de mercado (ranking)
	sort.Slice(data, func(i, j int) bool {
		return data[i].MarketCapRank < data[j].MarketCapRank
	})

	// Aplicar paginação
	if limit <= 0 {
		limit = 100
	}
	if page <= 0 {
		page = 1
	}

	start := (page - 1) * limit
	end := start + limit

	if start >= len(data) {
		return []models.CryptoData{}, nil
	}
	if end > len(data) {
		end = len(data)
	}

	return data[start:end], nil
}

// GetCoinDetails obtém detalhes de uma criptomoeda específica
func (r *CryptoRepository) GetCoinDetails(id string) (*models.CoinDetails, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	details, ok := r.coinDetails[id]
	if !ok {
		return nil, errors.New("detalhes da moeda não encontrados")
	}

	// Verificar se os dados são recentes (menos de 1 hora)
	if time.Since(details.LastUpdated) > 1*time.Hour {
		return nil, errors.New("detalhes da moeda estão desatualizados")
	}

	return &details, nil
}

// GetHistoricalData obtém dados históricos de preço para uma criptomoeda
func (r *CryptoRepository) GetHistoricalData(id, currency string, days int) (*models.HistoricalData, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	data, ok := r.historicalData[id]
	if !ok {
		return nil, errors.New("dados históricos não encontrados")
	}

	// Em uma implementação real, aplicaríamos um filtro por moeda e período

	return &data, nil
}

// GetGlobalMarketData obtém dados globais do mercado de criptomoedas
func (r *CryptoRepository) GetGlobalMarketData() (*models.GlobalMarketData, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if r.globalData == nil {
		return nil, errors.New("dados globais não encontrados")
	}

	// Verificar se os dados são recentes (menos de 1 hora)
	if time.Since(r.globalData.UpdatedAt) > 1*time.Hour {
		return nil, errors.New("dados globais estão desatualizados")
	}

	return r.globalData, nil
}

// SaveMarketData salva dados de mercado de criptomoedas
func (r *CryptoRepository) SaveMarketData(data []models.CryptoData) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, crypto := range data {
		// Se já existir um registro para este ID, verificar qual é mais recente
		if existing, ok := r.marketData[crypto.ID]; ok {
			if crypto.LastUpdated.After(existing.LastUpdated) {
				r.marketData[crypto.ID] = crypto
			}
		} else {
			// Se não existir, adicionar
			r.marketData[crypto.ID] = crypto
		}
	}

	return nil
}

// SaveCoinDetails salva detalhes de uma criptomoeda
func (r *CryptoRepository) SaveCoinDetails(data *models.CoinDetails) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Se já existir um registro para este ID, verificar qual é mais recente
	if existing, ok := r.coinDetails[data.ID]; ok {
		if data.LastUpdated.After(existing.LastUpdated) {
			r.coinDetails[data.ID] = *data
		}
	} else {
		// Se não existir, adicionar
		r.coinDetails[data.ID] = *data
	}

	return nil
}

// SaveHistoricalData salva dados históricos de preço
func (r *CryptoRepository) SaveHistoricalData(data *models.HistoricalData) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.historicalData[data.ID] = *data

	return nil
}

// SaveGlobalMarketData salva dados globais do mercado
func (r *CryptoRepository) SaveGlobalMarketData(data *models.GlobalMarketData) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Verificar se já existe um registro e se o novo é mais recente
	if r.globalData != nil && data.UpdatedAt.Before(r.globalData.UpdatedAt) {
		return nil
	}

	r.globalData = data

	return nil
} 