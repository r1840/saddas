'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

interface Portfolio {
  cash: string;
  holdings: {
    [coinId: string]: {
      amount: string;
      averagePrice: string;
    };
  };
}

function HandelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coinId = searchParams.get('coin') || 'bitcoin';

  const [coin, setCoin] = useState<CoinData | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadHandelData() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }


        const [marketRes, portfolioRes] = await Promise.all([
          fetch('/api/market'),
          fetch('/api/portfolio'),
        ]);

        if (marketRes.ok) {
          const marketData = await marketRes.json();
          const coinData = marketData.find((c: CoinData) => c.id === coinId);
          if (coinData) {
            setCoin(coinData);
          } else {
            router.push('/markets');
            return;
          }
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    loadHandelData();
  }, [coinId, router]);

  const handleHandel = async (type: 'buy' | 'sell') => {
    setError('');
    setSuccess('');
    setTrading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coinId: coin?.id,
          amount: amountNum,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Handel failed');
        return;
      }

      setSuccess(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${coin?.symbol.toUpperCase()}`);
      setAmount('');
      setPortfolio(data.portfolio);

      setTimeout(() => {
        router.push('/portfolio');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setTrading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!coin || !portfolio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Ładowanie danych handlowych...</p>
        </div>
      </div>
    );
  }

  const cashBalance = parseFloat(portfolio.cash);
  const holding = portfolio.holdings[coin.id];
  const holdingAmount = holding ? parseFloat(holding.amount) : 0;
  const maxBuy = cashBalance / coin.current_price;
  const estimatedTotal = amount ? parseFloat(amount) * coin.current_price : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CryptoVest</span>
            </Link>
            <nav className="hidden md:flex gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" className="font-medium">Dashboard</Button>
              </Link>
              <Link href="/markets">
                <Button variant="ghost" className="font-medium">Rynki</Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="ghost" className="font-medium">Portfolio</Button>
              </Link>
            </nav>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Wyloguj
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
        <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <span>←</span>
          <span>Back to Rynki</span>
        </Link>

        <div className="flex items-center gap-4 p-6 bg-card border-2 border-border rounded-2xl">
          <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold">{coin.name}</h2>
            <p className="text-muted-foreground uppercase font-semibold tracking-wide">{coin.symbol}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold">
              ${coin.current_price.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-sm font-semibold ${
                coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {coin.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}
              {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">24h High</span>
                <span className="font-semibold text-lg">zł {coin.high_24h.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">24h Low</span>
                <span className="font-semibold text-lg">zł {coin.low_24h.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">Kapitalizacja</span>
                <span className="font-semibold text-lg">
                  ${(coin.market_cap / 1e9).toFixed(2)}B
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">24h Volume</span>
                <span className="font-semibold text-lg">
                  ${(coin.total_volume / 1e9).toFixed(2)}B
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-card to-card">
            <CardHeader>
              <CardTitle className="text-xl">Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">Cash Available</span>
                <span className="font-bold text-lg text-success">
                  ${cashBalance.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">{coin.symbol.toUpperCase()} Holdings</span>
                <span className="font-semibold text-lg">
                  {holdingAmount.toFixed(4)}
                </span>
              </div>
              {holding && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground font-medium">Avg Buy Cena</span>
                    <span className="font-semibold text-lg">
                      ${parseFloat(holding.averagePrice).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground font-medium">Wartość aktywów</span>
                    <span className="font-semibold text-lg">
                      ${(holdingAmount * coin.current_price).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </div>
              Handel {coin.symbol.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="buy" className="font-semibold text-base">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="font-semibold text-base">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-2">
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-success/10 border-2 border-success text-success">
                    <AlertDescription className="font-medium">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="buy-amount" className="text-sm font-semibold">
                    Amount ({coin.symbol.toUpperCase()})
                  </Label>
                  <Input
                    id="buy-amount"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={trading}
                    className="h-12 text-base border-2"
                  />
                  <p className="text-sm text-muted-foreground font-medium">
                    Max: {maxBuy.toFixed(8)} {coin.symbol.toUpperCase()}
                  </p>
                </div>

                <div className="bg-muted/50 border-2 border-border p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Cena per {coin.symbol.toUpperCase()}</span>
                    <span className="font-semibold text-lg">zł {coin.current_price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Amount</span>
                    <span className="font-semibold text-lg">
                      {amount || '0'} {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-border">
                    <span className="font-semibold text-base">Total Cost</span>
                    <span className="font-bold text-2xl">zł {estimatedTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="sticky bottom-16 md:static bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 py-2 md:py-0">
                  <Button
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    size="lg"
                    onClick={() => handleHandel('buy')}
                    disabled={trading || !amount || parseFloat(amount) <= 0 || estimatedTotal > cashBalance}
                  >
                    {trading ? 'Processing Handel...' : `Buy ${coin.symbol.toUpperCase()}`}
                  </Button>
                </div>
                
                {estimatedTotal > cashBalance && amount && (
                  <p className="text-sm text-destructive font-medium text-center">
                    Insufficient funds. You need ${(estimatedTotal - cashBalance).toFixed(2)} more.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="sell" className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-2">
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-success/10 border-2 border-success text-success">
                    <AlertDescription className="font-medium">{success}</AlertDescription>
                  </Alert>
                )}

                {holdingAmount === 0 ? (
                  <Alert className="border-2">
                    <AlertDescription className="font-medium">
                      You don't own any {coin.symbol.toUpperCase()} to sell. Buy some first to start trading.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-3">
                      <Label htmlFor="sell-amount" className="text-sm font-semibold">
                        Amount ({coin.symbol.toUpperCase()})
                      </Label>
                      <Input
                        id="sell-amount"
                        type="number"
                        step="0.00000001"
                        min="0"
                        max={holdingAmount}
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={trading}
                        className="h-12 text-base border-2"
                      />
                      <p className="text-sm text-muted-foreground font-medium">
                        Available: {holdingAmount.toFixed(8)} {coin.symbol.toUpperCase()}
                      </p>
                    </div>

                    <div className="bg-muted/50 border-2 border-border p-5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Cena per {coin.symbol.toUpperCase()}</span>
                        <span className="font-semibold text-lg">zł {coin.current_price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Amount</span>
                        <span className="font-semibold text-lg">
                          {amount || '0'} {coin.symbol.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-border">
                        <span className="font-semibold text-base">Total Proceeds</span>
                        <span className="font-bold text-2xl">zł {estimatedTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="sticky bottom-16 md:static bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 py-2 md:py-0">
                      <Button
                        className="w-full h-12 text-base font-semibold"
                        size="lg"
                        variant="destructive"
                        onClick={() => handleHandel('sell')}
                        disabled={
                          trading ||
                          !amount ||
                          parseFloat(amount) <= 0 ||
                          parseFloat(amount) > holdingAmount
                        }
                      >
                        {trading ? 'Processing Handel...' : `Sell ${coin.symbol.toUpperCase()}`}
                      </Button>
                    </div>
                    
                    {amount && parseFloat(amount) > holdingAmount && (
                      <p className="text-sm text-destructive font-medium text-center">
                        You only have {holdingAmount.toFixed(8)} {coin.symbol.toUpperCase()} available to sell.
                      </p>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <MobileBottomNav current="trade" />
    </div>
  );
}

export default function HandelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Skeleton className="h-96 w-full max-w-4xl" />
        </div>
      }
    >
      <HandelPageContent />
    </Suspense>
  );
}
