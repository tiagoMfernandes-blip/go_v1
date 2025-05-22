package client

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/tiagofernandes/gofolio/internal/models"
)

// CoinMarketCapScraper é um cliente para extrair dados do CoinMarketCap
type CoinMarketCapScraper struct {
	baseURL string
	client  *http.Client
}

// NewCoinMarketCapScraper cria uma nova instância do scraper
func NewCoinMarketCapScraper() *CoinMarketCapScraper {
	return &CoinMarketCapScraper{
		baseURL: "https://coinmarketcap.com",
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetMarketData obtém dados de mercado do CoinMarketCap
func (s *CoinMarketCapScraper) GetMarketData(limit int) ([]models.CryptoData, error) {
	if limit <= 0 {
		limit = 100
	}

	url := fmt.Sprintf("%s/?limit=%d", s.baseURL, limit)
	
	// Fazer requisição HTTP
	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao acessar CoinMarketCap: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code inválido: %d", resp.StatusCode)
	}

	// Carregar o HTML na goquery
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao parsear HTML: %w", err)
	}

	var cryptos []models.CryptoData

	// Extrair dados da tabela
	doc.Find("table tbody tr").Each(func(i int, s *goquery.Selection) {
		if i >= limit {
			return
		}

		crypto := models.CryptoData{
			Source: "coinmarketcap",
		}

		// Extrair ID e símbolo da URL da moeda
		s.Find("td:nth-child(3) a").Each(func(j int, link *goquery.Selection) {
			href, exists := link.Attr("href")
			if exists {
				parts := strings.Split(href, "/")
				if len(parts) >= 3 {
					crypto.ID = parts[2]
				}
			}
			
			// Nome e símbolo
			crypto.Name = strings.TrimSpace(link.Find(".crypto-symbol").Text())
			crypto.Symbol = strings.TrimSpace(link.Find(".coin-item-symbol").Text())
		})

		// Extrair imagem
		s.Find("td:nth-child(3) img").Each(func(j int, img *goquery.Selection) {
			src, exists := img.Attr("src")
			if exists {
				crypto.Image = src
			}
		})

		// Extrair preço atual
		price := s.Find("td:nth-child(4)").Text()
		price = strings.ReplaceAll(price, "$", "")
		price = strings.ReplaceAll(price, ",", "")
		if p, err := strconv.ParseFloat(price, 64); err == nil {
			crypto.CurrentPrice = p
		}

		// Extrair variação de preço em 24h
		change := s.Find("td:nth-child(5)").Text()
		change = strings.ReplaceAll(change, "%", "")
		if c, err := strconv.ParseFloat(change, 64); err == nil {
			crypto.PriceChangePercentage24h = c
		}

		// Extrair capitalização de mercado
		mcap := s.Find("td:nth-child(7)").Text()
		mcap = strings.ReplaceAll(mcap, "$", "")
		mcap = strings.ReplaceAll(mcap, ",", "")
		if m, err := strconv.ParseFloat(mcap, 64); err == nil {
			crypto.MarketCap = m
		}

		// Extrair volume em 24h
		vol := s.Find("td:nth-child(8)").Text()
		vol = strings.ReplaceAll(vol, "$", "")
		vol = strings.ReplaceAll(vol, ",", "")
		if v, err := strconv.ParseFloat(vol, 64); err == nil {
			crypto.TotalVolume = v
		}

		// Extrair ranking
		rank := s.Find("td:nth-child(2)").Text()
		if r, err := strconv.Atoi(rank); err == nil {
			crypto.MarketCapRank = r
		}

		// Adicionar apenas se tiver ID válido
		if crypto.ID != "" {
			cryptos = append(cryptos, crypto)
		}
	})

	if len(cryptos) == 0 {
		return nil, errors.New("nenhum dado de criptomoeda encontrado")
	}

	return cryptos, nil
}

