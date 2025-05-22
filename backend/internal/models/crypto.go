package models

import (
	"time"
)

// CryptoData representa os dados básicos de uma criptomoeda
type CryptoData struct {
	ID                           string    `json:"id"`
	Symbol                       string    `json:"symbol"`
	Name                         string    `json:"name"`
	Image                        string    `json:"image,omitempty"`
	CurrentPrice                 float64   `json:"current_price"`
	MarketCap                    float64   `json:"market_cap"`
	MarketCapRank                int       `json:"market_cap_rank"`
	TotalVolume                  float64   `json:"total_volume"`
	High24h                      float64   `json:"high_24h,omitempty"`
	Low24h                       float64   `json:"low_24h,omitempty"`
	PriceChange24h               float64   `json:"price_change_24h,omitempty"`
	PriceChangePercentage24h     float64   `json:"price_change_percentage_24h,omitempty"`
	MarketCapChange24h           float64   `json:"market_cap_change_24h,omitempty"`
	MarketCapChangePercentage24h float64   `json:"market_cap_change_percentage_24h,omitempty"`
	CirculatingSupply            float64   `json:"circulating_supply,omitempty"`
	TotalSupply                  float64   `json:"total_supply,omitempty"`
	MaxSupply                    float64   `json:"max_supply,omitempty"`
	ATH                          float64   `json:"ath,omitempty"`
	ATHChangePercentage          float64   `json:"ath_change_percentage,omitempty"`
	ATHDate                      time.Time `json:"ath_date,omitempty"`
	ATL                          float64   `json:"atl,omitempty"`
	ATLChangePercentage          float64   `json:"atl_change_percentage,omitempty"`
	ATLDate                      time.Time `json:"atl_date,omitempty"`
	LastUpdated                  time.Time `json:"last_updated,omitempty"`
	Source                       string    `json:"source"` // origem dos dados: "coingecko", "coinmarketcap", etc.
}

// CoinDetails representa detalhes completos de uma criptomoeda
type CoinDetails struct {
	ID          string    `json:"id"`
	Symbol      string    `json:"symbol"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	MarketData  MarketData `json:"market_data"`
	Links       Links     `json:"links,omitempty"`
	Categories  []string  `json:"categories,omitempty"`
	LastUpdated time.Time `json:"last_updated"`
	Source      string    `json:"source"` // origem dos dados
}

// MarketData contém dados de mercado para uma criptomoeda
type MarketData struct {
	CurrentPrice            map[string]float64 `json:"current_price"`
	MarketCap               map[string]float64 `json:"market_cap"`
	TotalVolume             map[string]float64 `json:"total_volume"`
	High24h                 map[string]float64 `json:"high_24h,omitempty"`
	Low24h                  map[string]float64 `json:"low_24h,omitempty"`
	PriceChange24h          float64            `json:"price_change_24h"`
	PriceChangePercentage24h float64           `json:"price_change_percentage_24h"`
	PriceChangePercentage7d  float64           `json:"price_change_percentage_7d,omitempty"`
	PriceChangePercentage30d float64           `json:"price_change_percentage_30d,omitempty"`
	MarketCapChange24h      float64            `json:"market_cap_change_24h,omitempty"`
	MarketCapChangePercentage24h float64       `json:"market_cap_change_percentage_24h,omitempty"`
	CirculatingSupply       float64            `json:"circulating_supply"`
	TotalSupply             float64            `json:"total_supply,omitempty"`
	MaxSupply               float64            `json:"max_supply,omitempty"`
}

// Links contém links relacionados à criptomoeda
type Links struct {
	Homepage      []string `json:"homepage,omitempty"`
	BlockchainSite []string `json:"blockchain_site,omitempty"`
	Forum         []string `json:"official_forum_url,omitempty"`
	Chat          []string `json:"chat_url,omitempty"`
	Announcement  []string `json:"announcement_url,omitempty"`
	Twitter       string   `json:"twitter_screen_name,omitempty"`
	Facebook      string   `json:"facebook_username,omitempty"`
	Telegram      string   `json:"telegram_channel_identifier,omitempty"`
	Reddit        string   `json:"subreddit_url,omitempty"`
	Github        []string `json:"github,omitempty"`
}

// HistoricalData representa dados históricos de preço para uma criptomoeda
type HistoricalData struct {
	ID      string           `json:"id"`
	Symbol  string           `json:"symbol"`
	Prices  [][2]float64     `json:"prices"`      // [timestamp, price]
	MarketCaps [][2]float64  `json:"market_caps"` // [timestamp, market_cap]
	Volumes [][2]float64     `json:"total_volumes"` // [timestamp, volume]
	Source  string           `json:"source"`      // origem dos dados
}

// GlobalMarketData representa dados globais do mercado de criptomoedas
type GlobalMarketData struct {
	ActiveCryptocurrencies    int                 `json:"active_cryptocurrencies"`
	UpcomingICOs              int                 `json:"upcoming_icos"`
	OngoingICOs               int                 `json:"ongoing_icos"`
	EndedICOs                 int                 `json:"ended_icos"`
	Markets                   int                 `json:"markets"`
	TotalMarketCap            map[string]float64  `json:"total_market_cap"`
	TotalVolume               map[string]float64  `json:"total_volume"`
	MarketCapPercentage       map[string]float64  `json:"market_cap_percentage"`
	MarketCapChangePercentage24hUSD float64       `json:"market_cap_change_percentage_24h_usd"`
	UpdatedAt                 time.Time           `json:"updated_at"`
	Source                    string              `json:"source"` // origem dos dados
}

// CryptoRepository define a interface para acesso aos dados de criptomoedas
type CryptoRepository interface {
	// Métodos para mercado
	GetMarketData(currency string, limit int, page int, ids []string) ([]CryptoData, error)
	GetCoinDetails(id string) (*CoinDetails, error)
	GetGlobalMarketData() (*GlobalMarketData, error)
	
	// Métodos para dados históricos
	GetHistoricalData(id, currency string, days int) (*HistoricalData, error)
	
	// Métodos para persistência dos dados obtidos por scraping
	SaveMarketData(data []CryptoData) error
	SaveCoinDetails(data *CoinDetails) error
	SaveHistoricalData(data *HistoricalData) error
	SaveGlobalMarketData(data *GlobalMarketData) error
} 