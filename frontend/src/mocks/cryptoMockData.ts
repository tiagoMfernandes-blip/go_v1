import { CryptoData, CryptoPrice } from '../models/CryptoData';

export const mockCryptoData: CryptoPrice[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 57850.42,
    market_cap: 1135487261642,
    market_cap_rank: 1,
    total_volume: 34958734983,
    price_change_percentage_24h: 2.5,
    market_cap_percentage: 42.5,
    circulating_supply: 19386862,
    total_supply: 21000000,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3245.68,
    market_cap: 389562789123,
    market_cap_rank: 2,
    total_volume: 18234567890,
    price_change_percentage_24h: 1.8,
    market_cap_percentage: 18.2,
    circulating_supply: 120250481,
    total_supply: 120250481,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    current_price: 0.56,
    market_cap: 29834561234,
    market_cap_rank: 7,
    total_volume: 2345678901,
    price_change_percentage_24h: -0.8,
    market_cap_percentage: 1.4,
    circulating_supply: 53456789012,
    total_supply: 100000000000,
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    current_price: 0.43,
    market_cap: 15234567890,
    market_cap_rank: 9,
    total_volume: 567890123,
    price_change_percentage_24h: 1.2,
    market_cap_percentage: 0.9,
    circulating_supply: 35398620,
    total_supply: 45000000000,
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 143.25,
    market_cap: 62345678901,
    market_cap_rank: 5,
    total_volume: 3456789012,
    price_change_percentage_24h: 4.2,
    market_cap_percentage: 2.8,
    circulating_supply: 435678901,
    total_supply: 539450789,
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
  },
  {
    id: 'binance-coin',
    symbol: 'bnb',
    name: 'BNB',
    current_price: 576.34,
    market_cap: 89234567890,
    market_cap_rank: 4,
    total_volume: 2345678901,
    price_change_percentage_24h: 0.5,
    market_cap_percentage: 3.5,
    circulating_supply: 155678901,
    total_supply: 166801148,
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
  }
];

// Alias para marketData (mantido para compatibilidade)
export const marketData = mockCryptoData;