// GetCoinDetails obtém detalhes de uma criptomoeda específica do CoinMarketCap
func (s *CoinMarketCapScraper) GetCoinDetails(id string) (*models.CoinDetails, error) {
	url := fmt.Sprintf("%s/currencies/%s/", s.baseURL, id)
	
	// Fazer requisição HTTP
	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao acessar detalhes da moeda: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code inválido: %d", resp.StatusCode)
	}

	// Carregar o HTML na goquery
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao parsear HTML: %w", err)
	}

	details := &models.CoinDetails{
		ID:     id,
		Source: "coinmarketcap",
		MarketData: models.MarketData{
			CurrentPrice: make(map[string]float64),
			MarketCap:    make(map[string]float64),
			TotalVolume:  make(map[string]float64),
			High24h:      make(map[string]float64),
			Low24h:       make(map[string]float64),
		},
		Links:      models.Links{},
		Categories: []string{},
	}

	// Nome e Símbolo
	details.Name = strings.TrimSpace(doc.Find("h2.sc-1q9q90x-0").First().Text())
	details.Symbol = strings.TrimSpace(doc.Find("small.nameSymbol").First().Text())

	// Imagem
	details.Image, _ = doc.Find("img.coin-logo-sprite").First().Attr("src")

	// Descrição
	details.Description = strings.TrimSpace(doc.Find("div.sc-1lt0cju-0").First().Text())

	// Preço atual
	priceText := doc.Find("div.priceValue").First().Text()
	priceText = strings.ReplaceAll(priceText, "$", "")
	priceText = strings.ReplaceAll(priceText, ",", "")
	if price, err := strconv.ParseFloat(priceText, 64); err == nil {
		details.MarketData.CurrentPrice["usd"] = price
	}

	// Variação de preço em 24h
	changeText := doc.Find("div.sc-16r8icm-0 div.sc-d8e6st-0").First().Text()
	changeText = strings.ReplaceAll(changeText, "%", "")
	if change, err := strconv.ParseFloat(changeText, 64); err == nil {
		details.MarketData.PriceChangePercentage24h = change
	}

	// Capitalização de mercado
	mcapText := doc.Find("div.statsValue").First().Text()
	mcapText = strings.ReplaceAll(mcapText, "$", "")
	mcapText = strings.ReplaceAll(mcapText, ",", "")
	if mcap, err := strconv.ParseFloat(mcapText, 64); err == nil {
		details.MarketData.MarketCap["usd"] = mcap
	}

	// Volume em 24h
	volText := doc.Find("div.statsValue").Eq(1).Text()
	volText = strings.ReplaceAll(volText, "$", "")
	volText = strings.ReplaceAll(volText, ",", "")
	if vol, err := strconv.ParseFloat(volText, 64); err == nil {
		details.MarketData.TotalVolume["usd"] = vol
	}

	// Supply circulante
	supplyText := doc.Find("div.statsValue").Eq(2).Text()
	supplyText = strings.ReplaceAll(supplyText, ",", "")
	if supply, err := strconv.ParseFloat(supplyText, 64); err == nil {
		details.MarketData.CirculatingSupply = supply
	}

	// Links
	details.Links.Homepage = []string{}
	doc.Find("div.sc-19zk94m-5 a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if exists {
			if strings.Contains(s.Text(), "Website") {
				details.Links.Homepage = append(details.Links.Homepage, href)
			} else if strings.Contains(s.Text(), "Explorer") {
				details.Links.BlockchainSite = append(details.Links.BlockchainSite, href)
			} else if strings.Contains(s.Text(), "Forum") {
				details.Links.Forum = append(details.Links.Forum, href)
			} else if strings.Contains(s.Text(), "Reddit") {
				details.Links.Reddit = href
			} else if strings.Contains(s.Text(), "Twitter") {
				details.Links.Twitter = strings.TrimPrefix(href, "https://twitter.com/")
			} else if strings.Contains(s.Text(), "Facebook") {
				details.Links.Facebook = strings.TrimPrefix(href, "https://facebook.com/")
			} else if strings.Contains(s.Text(), "Github") {
				details.Links.Github = append(details.Links.Github, href)
			}
		}
	})

	// Categorias
	doc.Find("div.sc-12irlp3-0 div.tagBadge").Each(func(i int, s *goquery.Selection) {
		category := strings.TrimSpace(s.Text())
		if category != "" {
			details.Categories = append(details.Categories, category)
		}
	})

	details.LastUpdated = time.Now()

	return details, nil
}

