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
      averageCena: string;
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
  coinNazwa: string;
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

export default function DashboardPage() {
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
    async function loadDashboard() {
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
        console.error('[app] Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
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

  const handleWyloguj = async () => {
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
      <div classNazwa="min-h-screen bg-background p-4">
        <div classNazwa="max-w-7xl mx-auto space-y-6">
          <Skeleton classNazwa="h-12 w-64" />
          <div classNazwa="grid md:grid-cols-3 gap-6">
            <Skeleton classNazwa="h-32" />
            <Skeleton classNazwa="h-32" />
            <Skeleton classNazwa="h-32" />
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

  const pumpCoinNazwa = activePump
    ? (marketData.find((c) => c.id === activePump.coinId)?.name || activePump.coinId)
    : '';

  return (
    <div classNazwa="min-h-screen bg-background">
      <header classNazwa="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div classNazwa="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div classNazwa="flex items-center gap-6">
            <Link href="/dashboard" classNazwa="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div classNazwa="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                <TrendingUp classNazwa="w-4 h-4 text-primary-foreground" />
              </div>
              <span classNazwa="text-xl font-bold">CryptoVest</span>
            </Link>
            <nav classNazwa="hidden md:flex gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" classNazwa="font-medium">Dashboard</Button>
              </Link>
              <Link href="/trade">
                <Button variant="ghost" classNazwa="font-medium">Handel</Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="ghost" classNazwa="font-medium">Portfel</Button>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" classNazwa="font-medium">Admin</Button>
                </Link>
              )}
            </nav>
          </div>
          <div classNazwa="hidden md:flex items-center gap-3">
            <span classNazwa="text-sm text-muted-foreground font-medium">
              {user?.username}
            </span>
            <Button variant="outline" onClick={handleWyloguj}>
              Wyloguj
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            classNazwa="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X classNazwa="w-5 h-5" /> : <Menu classNazwa="w-5 h-5" />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <div classNazwa="md:hidden border-t border-border bg-background">
            <nav classNazwa="flex flex-col p-3 gap-1">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" classNazwa="w-full justify-start h-10">Dashboard</Button>
              </Link>
              <Link href="/trade" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" classNazwa="w-full justify-start h-10">Handel</Button>
              </Link>
              <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" classNazwa="w-full justify-start h-10">Portfel</Button>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" classNazwa="w-full justify-start h-10">Admin</Button>
                </Link>
              )}
              <div classNazwa="pt-2 mt-1 border-t border-border">
                <Button variant="outline" onClick={handleWyloguj} classNazwa="w-full bg-transparent h-10">
                  Wyloguj
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main classNazwa="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
        <div classNazwa="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 classNazwa="text-2xl sm:text-3xl font-bold">Witamy ponownie, {user?.username}</h2>
            <p classNazwa="text-muted-foreground mt-1">
              Here's your portfolio overview
            </p>
          </div>
          <div classNazwa="flex gap-3">
            <Link href="/portfolio?action=deposit">
              <Button classNazwa="gap-2 flex-1 sm:flex-none">
                <ArrowDownToLine classNazwa="w-4 h-4" />
                Wpłać
              </Button>
            </Link>
            <Link href="/portfolio?action=withdraw">
              <Button variant="outline" classNazwa="gap-2 flex-1 sm:flex-none bg-transparent">
                <ArrowUpFromLine classNazwa="w-4 h-4" />
                Wypłać
              </Button>
            </Link>
          </div>
        </div>

        {false && (
          <Card classNazwa="border-2 border-success/50 bg-gradient-to-r from-success/15 via-success/5 to-transparent shadow-lg shadow-success/10">
            <CardContent classNazwa="py-4 space-y-3">
              <div classNazwa="flex items-center justify-between gap-3">
                <div>
                  <h3 classNazwa="font-bold text-lg text-success">Pump in Progress</h3>
                  <p classNazwa="text-sm text-muted-foreground">
                    {pumpCoinNazwa} • Target +{activePump.percentage}% • {pumpTimeRemaining}
                  </p>
                </div>
                <div classNazwa="text-right">
                  <p classNazwa="text-2xl font-bold text-success">{pumpProgress.toFixed(1)}%</p>
                  <p classNazwa="text-xs text-muted-foreground">completed</p>
                </div>
              </div>
              <div classNazwa="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  classNazwa="h-full bg-gradient-to-r from-success to-success/70 transition-all duration-700"
                  style={{ width: `${pumpProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {totalValue > 1 && !aiTradingEnabled && (
          <Card classNazwa="border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent classNazwa="py-4">
              <div classNazwa="flex items-center justify-between">
                <div classNazwa="flex items-center gap-3">
                  <div classNazwa="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Bot classNazwa="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 classNazwa="font-bold text-lg">Auto Trading Available</h3>
                    <p classNazwa="text-sm text-muted-foreground">Let Auto optimize your trades automatically</p>
                  </div>
                </div>
                <Button onClick={() => setAiDialogOpen(true)} classNazwa="gap-2">
                  <Sparkles classNazwa="w-4 h-4" />
                  Enable Auto Trading
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {aiTradingEnabled && (
          <Card classNazwa="border-2 border-success/50 bg-gradient-to-r from-success/10 via-success/5 to-transparent">
            <CardContent classNazwa="py-4">
              <div classNazwa="flex items-center justify-between">
                <div classNazwa="flex items-center gap-3">
                  <div classNazwa="hidden md:flex w-12 h-12 bg-success/20 rounded-xl items-center justify-center">
                    <Bot classNazwa="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 classNazwa="font-bold text-base md:text-lg text-success">Auto Trading Active</h3>
                    <p classNazwa="text-xs md:text-sm text-muted-foreground">Auto is optimizing your portfolio</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setAiDialogOpen(true)} 
                  classNazwa="bg-transparent"
                  size="sm"
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div classNazwa="grid md:grid-cols-3 gap-6">
          <Card classNazwa={`bg-gradient-to-br from-card to-card hover:shadow-lg transition-all ${activePump ? 'border-4 border-success/40 shadow-xl shadow-success/20' : 'border-2'}`}>
            <CardHeader classNazwa="flex flex-row items-center justify-between pb-2">
              <CardTitle classNazwa="text-sm font-medium text-muted-foreground">Łączne saldo</CardTitle>
              <div classNazwa="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet classNazwa="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div classNazwa="text-3xl font-bold mb-1">
                ${totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p classNazwa="text-sm text-muted-foreground">
                Including cash and holdings
              </p>
              {totalPumpPercent > 0 && (
                <div classNazwa="mt-2 inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <TrendingUp classNazwa={`w-3.5 h-3.5 ${activePump ? 'animate-bounce' : ''}`} />
                  +{totalPumpPercent.toFixed(2)}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card classNazwa="border-2 bg-gradient-to-br from-card to-card hover:shadow-lg transition-shadow">
            <CardHeader classNazwa="flex flex-row items-center justify-between pb-2">
              <CardTitle classNazwa="text-sm font-medium text-muted-foreground">Saldo gotówki</CardTitle>
              <div classNazwa="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <Activity classNazwa="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div classNazwa="text-3xl font-bold mb-1">
                ${cashBalance.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p classNazwa="text-sm text-muted-foreground">
                Available for trading
              </p>
            </CardContent>
          </Card>

          <Card classNazwa="border-2 bg-gradient-to-br from-card to-card hover:shadow-lg transition-shadow">
            <CardHeader classNazwa="flex flex-row items-center justify-between pb-2">
              <CardTitle classNazwa="text-sm font-medium text-muted-foreground">Wartość aktywów</CardTitle>
              <div classNazwa="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp classNazwa="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div classNazwa="text-3xl font-bold mb-1">
                ${(totalValue - cashBalance).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p classNazwa="text-sm text-muted-foreground">
                Current crypto value
              </p>
            </CardContent>
          </Card>
        </div>

        <div classNazwa="grid lg:grid-cols-2 gap-6">
          <Card classNazwa="border-2">
            <CardHeader classNazwa="flex flex-row items-center justify-between">
              <CardTitle>Top Movers</CardTitle>
              <Link href="/markets">
                <Button variant="ghost" size="sm" classNazwa="gap-1 text-primary hover:text-primary">
                  Zobacz wszystko <ArrowRight classNazwa="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div classNazwa="space-y-4">
                {marketData.slice(0, 5).map((coin) => (
                  <Link 
                    key={coin.id} 
                    href={`/trade?coin=${coin.id}`}
                    classNazwa="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div classNazwa="flex items-center gap-3">
                      <img src={coin.image || "/placeholder.svg"} alt={coin.name} classNazwa="w-10 h-10 rounded-full" />
                      <div>
                        <p classNazwa="font-semibold">{coin.name}</p>
                        <p classNazwa="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                    <div classNazwa="text-right">
                      <p classNazwa="font-semibold">
                        ${coin.current_price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div classNazwa={`flex items-center justify-end gap-1 text-sm font-medium ${
                        coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {coin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp classNazwa="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown classNazwa="w-3.5 h-3.5" />
                        )}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card classNazwa="border-2">
            <CardHeader classNazwa="flex flex-row items-center justify-between">
              <CardTitle>Ostatnie transakcje</CardTitle>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm" classNazwa="gap-1 text-primary hover:text-primary">
                  Zobacz wszystko <ArrowRight classNazwa="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div classNazwa="text-center py-12">
                  <div classNazwa="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity classNazwa="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p classNazwa="text-muted-foreground mb-4">
                    No transactions yet. Start trading!
                  </p>
                  <Link href="/markets">
                    <Button size="sm">Explore Rynki</Button>
                  </Link>
                </div>
              ) : (
                <div classNazwa="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} classNazwa="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div>
                        <p classNazwa="font-semibold">{tx.coinNazwa}</p>
                        <p classNazwa="text-sm text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString('pl-PL', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div classNazwa="text-right">
                        <p classNazwa={`font-semibold ${tx.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                          {tx.type === 'buy' ? '+' : '-'}{parseFloat(tx.amount).toFixed(4)} {tx.coinNazwa.split(' ')[0]}
                        </p>
                        <p classNazwa="text-sm text-muted-foreground">
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

        <Card classNazwa="border-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent classNazwa="pt-6">
            <div classNazwa="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div classNazwa="flex items-start gap-4">
                <div classNazwa="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp classNazwa="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 classNazwa="text-lg font-semibold mb-1">Zacznij handlować</h3>
                  <p classNazwa="text-muted-foreground text-sm leading-relaxed">
                    Browse 100+ cryptocurrencies and execute your first trade
                  </p>
                </div>
              </div>
              <Link href="/markets">
                <Button classNazwa="gap-2 w-full sm:w-auto shadow-md shadow-primary/20">
                  View Rynki <ArrowRight classNazwa="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          {aiSuccess ? (
            <div classNazwa="py-8 text-center space-y-4">
              <div classNazwa="flex justify-center">
                <div classNazwa="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center">
                  <Sparkles classNazwa="w-10 h-10 text-success" />
                </div>
              </div>
              <div>
                <h3 classNazwa="text-2xl font-bold text-success mb-2">Auto Trading is Now Enabled!</h3>
                <p classNazwa="text-lg text-muted-foreground">Your Auto Trading assistant is active</p>
                <p classNazwa="text-sm text-muted-foreground mt-2">Our Auto will analyze market conditions and optimize your portfolio 24/7</p>
              </div>
              <Button onClick={() => { setAiDialogOpen(false); setAiSuccess(false); }} classNazwa="mt-4">
                Got it
              </Button>
            </div>
          ) : aiTradingEnabled ? (
            <>
              <DialogHeader>
                <DialogTitle classNazwa="flex items-center gap-2">
                  <Bot classNazwa="w-5 h-5 text-success" />
                  Auto Trading Management
                </DialogTitle>
                <DialogDescription>
                  Auto Trading is currently active on your account
                </DialogDescription>
              </DialogHeader>
              <div classNazwa="py-4 space-y-3">
                <div classNazwa="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle2 classNazwa="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p classNazwa="font-medium text-success">Auto Trading Active</p>
                    <p classNazwa="text-sm text-muted-foreground">Your portfolio is being optimized automatically</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiDialogOpen(false)} classNazwa="bg-transparent">Zamknij</Button>
                <Button variant="destructive" onClick={handleDisableAiTrading} disabled={enablingAi}>
                  {enablingAi ? 'Disabling...' : 'Disable Auto Trading'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle classNazwa="flex items-center gap-2">
                  <Bot classNazwa="w-5 h-5 text-primary" />
                  Enable Auto Trading
                </DialogTitle>
                <DialogDescription>
                  Let our advanced Auto algorithms analyze market trends and execute optimal trades for your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div classNazwa="py-4 space-y-3">
                <div classNazwa="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Sparkles classNazwa="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p classNazwa="font-medium">Smart Analysis</p>
                    <p classNazwa="text-sm text-muted-foreground">Auto monitors 100+ market indicators 24/7</p>
                  </div>
                </div>
                <div classNazwa="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <TrendingUp classNazwa="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p classNazwa="font-medium">Optimized Returns</p>
                    <p classNazwa="text-sm text-muted-foreground">Maximize profits while minimizing risks</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiDialogOpen(false)} classNazwa="bg-transparent">Anuluj</Button>
                <Button onClick={handleEnableAiTrading} disabled={enablingAi} classNazwa="gap-2">
                  {enablingAi ? 'Enabling...' : 'Enable Auto Trading'}
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
