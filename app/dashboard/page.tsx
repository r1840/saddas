'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, ArrowRight, Wallet, Activity, Menu, X, ArrowDownToLine, ArrowUpFromLine, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

interface User {
  username: string;
  isAdmin: boolean;
}

interface Portfel {
  cash: string;
  pumpGainPercent?: number;
  holdings: {
    [coinId: string]: {
      amount: string;
      averagePrice: string;
    };
  };
}

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface Transaction {
  id: string;
  coinId: string;
  coinName: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  total: string;
  timestamp: string;
}

interface Pump {
  id: string;
  coinId: string;
  percentage: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  completedPercentage: number;
  isActive: boolean;
}

export default function PanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfel] = useState<Portfel | null>(null);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiTradingEnabled, setAiTradingEnabled] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [enablingAi, setEnablingAi] = useState(false);
  const [activePump, setActivePump] = useState<Pump | null>(null);

  useEffect(() => {
    async function loadPanel() {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        await fetch('/api/pump/process', { method: 'POST' });

        const [portfolioRes, marketRes, transactionsRes, pumpRes] = await Promise.all([
          fetch('/api/portfolio'),
          fetch('/api/market'),
          fetch('/api/transactions'),
          fetch('/api/pump/status'),
        ]);

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfel(portfolioData);
        }

        if (marketRes.ok) {
          const marketData = await marketRes.json();
          setMarketData(marketData);
        }

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(transactionsData);
        }

        if (pumpRes.ok) {
          const pumpData = await pumpRes.json();
          const firstActive = (pumpData.pumps || []).find((p: Pump) => p.isActive);
          setActivePump(firstActive || null);
        }

        const aiRes = await fetch('/api/user/auto-trading');
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiTradingEnabled(aiData.enabled);
        }
      } catch (error) {
        console.error('[app] Panel load error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPanel();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadPanel();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const calculateTotalValue = () => {
    if (!portfolio || !marketData.length) return 0;

    let total = parseFloat(portfolio.cash);

    for (const [coinId, holding] of Object.entries(portfolio.holdings)) {
      const coin = marketData.find((c) => c.id === coinId);
      if (coin) {
        total += parseFloat(holding.amount) * coin.current_price;
      }
    }

    return total;
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleEnableAiTrading = async () => {
    setEnablingAi(true);
    const res = await fetch('/api/user/auto-trading', { method: 'POST' });
    if (res.ok) {
      setAiTradingEnabled(true);
      setAiSuccess(true);
    }
    setEnablingAi(false);
  };

  const handleDisableAiTrading = async () => {
    setEnablingAi(true);
    const res = await fetch('/api/user/auto-trading', { method: 'DELETE' });
    if (res.ok) {
      setAiTradingEnabled(false);
      setAiDialogOpen(false);
    }
    setEnablingAi(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  const totalValue = calculateTotalValue();
  const cashBalance = portfolio ? parseFloat(portfolio.cash) : 0;

  const storedPumpPercent = portfolio?.pumpGainPercent || 0;
  const livePumpPercent = activePump ? Number(activePump.completedPercentage || 0) : 0;
  const totalPumpPercent = storedPumpPercent + livePumpPercent;

  const pumpCoinName = activePump
    ? (marketData.find((c) => c.id === activePump.coinId)?.name || activePump.coinId)
    : '';

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
                <Button variant="ghost" className="font-medium">Panel</Button>
              </Link>
              <Link href="/trade">
                <Button variant="ghost" className="font-medium">Handel</Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="ghost" className="font-medium">Portfel</Button>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="font-medium">Admin</Button>
                </Link>
              )}
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">
              {user?.username}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Wyloguj
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col p-3 gap-1">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-10">Panel</Button>
              </Link>
              <Link href="/trade" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-10">Handel</Button>
              </Link>
              <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-10">Portfel</Button>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start h-10">Admin</Button>
                </Link>
              )}
              <div className="pt-2 mt-1 border-t border-border">
                <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent h-10">
                  Wyloguj
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Witamy ponownie, {user?.username}</h2>
            <p className="text-muted-foreground mt-1">
              Here's your portfolio overview
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/portfolio?action=deposit">
              <Button className="gap-2 flex-1 sm:flex-none">
                <ArrowDownToLine className="w-4 h-4" />
                Wpłać
              </Button>
            </Link>
            <Link href="/portfolio?action=withdraw">
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none bg-transparent">
                <ArrowUpFromLine className="w-4 h-4" />
                Wypłać
              </Button>
            </Link>
          </div>
        </div>

        {false && (
          <Card className="border-2 border-success/50 bg-gradient-to-r from-success/15 via-success/5 to-transparent shadow-lg shadow-success/10">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg text-success">Pump in Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {pumpCoinName} • Target +{activePump.percentage}% • {pumpTimeRemaining}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">{pumpProgress.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success to-success/70 transition-all duration-700"
                  style={{ width: `${pumpProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {totalValue > 1 && !aiTradingEnabled && (
          <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Auto Trading dostępny</h3>
                    <p className="text-sm text-muted-foreground">Let Auto optimize your trades automatically</p>
                  </div>
                </div>
                <Button onClick={() => setAiDialogOpen(true)} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Włącz Auto Trading
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {aiTradingEnabled && (
          <Card className="border-2 border-success/50 bg-gradient-to-r from-success/10 via-success/5 to-transparent">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex w-12 h-12 bg-success/20 rounded-xl items-center justify-center">
                    <Bot className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-success">Auto Trading aktywny</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Auto is optimizing your portfolio</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setAiDialogOpen(true)} 
                  className="bg-transparent"
                  size="sm"
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Card className={`bg-gradient-to-br from-card to-card hover:shadow-lg transition-all ${activePump ? 'border-4 border-success/40 shadow-xl shadow-success/20' : 'border-2'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Łączne saldo</CardTitle>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                ${totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">
                Including cash and holdings
              </p>
              {totalPumpPercent > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <TrendingUp className={`w-3.5 h-3.5 ${activePump ? 'animate-bounce' : ''}`} />
                  +{totalPumpPercent.toFixed(2)}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-card to-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo gotówki</CardTitle>
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                ${cashBalance.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">
                Dostępne do handlu
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-card to-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wartość aktywów</CardTitle>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                ${(totalValue - cashBalance).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">
                Current crypto value
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Movers</CardTitle>
              <Link href="/markets">
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
                  Zobacz wszystko <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.slice(0, 5).map((coin) => (
                  <Link 
                    key={coin.id} 
                    href={`/trade?coin=${coin.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold">{coin.name}</p>
                        <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${coin.current_price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                        coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {coin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ostatnie transakcje</CardTitle>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
                  Zobacz wszystko <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Brak transakcji. Zacznij handlować!
                  </p>
                  <Link href="/markets">
                    <Button size="sm">Explore Rynki</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-semibold">{tx.coinName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString('pl-PL', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                          {tx.type === 'buy' ? '+' : '-'}{parseFloat(tx.amount).toFixed(4)} {tx.coinName.split(' ')[0]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${parseFloat(tx.total).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Zacznij handlować</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Browse 100+ cryptocurrencies and execute your first trade
                  </p>
                </div>
              </div>
              <Link href="/markets">
                <Button className="gap-2 w-full sm:w-auto shadow-md shadow-primary/20">
                  View Rynki <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          {aiSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-success" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-success mb-2">Auto Trading is Now Enabled!</h3>
                <p className="text-lg text-muted-foreground">Your Auto Trading assistant is active</p>
                <p className="text-sm text-muted-foreground mt-2">Our Auto will analyze market conditions and optimize your portfolio 24/7</p>
              </div>
              <Button onClick={() => { setAiDialogOpen(false); setAiSuccess(false); }} className="mt-4">
                Got it
              </Button>
            </div>
          ) : aiTradingEnabled ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-success" />
                  Auto Trading Management
                </DialogTitle>
                <DialogDescription>
                  Auto Trading is currently active on your account
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-success">Auto Trading aktywny</p>
                    <p className="text-sm text-muted-foreground">Your portfolio is being optimized automatically</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiDialogOpen(false)} className="bg-transparent">Zamknij</Button>
                <Button variant="destructive" onClick={handleDisableAiTrading} disabled={enablingAi}>
                  {enablingAi ? 'Disabling...' : 'Disable Auto Trading'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Włącz Auto Trading
                </DialogTitle>
                <DialogDescription>
                  Let our advanced Auto algorithms analyze market trends and execute optimal trades for your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Smart Analysis</p>
                    <p className="text-sm text-muted-foreground">Auto monitors 100+ market indicators 24/7</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Optimized Returns</p>
                    <p className="text-sm text-muted-foreground">Maximize profits while minimizing risks</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiDialogOpen(false)} className="bg-transparent">Anuluj</Button>
                <Button onClick={handleEnableAiTrading} disabled={enablingAi} className="gap-2">
                  {enablingAi ? 'Enabling...' : 'Włącz Auto Trading'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <MobileBottomNav current="dashboard" isAdmin={!!user?.isAdmin} />
    </div>
  );
}
