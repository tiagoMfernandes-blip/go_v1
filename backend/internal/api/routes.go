package api

import (
	"net/http"

	"gofolio/backend/internal/api/handlers"
	"gofolio/backend/internal/services"
)

// SetupRoutes configura todas as rotas da API
func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Inicializar serviços
	portfolioService := services.NewPortfolioService()

	// Inicializar handlers
	portfolioHandler := handlers.NewPortfolioHandler(portfolioService)

	// Rotas do portfólio
	mux.HandleFunc("/api/portfolio", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			portfolioHandler.CreatePortfolio(w, r)
		case http.MethodGet:
			portfolioHandler.GetPortfolio(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/portfolio/stats", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		portfolioHandler.GetPortfolioStats(w, r)
	})

	mux.HandleFunc("/api/portfolio/forecast", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		portfolioHandler.GetPortfolioForecast(w, r)
	})

	mux.HandleFunc("/api/portfolio/simulate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		portfolioHandler.SimulateTransaction(w, r)
	})

	return mux
}
