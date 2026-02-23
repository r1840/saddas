export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

interface MarketCache {
  data: CoinData[];
  timestamp: number;
}

let marketCache: MarketCache | null = null;
const CACHE_DURATION = 1800000; // 30 minutes to avoid rate limits

const FALLBACK_COINS: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 95000,
    market_cap: 1875000000000,
    market_cap_rank: 1,
    total_volume: 35000000000,
    high_24h: 96500,
    low_24h: 94000,
    price_change_24h: 1200,
    price_change_percentage_24h: 1.28,
    circulating_supply: 19500000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 108000,
    ath_change_percentage: -12.5,
    ath_date: '2024-03-15T00:00:00.000Z',
    atl: 67.81,
    atl_change_percentage: 140000,
    atl_date: '2013-07-06T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3500,
    market_cap: 420000000000,
    market_cap_rank: 2,
    total_volume: 18000000000,
    high_24h: 3600,
    low_24h: 3450,
    price_change_24h: 45,
    price_change_percentage_24h: 1.3,
    circulating_supply: 120000000,
    total_supply: 120000000,
    max_supply: null,
    ath: 4878,
    ath_change_percentage: -28.2,
    ath_date: '2021-11-10T00:00:00.000Z',
    atl: 0.432979,
    atl_change_percentage: 808000,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 145,
    market_cap: 68000000000,
    market_cap_rank: 5,
    total_volume: 3500000000,
    high_24h: 148,
    low_24h: 142,
    price_change_24h: 2.5,
    price_change_percentage_24h: 1.75,
    circulating_supply: 470000000,
    total_supply: 580000000,
    max_supply: null,
    ath: 260,
    ath_change_percentage: -44.2,
    ath_date: '2021-11-06T00:00:00.000Z',
    atl: 0.500801,
    atl_change_percentage: 28900,
    atl_date: '2020-05-11T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
];

export async function fetchMarketData(forceRefresh = false): Promise<CoinData[]> {
  const now = Date.now();

  if (!forceRefresh && marketCache && now - marketCache.timestamp < CACHE_DURATION) {
    return marketCache.data;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinData[] = await response.json();

    marketCache = {
      data,
      timestamp: now,
    };

    return data;
  } catch (error) {
    if (marketCache) {
      return marketCache.data;
    }

    return FALLBACK_COINS;
  }
}

export async function getCoinById(coinId: string): Promise<CoinData | null> {
  const marketData = await fetchMarketData();
  return marketData.find((coin) => coin.id === coinId) || null;
}

export async function searchCoins(query: string): Promise<CoinData[]> {
  const marketData = await fetchMarketData();
  const lowerQuery = query.toLowerCase();

  return marketData.filter(
    (coin) =>
      coin.name.toLowerCase().includes(lowerQuery) ||
      coin.symbol.toLowerCase().includes(lowerQuery)
  );
}

export function calculatePortfolioValue(
  holdings: { [coinId: string]: { amount: string; averagePrice: string } },
  marketData: CoinData[]
): number {
  let totalValue = 0;

  for (const [coinId, holding] of Object.entries(holdings)) {
    const coin = marketData.find((c) => c.id === coinId);
    if (coin) {
      const amount = parseFloat(holding.amount);
      totalValue += amount * coin.current_price;
    }
  }

  return totalValue;
}
