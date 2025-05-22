package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/tiagofernandes/gofolio/internal/auth"
)

// NewRouter retorna um novo router configurado com as rotas da API
func NewRouter() *mux.Router {
	r := mux.NewRouter()

	// Middleware de CORS
	r.Use(corsMiddleware)

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Rotas públicas
	api.HandleFunc("/health", healthCheckHandler).Methods("GET")
	api.HandleFunc("/auth/login", auth.LoginHandler).Methods("POST")
	api.HandleFunc("/auth/register", auth.RegisterHandler).Methods("POST")

	// Rotas protegidas
	protected := api.PathPrefix("").Subrouter()
	protected.Use(auth.JWTMiddleware)

	// Rotas de portfólio
	protected.HandleFunc("/portfolio", getPortfolioHandler).Methods("GET")
	protected.HandleFunc("/portfolio/assets", getAssetsHandler).Methods("GET")
	
	// Rotas de análise técnica
	protected.HandleFunc("/technical/{symbol}", getTechnicalDataHandler).Methods("GET")
	
	// Rotas de análise sentimental
	protected.HandleFunc("/sentiment", getSentimentDataHandler).Methods("GET")
	protected.HandleFunc("/sentiment/{symbol}", getSentimentBySymbolHandler).Methods("GET")

	return r
}

// Middleware para configurar CORS
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Handler para verificar a saúde da API
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "ok",
		"message": "API funcionando normalmente",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// Handlers para as rotas protegidas (implementação básica)
func getPortfolioHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder - seria implementado com acesso a banco de dados
	portfolio := map[string]interface{}{
		"totalBalance": 24560.45,
		"performance": map[string]float64{
			"day": 2.3,
			"week": -1.5,
			"month": 5.7,
			"year": 22.4,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(portfolio)
}

func getAssetsHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder - seria implementado com acesso a carteira e APIs de mercado
	assets := []map[string]interface{}{
		{
			"symbol": "BTC",
			"name": "Bitcoin",
			"balance": 0.5,
			"price": 35000,
			"change24h": 2.3,
		},
		{
			"symbol": "ETH",
			"name": "Ethereum",
			"balance": 5.2,
			"price": 2000,
			"change24h": -1.1,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assets)
}

func getTechnicalDataHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	// Placeholder - seria implementado com acesso a API de dados técnicos
	technicalData := map[string]interface{}{
		"symbol": symbol,
		"indicators": map[string]float64{
			"rsi": 65.4,
			"macd": 1.2,
			"volume": 45000000,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(technicalData)
}

func getSentimentDataHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder - seria implementado com acesso a dados de sentimento
	sentimentData := []map[string]interface{}{
		{
			"symbol": "BTC",
			"score": 0.72,
			"source": "X posts",
			"timestamp": "2023-05-21T10:00:00Z",
		},
		{
			"symbol": "ETH",
			"score": 0.68,
			"source": "X posts",
			"timestamp": "2023-05-21T10:00:00Z",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sentimentData)
}

func getSentimentBySymbolHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	// Placeholder - seria implementado com acesso a dados de sentimento
	sentiment := map[string]interface{}{
		"symbol": symbol,
		"score": 0.72,
		"source": "X posts",
		"timestamp": "2023-05-21T10:00:00Z",
		"details": map[string]interface{}{
			"positiveCount": 872,
			"negativeCount": 368,
			"neutralCount": 210,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sentiment)
} 