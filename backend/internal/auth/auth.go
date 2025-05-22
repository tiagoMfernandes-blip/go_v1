package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Constantes
const (
	secretKey = "seu-segredo-muito-seguro" // Em produção, deve vir de variável de ambiente
	tokenExpiration = 24 * time.Hour
	userContextKey = "user"
)

// Estruturas de dados
type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"-"` // não será exibido nas respostas JSON
	Preferences struct {
		Theme    string `json:"theme"`
		Language string `json:"language"`
	} `json:"preferences"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// Claims personalizado para o JWT
type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// LoginHandler processa requisições de login
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Formato de requisição inválido", http.StatusBadRequest)
		return
	}

	// Validação básica
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email e senha são obrigatórios", http.StatusBadRequest)
		return
	}

	// Em uma implementação real, buscaríamos no banco de dados
	// e verificaríamos a senha com bcrypt
	
	// Simulação de autenticação para desenvolvimento
	if req.Email != "user@example.com" || req.Password != "password" {
		http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Criar um usuário de teste
	user := User{
		ID:    "1234",
		Email: req.Email,
	}
	user.Preferences.Theme = "light"
	user.Preferences.Language = "pt"

	// Gerar token JWT
	token, err := generateToken(user.ID)
	if err != nil {
		http.Error(w, "Erro ao gerar token", http.StatusInternalServerError)
		return
	}

	// Preparar resposta
	response := AuthResponse{
		Token: token,
		User:  user,
	}

	// Enviar resposta
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// RegisterHandler processa requisições de registro
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Formato de requisição inválido", http.StatusBadRequest)
		return
	}

	// Validações
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email e senha são obrigatórios", http.StatusBadRequest)
		return
	}

	if req.Password != req.ConfirmPassword {
		http.Error(w, "As senhas não coincidem", http.StatusBadRequest)
		return
	}

	// Em uma implementação real, verificaríamos se o email já existe
	// e salvaríamos o novo usuário no banco de dados com senha hashada

	// Criar um ID único para o usuário (simulado)
	userID := fmt.Sprintf("user_%d", time.Now().Unix())

	// Criar um usuário
	user := User{
		ID:    userID,
		Email: req.Email,
	}
	user.Preferences.Theme = "light"
	user.Preferences.Language = "pt"

	// Gerar token JWT
	token, err := generateToken(user.ID)
	if err != nil {
		http.Error(w, "Erro ao gerar token", http.StatusInternalServerError)
		return
	}

	// Preparar resposta
	response := AuthResponse{
		Token: token,
		User:  user,
	}

	// Enviar resposta
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// JWTMiddleware verifica se o token JWT é válido
func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extrair o token do cabeçalho Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Autorização necessária", http.StatusUnauthorized)
			return
		}

		// Verificar o formato do cabeçalho
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Formato de autorização inválido", http.StatusUnauthorized)
			return
		}

		// Validar o token
		userID, err := validateToken(parts[1])
		if err != nil {
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		// Em uma implementação real, buscaríamos o usuário no banco de dados
		user := User{
			ID:    userID,
			Email: "user@example.com", // simulado
		}
		user.Preferences.Theme = "light"
		user.Preferences.Language = "pt"

		// Adicionar o usuário ao contexto da requisição
		ctx := context.WithValue(r.Context(), userContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserFromContext retorna o usuário do contexto
func GetUserFromContext(ctx context.Context) (User, error) {
	user, ok := ctx.Value(userContextKey).(User)
	if !ok {
		return User{}, errors.New("usuário não encontrado no contexto")
	}
	return user, nil
}

// Funções auxiliares para geração e validação de tokens

func generateToken(userID string) (string, error) {
	expirationTime := time.Now().Add(tokenExpiration)
	
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "gofolio-api",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secretKey))
	
	return tokenString, err
}

func validateToken(tokenString string) (string, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", errors.New("token inválido")
	}

	return claims.UserID, nil
} 