package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"gofolio/backend/internal/api"
)

func main() {
	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	// Configurar porta
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Criar router
	router := mux.NewRouter()

	// Adicionar middleware para logging
	router.Use(loggingMiddleware)

	// Configurar CORS
	router.Use(corsMiddleware)

	// Configurar rotas da API
	api.SetupRoutes()

	// Rota de saúde
	router.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// Configurar servidor HTTP
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Iniciar o servidor em uma goroutine
	go func() {
		log.Printf("Servidor iniciado na porta %s\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Erro ao iniciar servidor: %v\n", err)
		}
	}()

	// Configurar graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Bloquear até receber sinal
	<-quit
	log.Println("Encerrando servidor...")

	// Criar contexto com timeout para shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Tentar fechar o servidor graciosamente
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Erro durante o encerramento do servidor: %v\n", err)
	}

	log.Println("Servidor encerrado com sucesso")
}

// healthCheckHandler é o handler para verificação de saúde da API
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok","version":"1.0.0"}`))
}

// loggingMiddleware é um middleware para logging de requisições
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Chamar o próximo handler
		next.ServeHTTP(w, r)

		// Registar informações da requisição
		log.Printf(
			"%s %s %s %s",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
			time.Since(start),
		)
	})
}

// corsMiddleware configura CORS para a API
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Configurar cabeçalhos CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Tratar requisições OPTIONS (preflight)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Processar próximo handler
		next.ServeHTTP(w, r)
	})
}
