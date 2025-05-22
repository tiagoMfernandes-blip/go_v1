package market

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	marketService "github.com/tiagofernandes/gofolio/internal/services/market"
)

// Handler contém os handlers para as rotas relacionadas a dados de mercado
type Handler struct {
	service *marketService.Service
}

// NewHandler cria uma nova instância do handler de mercado
func NewHandler(service *marketService.Service) *Handler {
	return &Handler{
		service: service,
	}
}

// RegisterRoutes registra as rotas no router
func (h *Handler) RegisterRoutes(r *mux.Router) {
	// Rotas de mercado
	r.HandleFunc("/market", h.GetMarketData).Methods("GET")
	r.HandleFunc("/market/{id}", h.GetCoinDetails).Methods("GET")
	r.HandleFunc("/market/global", h.GetGlobalMarketData).Methods("GET")
	
	// Rota de dados históricos
	r.HandleFunc("/historical/{id}", h.GetHistoricalData).Methods("GET")
}

// GetMarketData retorna dados de mercado de criptomoedas
func (h *Handler) GetMarketData(w http.ResponseWriter, r *http.Request) {
	// Obter parâmetros de consulta
	query := r.URL.Query()
	
	// Parâmetro vs_currency
	currency := query.Get("vs_currency")
	if currency == "" {
		currency = "usd"
	}
	
	// Parâmetro limit
	limit := 100
	if limitStr := query.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	// Parâmetro page
	page := 1
	if pageStr := query.Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	// Parâmetro ids
	var ids []string
	if idsStr := query.Get("ids"); idsStr != "" {
		ids = strings.Split(idsStr, ",")
	}
	
	// Obter dados do serviço
	data, err := h.service.GetMarketData(currency, limit, page, ids)
	if err != nil {
		log.Printf("Erro ao obter dados de mercado: %v\n", err)
		http.Error(w, "Erro ao obter dados de mercado", http.StatusInternalServerError)
		return
	}
	
	// Configurar cabeçalhos
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=300")
	
	// Responder com JSON
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v\n", err)
		http.Error(w, "Erro ao processar resposta", http.StatusInternalServerError)
	}
}

// GetCoinDetails retorna detalhes de uma criptomoeda específica
func (h *Handler) GetCoinDetails(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	vars := mux.Vars(r)
	id := vars["id"]
	
	if id == "" {
		http.Error(w, "ID da moeda é obrigatório", http.StatusBadRequest)
		return
	}
	
	// Obter dados do serviço
	details, err := h.service.GetCoinDetails(id)
	if err != nil {
		log.Printf("Erro ao obter detalhes da moeda %s: %v\n", id, err)
		http.Error(w, "Erro ao obter detalhes da moeda", http.StatusInternalServerError)
		return
	}
	
	// Configurar cabeçalhos
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=600")
	
	// Responder com JSON
	if err := json.NewEncoder(w).Encode(details); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v\n", err)
		http.Error(w, "Erro ao processar resposta", http.StatusInternalServerError)
	}
}

// GetHistoricalData retorna dados históricos de preço para uma criptomoeda
func (h *Handler) GetHistoricalData(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	vars := mux.Vars(r)
	id := vars["id"]
	
	if id == "" {
		http.Error(w, "ID da moeda é obrigatório", http.StatusBadRequest)
		return
	}
	
	// Obter parâmetros de consulta
	query := r.URL.Query()
	
	// Parâmetro vs_currency
	currency := query.Get("vs_currency")
	if currency == "" {
		currency = "usd"
	}
	
	// Parâmetro days
	days := 7
	if daysStr := query.Get("days"); daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
			days = d
		}
	}
	
	// Obter dados do serviço
	historicalData, err := h.service.GetHistoricalData(id, currency, days)
	if err != nil {
		log.Printf("Erro ao obter dados históricos para %s: %v\n", id, err)
		http.Error(w, "Erro ao obter dados históricos", http.StatusInternalServerError)
		return
	}
	
	// Configurar cabeçalhos
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	
	// Responder com JSON
	if err := json.NewEncoder(w).Encode(historicalData); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v\n", err)
		http.Error(w, "Erro ao processar resposta", http.StatusInternalServerError)
	}
}

// GetGlobalMarketData retorna dados globais do mercado de criptomoedas
func (h *Handler) GetGlobalMarketData(w http.ResponseWriter, r *http.Request) {
	// Obter dados do serviço
	globalData, err := h.service.GetGlobalMarketData()
	if err != nil {
		log.Printf("Erro ao obter dados globais: %v\n", err)
		http.Error(w, "Erro ao obter dados globais", http.StatusInternalServerError)
		return
	}
	
	// Configurar cabeçalhos
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=900")
	
	// Responder com JSON
	if err := json.NewEncoder(w).Encode(globalData); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v\n", err)
		http.Error(w, "Erro ao processar resposta", http.StatusInternalServerError)
	}
} 