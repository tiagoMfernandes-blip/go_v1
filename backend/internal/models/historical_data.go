package models

import (
	"database/sql"
	"time"
)

// HistoricalData representa dados históricos de preço de um ativo
type HistoricalData struct {
	ID          int64     `json:"id" db:"id"`
	Symbol      string    `json:"symbol" db:"symbol"`
	Price       float64   `json:"price" db:"price"`
	Volume      float64   `json:"volume" db:"volume"`
	MarketCap   float64   `json:"market_cap" db:"market_cap"`
	Timestamp   time.Time `json:"timestamp" db:"timestamp"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// HistoricalDataRepository interface para persistência de dados históricos
type HistoricalDataRepository interface {
	SaveHistoricalData(data []HistoricalData) error
	GetHistoricalData(symbol string, from, to time.Time) ([]HistoricalData, error)
	GetSymbolData(symbol string, limit int) ([]HistoricalData, error)
	DeleteOldData(before time.Time) error
}

// PostgresHistoricalDataRepository implementação do repositório para PostgreSQL
type PostgresHistoricalDataRepository struct {
	db *sql.DB
}

// NewPostgresHistoricalDataRepository cria um novo repositório PostgreSQL
func NewPostgresHistoricalDataRepository(db *sql.DB) *PostgresHistoricalDataRepository {
	return &PostgresHistoricalDataRepository{db: db}
}

// SaveHistoricalData salva dados históricos no PostgreSQL
func (r *PostgresHistoricalDataRepository) SaveHistoricalData(data []HistoricalData) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO historical_data (symbol, price, volume, market_cap, timestamp, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, d := range data {
		_, err = stmt.Exec(
			d.Symbol,
			d.Price,
			d.Volume,
			d.MarketCap,
			d.Timestamp,
			time.Now(),
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetHistoricalData obtém dados históricos para um intervalo de tempo
func (r *PostgresHistoricalDataRepository) GetHistoricalData(symbol string, from, to time.Time) ([]HistoricalData, error) {
	query := `
		SELECT id, symbol, price, volume, market_cap, timestamp, created_at
		FROM historical_data
		WHERE symbol = $1 AND timestamp BETWEEN $2 AND $3
		ORDER BY timestamp ASC
	`

	rows, err := r.db.Query(query, symbol, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []HistoricalData
	for rows.Next() {
		var d HistoricalData
		err := rows.Scan(
			&d.ID,
			&d.Symbol,
			&d.Price,
			&d.Volume,
			&d.MarketCap,
			&d.Timestamp,
			&d.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, d)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// GetSymbolData obtém os dados mais recentes para um símbolo, limitado por quantidade
func (r *PostgresHistoricalDataRepository) GetSymbolData(symbol string, limit int) ([]HistoricalData, error) {
	query := `
		SELECT id, symbol, price, volume, market_cap, timestamp, created_at
		FROM historical_data
		WHERE symbol = $1
		ORDER BY timestamp DESC
		LIMIT $2
	`

	rows, err := r.db.Query(query, symbol, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []HistoricalData
	for rows.Next() {
		var d HistoricalData
		err := rows.Scan(
			&d.ID,
			&d.Symbol,
			&d.Price,
			&d.Volume,
			&d.MarketCap,
			&d.Timestamp,
			&d.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, d)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Inverter a ordem para ficar em ordem cronológica
	for i, j := 0, len(result)-1; i < j; i, j = i+1, j-1 {
		result[i], result[j] = result[j], result[i]
	}

	return result, nil
}

// DeleteOldData remove dados históricos mais antigos que a data especificada
func (r *PostgresHistoricalDataRepository) DeleteOldData(before time.Time) error {
	query := `DELETE FROM historical_data WHERE timestamp < $1`
	_, err := r.db.Exec(query, before)
	return err
}

// Esquema SQL para criação da tabela
const HistoricalDataSchema = `
CREATE TABLE IF NOT EXISTS historical_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    volume NUMERIC(30, 2),
    market_cap NUMERIC(30, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    
    -- Índices para melhorar a performance de consultas
    INDEX idx_historical_data_symbol (symbol),
    INDEX idx_historical_data_timestamp (timestamp),
    INDEX idx_historical_data_symbol_timestamp (symbol, timestamp)
);
` 