package models

import (
	"time"
)

// Portfolio representa um portfólio de criptomoedas
type Portfolio struct {
	ID          string    `json:"id"`
	UserID      string    `json:"userId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Assets      []Asset   `json:"assets"`
}

// Asset representa um ativo no portfólio
type Asset struct {
	ID            string    `json:"id"`
	PortfolioID   string    `json:"portfolioId"`
	Symbol        string    `json:"symbol"`
	Amount        float64   `json:"amount"`
	PurchasePrice float64   `json:"purchasePrice"`
	PurchaseDate  time.Time `json:"purchaseDate"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// PortfolioStats representa estatísticas do portfólio
type PortfolioStats struct {
	TotalValue       float64   `json:"totalValue"`
	TotalProfit      float64   `json:"totalProfit"`
	ProfitPercentage float64   `json:"profitPercentage"`
	AssetCount       int       `json:"assetCount"`
	LastUpdated      time.Time `json:"lastUpdated"`
}

// PortfolioForecast representa previsões para o portfólio
type PortfolioForecast struct {
	PortfolioID    string    `json:"portfolioId"`
	PredictedValue float64   `json:"predictedValue"`
	Confidence     float64   `json:"confidence"`
	TimeFrame      string    `json:"timeFrame"`
	GeneratedAt    time.Time `json:"generatedAt"`
}

// TransactionSimulation representa uma simulação de transação
type TransactionSimulation struct {
	PortfolioID     string  `json:"portfolioId"`
	Symbol          string  `json:"symbol"`
	Amount          float64 `json:"amount"`
	Price           float64 `json:"price"`
	Type            string  `json:"type"` // "buy" ou "sell"
	SimulatedValue  float64 `json:"simulatedValue"`
	SimulatedProfit float64 `json:"simulatedProfit"`
}
