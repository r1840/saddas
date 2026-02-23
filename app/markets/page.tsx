'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Search, Menu, X } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export default function RynkiPage() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [filteredData, setFilteredData] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadRynki() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        setAuthenticated(sessionRes.ok);

        const marketRes = await fetch('/api/market');
        if (marketRes.ok) {
          const data = await marketRes.json();
          setMarketData(data);
          setFilteredData(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    loadRynki();

    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      fetch('/api/market')
        .then((res) => res.json())
        .then((data) => {
          setMarketData(data);
          if (!searchQuery) {
            setFilteredData(data);
          }
        })
        .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = marketData.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(marketData);
    }
  }, [searchQuery, marketData]);

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
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={authenticated ? '/dashboard' : '/'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CryptoVest</span>
            </Link>
            {authenticated && (
              <nav className="hidden md:flex gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-medium">Dashboard</Button>
                </Link>
                <Link href="/trade">
                  <Button variant="ghost" className="font-medium">Handel</Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="ghost" className="font-medium">Portfolio</Button>
                </Link>
              </nav>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {authenticated ? (
              <Button variant="outline" onClick={handleLogout}>
                Wyloguj
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Zaloguj się</Button>
                </Link>
                <Link href="/register">
                  <Button>Zacznij</Button>
                </Link>
              </>
            )}
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
              {authenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-10">Dashboard</Button>
                  </Link>
                  <Link href="/trade" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-10">Handel</Button>
                  </Link>
                  <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-10">Portfolio</Button>
                  </Link>
                  <div className="pt-2 mt-1 border-t border-border">
                    <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent h-10">
                      Wyloguj
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-10">Zaloguj się</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-10">Zacznij</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2">Ceny</h2>
            <p className="text-lg text-muted-foreground">
              Track real-time cryptocurrency prices and market data
            </p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Szukaj kryptowalut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-2"
            />
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {filteredData.slice(0, 30).map((coin) => (
            <Card key={coin.id} className="border">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={coin.image || '/placeholder.svg'} alt={coin.name} className="w-9 h-9 rounded-full" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{coin.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">zł {coin.current_price?.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                    <p className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  {authenticated ? (
                    <Link href={`/trade?coin=${coin.id}`}>
                      <Button className="w-full">Handel {coin.symbol.toUpperCase()}</Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button variant="outline" className="w-full">Create account to trade</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 hidden md:block">
          <CardHeader>
            <CardTitle className="text-2xl">Przegląd rynku</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Pozycja
                    </th>
                    <th className="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Nazwa
                    </th>
                    <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Cena
                    </th>
                    <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Zmiana 24h
                    </th>
                    <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden md:table-cell">
                      Kapitalizacja
                    </th>
                    <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden lg:table-cell">
                      Wolumen (24h)
                    </th>
                    <th className="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((coin) => (
                    <tr key={coin.id} className="border-b border-border hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => authenticated && router.push(`/trade?coin=${coin.id}`)}>
                      <td className="py-5 px-3 text-sm font-medium text-muted-foreground">
                        {coin.market_cap_rank}
                      </td>
                      <td className="py-5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={coin.image || "/placeholder.svg"}
                            alt={coin.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{coin.name}</p>
                            <p className="text-sm text-muted-foreground uppercase font-medium">
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-3 text-right font-semibold">
                        ${coin.current_price?.toLocaleString('pl-PL', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '0.00'}
                      </td>
                      <td className="py-5 px-3 text-right">
                        {coin.price_change_percentage_24h != null ? (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-sm ${
                              coin.price_change_percentage_24h >= 0
                                ? 'bg-success/10 text-success'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {coin.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-5 px-3 text-right font-medium hidden md:table-cell">
                        {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B` : '—'}
                      </td>
                      <td className="py-5 px-3 text-right font-medium hidden lg:table-cell">
                        {coin.total_volume ? `$${(coin.total_volume / 1e9).toFixed(2)}B` : '—'}
                      </td>
                      <td className="py-5 px-3 text-right">
                        {authenticated ? (
                          <Link href={`/trade?coin=${coin.id}`}>
                            <Button size="sm" className="shadow-sm">Handel</Button>
                          </Link>
                        ) : (
                          <Link href="/register">
                            <Button size="sm" variant="outline">
                              Sign Up
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground text-lg">
                    No cryptocurrencies found matching your search.
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchQuery('')}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {authenticated && <MobileBottomNav current="markets" />}
    </div>
  );
}
