package scraper

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/tiagofernandes/gofolio/internal/services/scraper"
)

// Handler implementa os endpoints para o serviço de raspagem
type Handler struct {
	service *scraper.ScraperService
}

// NewHandler cria um novo handler para os endpoints de raspagem
func NewHandler(service *scraper.ScraperService) *Handler {
	return &Handler{service: service}
}

// GetMarketDataHandler retorna dados de mercado
func (h *Handler) GetMarketDataHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	data, err := h.service.GetMarketData(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	respondWithJSON(w, http.StatusOK, data)
}

// GetTechnicalAnalysisHandler retorna análise técnica para um ativo específico
func (h *Handler) GetTechnicalAnalysisHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	symbol := vars["symbol"]
	
	if symbol == "" {
		http.Error(w, "Symbol é obrigatório", http.StatusBadRequest)
		return
	}
	
	analysis, err := h.service.GetTechnicalAnalysis(ctx, symbol)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	respondWithJSON(w, http.StatusOK, analysis)
}

// GetSentimentAnalysisHandler retorna análise de sentimento para um ativo específico
func (h *Handler) GetSentimentAnalysisHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	symbol := vars["symbol"]
	
	if symbol == "" {
		http.Error(w, "Symbol é obrigatório", http.StatusBadRequest)
		return
	}
	
	sentiment, err := h.service.GetSentimentAnalysis(ctx, symbol)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	respondWithJSON(w, http.StatusOK, sentiment)
}

// GetHistoricalDataHandler retorna dados históricos para um ativo específico
func (h *Handler) GetHistoricalDataHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	symbol := vars["symbol"]
	
	if symbol == "" {
		http.Error(w, "Symbol é obrigatório", http.StatusBadRequest)
		return
	}
	
	// Obter parâmetros da query
	interval := r.URL.Query().Get("interval")
	if interval == "" {
		interval = "1d"
	}
	
	limitStr := r.URL.Query().Get("limit")
	limit := 30
	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
		if limit <= 0 || limit > 365 {
			limit = 30
		}
	}
	
	data, err := h.service.GetHistoricalData(ctx, symbol, interval, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	respondWithJSON(w, http.StatusOK, data)
}

// GetFearAndGreedIndexHandler retorna o índice de medo e ganância do mercado
func (h *Handler) GetFearAndGreedIndexHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	data, err := h.service.GetFearAndGreedIndex(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	respondWithJSON(w, http.StatusOK, data)
}

// RegisterRoutes registra as rotas para os endpoints de raspagem
func RegisterRoutes(router *mux.Router, service *scraper.ScraperService) {
	handler := NewHandler(service)
	
	// Criar subrouter para os endpoints de dados de mercado
	marketData := router.PathPrefix("/market").Subrouter()
	marketData.HandleFunc("", handler.GetMarketDataHandler).Methods("GET")
	marketData.HandleFunc("/", handler.GetMarketDataHandler).Methods("GET")
	marketData.HandleFunc("/fear-greed", handler.GetFearAndGreedIndexHandler).Methods("GET")
	
	// Criar subrouter para os endpoints de análise técnica
	technical := router.PathPrefix("/technical").Subrouter()
	technical.HandleFunc("/{symbol}", handler.GetTechnicalAnalysisHandler).Methods("GET")
	
	// Criar subrouter para os endpoints de análise de sentimento
	sentiment := router.PathPrefix("/sentiment").Subrouter()
	sentiment.HandleFunc("/{symbol}", handler.GetSentimentAnalysisHandler).Methods("GET")
	
	// Criar subrouter para os endpoints de dados históricos
	historical := router.PathPrefix("/historical").Subrouter()
	historical.HandleFunc("/{symbol}", handler.GetHistoricalDataHandler).Methods("GET")
}

// respondWithJSON envia uma resposta JSON com o status e os dados fornecidos
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
} 