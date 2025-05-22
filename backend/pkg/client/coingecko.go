package client

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/tiagofernandes/gofolio/internal/models"
)

// CoinGeckoScraper é um cliente para extrair dados do CoinGecko
type CoinGeckoScraper struct {
	baseURL string
	client  *http.Client
}

// NewCoinGeckoScraper cria uma nova instância do scraper
func NewCoinGeckoScraper() *CoinGeckoScraper {
	return &CoinGeckoScraper{
		baseURL: "https://www.coingecko.com",
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetMarketData obtém dados de mercado do CoinGecko
func (s *CoinGeckoScraper) GetMarketData(limit int) ([]models.CryptoData, error) {
	if limit <= 0 {
		limit = 100
	}

	url := fmt.Sprintf("%s/en", s.baseURL)
	
	// Fazer requisição HTTP
	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao acessar CoinGecko: %w", err)
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
	doc.Find("table.sort-table tbody tr").Each(func(i int, s *goquery.Selection) {
		if i >= limit {
			return
		}

		crypto := models.CryptoData{
			Source: "coingecko",
		}

		// Extrair ID e nome da URL da moeda
		s.Find("td:nth-child(3) a").Each(func(j int, link *goquery.Selection) {
			href, exists := link.Attr("href")
			if exists {
				parts := strings.Split(href, "/")
				if len(parts) >= 3 {
					crypto.ID = parts[len(parts)-1]
				}
			}
			
			// Nome
			crypto.Name = strings.TrimSpace(link.Find(".tw-hidden").Text())
		})

		// Símbolo
		crypto.Symbol = strings.TrimSpace(s.Find("td:nth-child(3) .d-lg-inline").Text())

		// Extrair imagem
		s.Find("td:nth-child(3) img").Each(func(j int, img *goquery.Selection) {
			src, exists := img.Attr("src")
			if exists {
				crypto.Image = src
			}
		})

		// Extrair preço atual
		price := s.Find("td:nth-child(4) span").Text()
		price = strings.ReplaceAll(price, "$", "")
		price = strings.ReplaceAll(price, ",", "")
		if p, err := strconv.ParseFloat(price, 64); err == nil {
			crypto.CurrentPrice = p
		}

		// Extrair variação de preço em 24h
		change := s.Find("td:nth-child(6) span").Text()
		change = strings.ReplaceAll(change, "%", "")
		if c, err := strconv.ParseFloat(change, 64); err == nil {
			crypto.PriceChangePercentage24h = c
		}

		// Extrair volume em 24h
		vol := s.Find("td:nth-child(8) span").Text()
		vol = strings.ReplaceAll(vol, "$", "")
		vol = strings.ReplaceAll(vol, ",", "")
		if v, err := strconv.ParseFloat(vol, 64); err == nil {
			crypto.TotalVolume = v
		}

		// Extrair capitalização de mercado
		mcap := s.Find("td:nth-child(7) span").Text()
		mcap = strings.ReplaceAll(mcap, "$", "")
		mcap = strings.ReplaceAll(mcap, ",", "")
		if m, err := strconv.ParseFloat(mcap, 64); err == nil {
			crypto.MarketCap = m
		}

		// Extrair ranking
		rank := s.Find("td:nth-child(2)").Text()
		rank = strings.TrimSpace(rank)
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

// GetCoinDetails obtém detalhes de uma criptomoeda específica do CoinGecko
func (s *CoinGeckoScraper) GetCoinDetails(id string) (*models.CoinDetails, error) {
	url := fmt.Sprintf("%s/en/coins/%s", s.baseURL, id)
	
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
		Source: "coingecko",
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
	details.Name = strings.TrimSpace(doc.Find("h1[data-cy='coin-title']").Text())
	details.Symbol = strings.TrimSpace(doc.Find("h1[data-cy='coin-title'] span.tw-ml-2").Text())
	details.Symbol = strings.ToLower(strings.TrimSpace(strings.ReplaceAll(details.Symbol, "(", "")))
	details.Symbol = strings.ToLower(strings.TrimSpace(strings.ReplaceAll(details.Symbol, ")", "")))

	// Imagem
	details.Image, _ = doc.Find("div.tw-flex img").First().Attr("src")

	// Descrição
	details.Description = strings.TrimSpace(doc.Find("div[data-controller='coins-information'] div.tw-prose").Text())

	// Preço atual
	priceText := doc.Find("div[data-target='price.price']").First().Text()
	priceText = strings.ReplaceAll(priceText, "$", "")
	priceText = strings.ReplaceAll(priceText, ",", "")
	if price, err := strconv.ParseFloat(priceText, 64); err == nil {
		details.MarketData.CurrentPrice["usd"] = price
	}

	// Variação de preço em 24h
	doc.Find("div.coin-value-change div.tw-flex").Each(func(i int, s *goquery.Selection) {
		if strings.Contains(s.Text(), "24h") {
			changeText := strings.TrimSpace(s.Find("span").Last().Text())
			changeText = strings.ReplaceAll(changeText, "%", "")
			changeText = strings.ReplaceAll(changeText, "+", "")
			if change, err := strconv.ParseFloat(changeText, 64); err == nil {
				if strings.Contains(s.Text(), "-") {
					change = -change
				}
				details.MarketData.PriceChangePercentage24h = change
			}
		}
	})

	// Dados de mercado
	doc.Find("div.coin-stats-item").Each(func(i int, s *goquery.Selection) {
		label := strings.TrimSpace(s.Find("div.tw-text-gray-500").Text())
		value := strings.TrimSpace(s.Find("div.tw-text-gray-900").Text())
		
		value = strings.ReplaceAll(value, "$", "")
		value = strings.ReplaceAll(value, ",", "")
		
		if strings.Contains(label, "Market Cap") {
			if mcap, err := strconv.ParseFloat(value, 64); err == nil {
				details.MarketData.MarketCap["usd"] = mcap
			}
		} else if strings.Contains(label, "24 Hour Trading Vol") {
			if vol, err := strconv.ParseFloat(value, 64); err == nil {
				details.MarketData.TotalVolume["usd"] = vol
			}
		} else if strings.Contains(label, "Circulating Supply") {
			value = strings.Split(value, " ")[0]
			if supply, err := strconv.ParseFloat(value, 64); err == nil {
				details.MarketData.CirculatingSupply = supply
			}
		} else if strings.Contains(label, "Total Supply") {
			value = strings.Split(value, " ")[0]
			if supply, err := strconv.ParseFloat(value, 64); err == nil {
				details.MarketData.TotalSupply = supply
			}
		} else if strings.Contains(label, "Max Supply") {
			value = strings.Split(value, " ")[0]
			if supply, err := strconv.ParseFloat(value, 64); err == nil {
				details.MarketData.MaxSupply = supply
			}
		}
	})

	// Links
	details.Links.Homepage = []string{}
	doc.Find("div.links a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if exists {
			// Tentar identificar o tipo de link
			if strings.Contains(href, "twitter.com") {
				details.Links.Twitter = strings.TrimPrefix(href, "https://twitter.com/")
			} else if strings.Contains(href, "facebook.com") {
				details.Links.Facebook = strings.TrimPrefix(href, "https://facebook.com/")
			} else if strings.Contains(href, "reddit.com") {
				details.Links.Reddit = href
			} else if strings.Contains(href, "github.com") {
				details.Links.Github = append(details.Links.Github, href)
			} else if strings.Contains(s.Text(), "Website") || strings.Contains(s.Text(), "Site") {
				details.Links.Homepage = append(details.Links.Homepage, href)
			} else if strings.Contains(s.Text(), "Explorer") {
				details.Links.BlockchainSite = append(details.Links.BlockchainSite, href)
			} else if strings.Contains(s.Text(), "Forum") {
				details.Links.Forum = append(details.Links.Forum, href)
			}
		}
	})

	// Categorias
	doc.Find("div.coin-categories a").Each(func(i int, s *goquery.Selection) {
		category := strings.TrimSpace(s.Text())
		if category != "" {
			details.Categories = append(details.Categories, category)
		}
	})

	details.LastUpdated = time.Now()

	return details, nil
}

// GetGlobalMarketData obtém dados globais do mercado de criptomoedas do CoinGecko
func (s *CoinGeckoScraper) GetGlobalMarketData() (*models.GlobalMarketData, error) {
	url := fmt.Sprintf("%s/en/global_charts", s.baseURL)
	
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
		Source:              "coingecko",
		TotalMarketCap:      make(map[string]float64),
		TotalVolume:         make(map[string]float64),
		MarketCapPercentage: make(map[string]float64),
		UpdatedAt:           time.Now(),
	}

	// Extrair capitalização total de mercado
	mcapText := doc.Find("span.global-data-value").First().Text()
	mcapText = strings.ReplaceAll(mcapText, "$", "")
	mcapText = strings.ReplaceAll(mcapText, ",", "")
	if mcap, err := strconv.ParseFloat(mcapText, 64); err == nil {
		globalData.TotalMarketCap["usd"] = mcap
	}

	// Extrair volume total em 24h
	volText := doc.Find("span.global-data-value").Eq(1).Text()
	volText = strings.ReplaceAll(volText, "$", "")
	volText = strings.ReplaceAll(volText, ",", "")
	if vol, err := strconv.ParseFloat(volText, 64); err == nil {
		globalData.TotalVolume["usd"] = vol
	}

	// Extrair número de criptomoedas ativas
	activeText := doc.Find("div.global-stats-item").Eq(0).Find(".value").Text()
	activeText = strings.ReplaceAll(activeText, ",", "")
	if active, err := strconv.Atoi(activeText); err == nil {
		globalData.ActiveCryptocurrencies = active
	}

	// Extrair número de exchanges
	exchText := doc.Find("div.global-stats-item").Eq(1).Find(".value").Text()
	exchText = strings.ReplaceAll(exchText, ",", "")
	if exch, err := strconv.Atoi(exchText); err == nil {
		globalData.Markets = exch
	}

	// Extrair dominância de mercado
	doc.Find("div.dominance-container div.dominance-col").Each(func(i int, s *goquery.Selection) {
		coin := strings.TrimSpace(s.Find(".coin").Text())
		coin = strings.ToLower(coin)
		
		percentage := strings.TrimSpace(s.Find(".dominance-percentage").Text())
		percentage = strings.ReplaceAll(percentage, "%", "")
		
		if p, err := strconv.ParseFloat(percentage, 64); err == nil {
			globalData.MarketCapPercentage[coin] = p
		}
	})

	return globalData, nil
}

// GetHistoricalData obtém dados históricos de preço do CoinGecko
func (s *CoinGeckoScraper) GetHistoricalData(id, currency string, days int) (*models.HistoricalData, error) {
	// Nota: CoinGecko limita o acesso a dados históricos via web scraping
	// Para uma solução mais completa, seria necessário usar a API oficial
	url := fmt.Sprintf("%s/en/coins/%s", s.baseURL, id)
	
	// Fazer requisição HTTP
	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao acessar página da moeda: %w", err)
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

	historicalData := &models.HistoricalData{
		ID:     id,
		Symbol: strings.ToLower(strings.TrimSpace(doc.Find("h1[data-cy='coin-title'] span.tw-ml-2").Text())),
		Source: "coingecko",
		Prices: make([][2]float64, 0),
	}

	// Obter preço atual e usar como único ponto de dados históricos
	priceText := doc.Find("div[data-target='price.price']").First().Text()
	priceText = strings.ReplaceAll(priceText, "$", "")
	priceText = strings.ReplaceAll(priceText, ",", "")
	
	if price, err := strconv.ParseFloat(priceText, 64); err == nil {
		now := float64(time.Now().Unix() * 1000) // Timestamp em milissegundos
		historicalData.Prices = append(historicalData.Prices, [2]float64{now, price})
	}

	// Nota: para dados históricos reais, seria necessário usar a API oficial do CoinGecko
	return historicalData, nil
} 