export const MOCK_BITCOIN_DATA = [
  {
    timestamp: new Date('2023-05-01').getTime(),
    price: 27500,
    open: 27300,
    high: 27800,
    low: 27200,
    close: 27500,
    volume: 12500000
  },
  {
    timestamp: new Date('2023-05-02').getTime(),
    price: 27800,
    open: 27500,
    high: 28000,
    low: 27400,
    close: 27800,
    volume: 13200000
  },
  {
    timestamp: new Date('2023-05-03').getTime(),
    price: 28100,
    open: 27800,
    high: 28300,
    low: 27750,
    close: 28100,
    volume: 14500000
  },
  {
    timestamp: new Date('2023-05-04').getTime(),
    price: 28400,
    open: 28100,
    high: 28600,
    low: 28000,
    close: 28400,
    volume: 15300000
  },
  {
    timestamp: new Date('2023-05-05').getTime(),
    price: 28200,
    open: 28400,
    high: 28500,
    low: 28100,
    close: 28200,
    volume: 13800000
  },
  {
    timestamp: new Date('2023-05-06').getTime(),
    price: 28500,
    open: 28200,
    high: 28700,
    low: 28150,
    close: 28500,
    volume: 14200000
  },
  {
    timestamp: new Date('2023-05-07').getTime(),
    price: 28300,
    open: 28500,
    high: 28600,
    low: 28200,
    close: 28300,
    volume: 12700000
  },
  {
    timestamp: new Date('2023-05-08').getTime(),
    price: 28100,
    open: 28300,
    high: 28400,
    low: 28000,
    close: 28100,
    volume: 11900000
  },
  {
    timestamp: new Date('2023-05-09').getTime(),
    price: 27900,
    open: 28100,
    high: 28200,
    low: 27800,
    close: 27900,
    volume: 12400000
  },
  {
    timestamp: new Date('2023-05-10').getTime(),
    price: 28200,
    open: 27900,
    high: 28300,
    low: 27850,
    close: 28200,
    volume: 13500000
  },
  {
    timestamp: new Date('2023-05-11').getTime(),
    price: 28400,
    open: 28200,
    high: 28500,
    low: 28100,
    close: 28400,
    volume: 14100000
  },
  {
    timestamp: new Date('2023-05-12').getTime(),
    price: 28600,
    open: 28400,
    high: 28700,
    low: 28350,
    close: 28600,
    volume: 15000000
  },
  {
    timestamp: new Date('2023-05-13').getTime(),
    price: 28800,
    open: 28600,
    high: 29000,
    low: 28550,
    close: 28800,
    volume: 16200000
  },
  {
    timestamp: new Date('2023-05-14').getTime(),
    price: 29100,
    open: 28800,
    high: 29200,
    low: 28750,
    close: 29100,
    volume: 17500000
  },
  {
    timestamp: new Date('2023-05-15').getTime(),
    price: 29300,
    open: 29100,
    high: 29400,
    low: 29000,
    close: 29300,
    volume: 18300000
  },
  {
    timestamp: new Date('2023-05-16').getTime(),
    price: 29100,
    open: 29300,
    high: 29350,
    low: 29000,
    close: 29100,
    volume: 16800000
  },
  {
    timestamp: new Date('2023-05-17').getTime(),
    price: 28900,
    open: 29100,
    high: 29150,
    low: 28800,
    close: 28900,
    volume: 15500000
  },
  {
    timestamp: new Date('2023-05-18').getTime(),
    price: 29200,
    open: 28900,
    high: 29300,
    low: 28850,
    close: 29200,
    volume: 16700000
  },
  {
    timestamp: new Date('2023-05-19').getTime(),
    price: 29500,
    open: 29200,
    high: 29600,
    low: 29150,
    close: 29500,
    volume: 18100000
  },
  {
    timestamp: new Date('2023-05-20').getTime(),
    price: 29700,
    open: 29500,
    high: 29800,
    low: 29450,
    close: 29700,
    volume: 19200000
  },
  {
    timestamp: new Date('2023-05-21').getTime(),
    price: 29900,
    open: 29700,
    high: 30000,
    low: 29650,
    close: 29900,
    volume: 20500000
  },
  {
    timestamp: new Date('2023-05-22').getTime(),
    price: 30200,
    open: 29900,
    high: 30300,
    low: 29850,
    close: 30200,
    volume: 22100000
  },
  {
    timestamp: new Date('2023-05-23').getTime(),
    price: 30500,
    open: 30200,
    high: 30600,
    low: 30150,
    close: 30500,
    volume: 23500000
  },
  {
    timestamp: new Date('2023-05-24').getTime(),
    price: 30300,
    open: 30500,
    high: 30550,
    low: 30250,
    close: 30300,
    volume: 21700000
  },
  {
    timestamp: new Date('2023-05-25').getTime(),
    price: 30100,
    open: 30300,
    high: 30350,
    low: 30050,
    close: 30100,
    volume: 20300000
  },
  {
    timestamp: new Date('2023-05-26').getTime(),
    price: 30400,
    open: 30100,
    high: 30500,
    low: 30050,
    close: 30400,
    volume: 21500000
  },
  {
    timestamp: new Date('2023-05-27').getTime(),
    price: 30700,
    open: 30400,
    high: 30800,
    low: 30350,
    close: 30700,
    volume: 22800000
  },
  {
    timestamp: new Date('2023-05-28').getTime(),
    price: 31000,
    open: 30700,
    high: 31100,
    low: 30650,
    close: 31000,
    volume: 24200000
  },
  {
    timestamp: new Date('2023-05-29').getTime(),
    price: 31300,
    open: 31000,
    high: 31400,
    low: 30950,
    close: 31300,
    volume: 25500000
  },
  {
    timestamp: new Date('2023-05-30').getTime(),
    price: 31600,
    open: 31300,
    high: 31700,
    low: 31250,
    close: 31600,
    volume: 26800000
  }
]; 