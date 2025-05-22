package handlers

import (
	"encoding/json"
	"net/http"

	"gofolio/backend/internal/services"
)

// PortfolioHandler gerencia as requisições HTTP relacionadas ao portfólio
type PortfolioHandler struct {
	portfolioService *services.PortfolioService
}

// NewPortfolioHandler cria uma nova instância do handler de portfólio
func NewPortfolioHandler(portfolioService *services.PortfolioService) *PortfolioHandler {
	return &PortfolioHandler{
		portfolioService: portfolioService,
	}
}

// CreatePortfolio cria um novo portfólio
func (h *PortfolioHandler) CreatePortfolio(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Obter userID do contexto de autenticação
	userID := "user123" // Temporário

	portfolio, err := h.portfolioService.CreatePortfolio(userID, request.Name, request.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(portfolio)
}

// GetPortfolio retorna um portfólio específico
func (h *PortfolioHandler) GetPortfolio(w http.ResponseWriter, r *http.Request) {
	portfolioID := r.URL.Query().Get("id")
	if portfolioID == "" {
		http.Error(w, "Portfolio ID is required", http.StatusBadRequest)
		return
	}

	portfolio, err := h.portfolioService.GetPortfolio(portfolioID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(portfolio)
}

// GetPortfolioStats retorna estatísticas do portfólio
func (h *PortfolioHandler) GetPortfolioStats(w http.ResponseWriter, r *http.Request) {
	portfolioID := r.URL.Query().Get("id")
	if portfolioID == "" {
		http.Error(w, "Portfolio ID is required", http.StatusBadRequest)
		return
	}

	stats, err := h.portfolioService.GetPortfolioStats(portfolioID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetPortfolioForecast retorna previsões para o portfólio
func (h *PortfolioHandler) GetPortfolioForecast(w http.ResponseWriter, r *http.Request) {
	portfolioID := r.URL.Query().Get("id")
	timeFrame := r.URL.Query().Get("timeFrame")
	if portfolioID == "" {
		http.Error(w, "Portfolio ID is required", http.StatusBadRequest)
		return
	}

	forecast, err := h.portfolioService.GetPortfolioForecast(portfolioID, timeFrame)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(forecast)
}

// SimulateTransaction simula uma transação no portfólio
func (h *PortfolioHandler) SimulateTransaction(w http.ResponseWriter, r *http.Request) {
	var request struct {
		PortfolioID string  `json:"portfolioId"`
		Symbol      string  `json:"symbol"`
		Amount      float64 `json:"amount"`
		Price       float64 `json:"price"`
		Type        string  `json:"type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	simulation, err := h.portfolioService.SimulateTransaction(
		request.PortfolioID,
		request.Symbol,
		request.Amount,
		request.Price,
		request.Type,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(simulation)
}