// GetGlobalMarketData obtém dados globais do mercado de criptomoedas do CoinMarketCap
func (s *CoinMarketCapScraper) GetGlobalMarketData() (*models.GlobalMarketData, error) {
	url := s.baseURL
	
	// Fazer requisição HTTP
	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao acessar dados globais: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code inválido: %d", resp.StatusCode)
	}

	// Carregar o HTML na goquery
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao parsear HTML: %w", err)
	}

	globalData := &models.GlobalMarketData{
		Source:          "coinmarketcap",
		TotalMarketCap:  make(map[string]float64),
		TotalVolume:     make(map[string]float64),
		MarketCapPercentage: make(map[string]float64),
		UpdatedAt:       time.Now(),
	}

	// Extrair estatísticas globais
	statsText := doc.Find("div.cmc-global-stats__inner-content").Text()
	
	// Extrair número de criptomoedas ativas
	if activeMatch := strings.Split(statsText, "Cryptos:"); len(activeMatch) > 1 {
		activePart := strings.Split(activeMatch[1], " ")[0]
		activePart = strings.ReplaceAll(activePart, ",", "")
		if active, err := strconv.Atoi(activePart); err == nil {
			globalData.ActiveCryptocurrencies = active
		}
	}

	// Extrair número de exchanges
	if exchMatch := strings.Split(statsText, "Exchanges:"); len(exchMatch) > 1 {
		exchPart := strings.Split(exchMatch[1], " ")[0]
		exchPart = strings.ReplaceAll(exchPart, ",", "")
		if exch, err := strconv.Atoi(exchPart); err == nil {
			globalData.Markets = exch
		}
	}

	// Extrair capitalização total de mercado
	if mcapMatch := strings.Split(statsText, "Market Cap:"); len(mcapMatch) > 1 {
		mcapPart := strings.Split(mcapMatch[1], " ")[0]
		mcapPart = strings.ReplaceAll(mcapPart, "$", "")
		mcapPart = strings.ReplaceAll(mcapPart, "T", "")
		if mcap, err := strconv.ParseFloat(mcapPart, 64); err == nil {
			// Converter de trilhões para valor absoluto
			globalData.TotalMarketCap["usd"] = mcap * 1000000000000
		}
	}

	// Extrair volume total em 24h
	if volMatch := strings.Split(statsText, "24h Vol:"); len(volMatch) > 1 {
		volPart := strings.Split(volMatch[1], " ")[0]
		volPart = strings.ReplaceAll(volPart, "$", "")
		volPart = strings.ReplaceAll(volPart, "B", "")
		if vol, err := strconv.ParseFloat(volPart, 64); err == nil {
			// Converter de bilhões para valor absoluto
			globalData.TotalVolume["usd"] = vol * 1000000000
		}
	}

	// Extrair dominância BTC
	if btcMatch := strings.Split(statsText, "Dominance: BTC:"); len(btcMatch) > 1 {
		btcPart := strings.Split(btcMatch[1], "%")[0]
		if btc, err := strconv.ParseFloat(btcPart, 64); err == nil {
			globalData.MarketCapPercentage["btc"] = btc
		}
	}

	// Extrair dominância ETH
	if ethMatch := strings.Split(statsText, "ETH:"); len(ethMatch) > 1 {
		ethPart := strings.Split(ethMatch[1], "%")[0]
		if eth, err := strconv.ParseFloat(ethPart, 64); err == nil {
			globalData.MarketCapPercentage["eth"] = eth
		}
	}

	return globalData, nil
}

// GetHistoricalData obtém dados históricos de preço do CoinMarketCap
// Nota: O CoinMarketCap não fornece dados históricos facilmente via scraping
// Esta é uma implementação simplificada que retorna dados limitados
func (s *CoinMarketCapScraper) GetHistoricalData(id, currency string, days int) (*models.HistoricalData, error) {
	// Para dados históricos reais, seria necessário usar a API oficial do CoinMarketCap
	// ou outra fonte como o CoinGecko
	log.Println("Aviso: Dados históricos via scraping do CoinMarketCap são limitados")
	
	// Retornar estrutura básica com dados simulados
	historicalData := &models.HistoricalData{
		ID:     id,
		Source: "coinmarketcap",
		Prices: make([][2]float64, 0),
	}
	
	// Tentar obter pelo menos o preço atual
	details, err := s.GetCoinDetails(id)
	if err == nil {
		// Usar o preço atual como referência
		now := float64(time.Now().Unix() * 1000) // Timestamp em milissegundos
		price := details.MarketData.CurrentPrice["usd"]
		
		// Adicionar o preço atual
		historicalData.Prices = append(historicalData.Prices, [2]float64{now, price})
		historicalData.Symbol = details.Symbol
	}
	
	return historicalData, nil
} 