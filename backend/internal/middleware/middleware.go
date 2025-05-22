package middleware

import (
	"log"
	"net/http"
	"time"
)

// Logger é um middleware que regista informações sobre as requisições HTTP
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Criar um wrapper para o ResponseWriter para capturar o status code
		wrapped := wrapResponseWriter(w)
		
		// Chamar o próximo handler na cadeia
		next.ServeHTTP(wrapped, r)
		
		// Calcular o tempo decorrido
		duration := time.Since(start)
		
		// Registar informações da requisição
		log.Printf(
			"%s %s %d %s %s",
			r.Method,
			r.URL.Path,
			wrapped.status,
			duration,
			r.RemoteAddr,
		)
	})
}

// ResponseWriterWrapper é um wrapper para http.ResponseWriter que captura o status code
type responseWriterWrapper struct {
	http.ResponseWriter
	status int
}

// Cria um novo wrapper para o ResponseWriter
func wrapResponseWriter(w http.ResponseWriter) *responseWriterWrapper {
	return &responseWriterWrapper{w, http.StatusOK}
}

// WriteHeader sobrescreve o método WriteHeader para capturar o status code
func (rw *responseWriterWrapper) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

// Timeout é um middleware que adiciona um timeout ao contexto da requisição
func Timeout(timeout time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Criar um canal para sinalizar quando o handler terminou
			done := make(chan struct{})
			
			// Criar um timer para o timeout
			timer := time.NewTimer(timeout)
			
			go func() {
				next.ServeHTTP(w, r)
				done <- struct{}{}
			}()
			
			select {
			case <-done:
				// Handler terminou antes do timeout
				if !timer.Stop() {
					<-timer.C
				}
			case <-timer.C:
				// Timeout atingido
				http.Error(w, "Timeout atingido", http.StatusRequestTimeout)
			}
		})
	}
}

// Recovery é um middleware que recupera de panics e retorna um erro 500
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic: %v", err)
				http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
			}
		}()
		
		next.ServeHTTP(w, r)
	})
}

// ApplyMiddleware aplica todos os middlewares globais à aplicação
func ApplyMiddleware(handler http.Handler) http.Handler {
	// Aplicar middlewares na ordem inversa (o último middleware é o primeiro a ser executado)
	handler = Recovery(handler)
	handler = Timeout(30 * time.Second)(handler)
	handler = Logger(handler)
	
	return handler
} 