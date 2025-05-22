import { CoinDetails } from '../models/CryptoData';

// Detalhes mockados para Bitcoin como exemplo padrão
export const mockCoinDetails: CoinDetails = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  description: {
    en: 'Bitcoin is the first successful internet money based on peer-to-peer technology; whereby no central bank or authority is involved in the transaction and production of the Bitcoin currency. It was created by an anonymous individual/group under the name, Satoshi Nakamoto. The source code is available publicly as an open source project, anybody can look at it and be part of the developmental process.'
  },
  image: {
    thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
    small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  market_data: {
    current_price: {
      eur: 55204.68,
      usd: 57850.42,
      btc: 1,
      eth: 17.82
    },
    market_cap: {
      eur: 1084567890123,
      usd: 1135487261642,
      btc: 19345678,
      eth: 345678901
    },
    total_volume: {
      eur: 33234567890,
      usd: 34958734983,
      btc: 600000,
      eth: 10678901
    },
    high_24h: {
      eur: 56123.45,
      usd: 58765.43,
      btc: 1,
      eth: 18.1
    },
    low_24h: {
      eur: 54321.98,
      usd: 56789.12,
      btc: 1,
      eth: 17.5
    },
    price_change_24h: 1345.67,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.4,
    price_change_percentage_30d: 12.7,
    market_cap_change_24h: 23456789012,
    market_cap_change_percentage_24h: 2.2,
    circulating_supply: 19386862,
    total_supply: 21000000,
    max_supply: 21000000
  },
  community_data: {
    twitter_followers: 5678901,
    reddit_subscribers: 4567890
  },
  developer_data: {
    forks: 34567,
    stars: 67890,
    subscribers: 12345,
    total_issues: 5678,
    closed_issues: 4567
  },
  links: {
    homepage: ['https://bitcoin.org'],
    blockchain_site: [
      'https://blockchair.com/bitcoin',
      'https://btc.com',
      'https://btc.tokenview.io'
    ],
    official_forum_url: ['https://bitcointalk.org'],
    chat_url: [],
    announcement_url: [],
    twitter_screen_name: 'bitcoin',
    facebook_username: 'bitcoins',
    telegram_channel_identifier: '',
    subreddit_url: 'https://reddit.com/r/Bitcoin',
    repos_url: {
      github: ['https://github.com/bitcoin/bitcoin'],
      bitbucket: []
    }
  },
  categories: ['Cryptocurrency', 'Layer 1 (L1)'],
  last_updated: '2023-07-23T12:30:45Z'
};

// Alias para coinDetails (mantido para compatibilidade)
export const coinDetails = mockCoinDetails;

// Função para gerar detalhes de moeda para outros tokens que não temos dados simulados específicos
export const generateMockCoinDetails = (
  id: string,
  symbol: string,
  name: string,
  currentPrice: number
): any => {
  return {
    id: id,
    symbol: symbol,
    name: name,
    description: {
      en: `${name} (${symbol.toUpperCase()}) é uma criptomoeda que utiliza tecnologia blockchain para fornecer serviços financeiros descentralizados.`
    },
    image: {
      thumb: `https://via.placeholder.com/32x32?text=${symbol.toUpperCase()}`,
      small: `https://via.placeholder.com/64x64?text=${symbol.toUpperCase()}`,
      large: `https://via.placeholder.com/128x128?text=${symbol.toUpperCase()}`
    },
    market_data: {
      current_price: {
        eur: currentPrice,
        usd: currentPrice * 1.09
      },
      market_cap: {
        eur: currentPrice * 20000000,
        usd: currentPrice * 21800000
      },
      total_volume: {
        eur: currentPrice * 1000000,
        usd: currentPrice * 1090000
      },
      high_24h: {
        eur: currentPrice * 1.05,
        usd: currentPrice * 1.14
      },
      low_24h: {
        eur: currentPrice * 0.95,
        usd: currentPrice * 1.03
      },
      price_change_percentage_24h: (Math.random() * 10) - 5,
      price_change_percentage_7d: (Math.random() * 20) - 10,
      price_change_percentage_30d: (Math.random() * 40) - 20,
      price_change_percentage_1y: (Math.random() * 100) - 20,
      market_cap_rank: Math.floor(Math.random() * 100) + 1,
      circulating_supply: Math.floor(Math.random() * 1000000000) + 1000000
    },
    community_data: {
      twitter_followers: Math.floor(Math.random() * 1000000) + 10000,
      reddit_subscribers: Math.floor(Math.random() * 500000) + 5000
    }
  };
}; 