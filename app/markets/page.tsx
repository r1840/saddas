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

  const handleWyloguj = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div classNazwa="min-h-screen bg-background">
        <header classNazwa="border-b border-border bg-card">
          <div classNazwa="max-w-7xl mx-auto px-4 py-4">
            <Skeleton classNazwa="h-8 w-32" />
          </div>
        </header>
        <div classNazwa="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton classNazwa="h-12 w-64" />
          <Skeleton classNazwa="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div classNazwa="min-h-screen bg-background">
      <header classNazwa="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div classNazwa="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div classNazwa="flex items-center gap-6">
            <Link href={authenticated ? '/dashboard' : '/'} classNazwa="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div classNazwa="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                <TrendingUp classNazwa="w-4 h-4 text-primary-foreground" />
              </div>
              <span classNazwa="text-xl font-bold">CryptoVest</span>
            </Link>
            {authenticated && (
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
              </nav>
            )}
          </div>
          <div classNazwa="hidden md:flex items-center gap-3">
            {authenticated ? (
              <Button variant="outline" onClick={handleWyloguj}>
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
            classNazwa="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X classNazwa="w-5 h-5" /> : <Menu classNazwa="w-5 h-5" />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <div classNazwa="md:hidden border-t border-border bg-background">
            <nav classNazwa="flex flex-col p-3 gap-1">
              {authenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" classNazwa="w-full justify-start h-10">Dashboard</Button>
                  </Link>
                  <Link href="/trade" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" classNazwa="w-full justify-start h-10">Handel</Button>
                  </Link>
                  <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" classNazwa="w-full justify-start h-10">Portfel</Button>
                  </Link>
                  <div classNazwa="pt-2 mt-1 border-t border-border">
                    <Button variant="outline" onClick={handleWyloguj} classNazwa="w-full bg-transparent h-10">
                      Wyloguj
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" classNazwa="w-full justify-start h-10">Zaloguj się</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button classNazwa="w-full h-10">Zacznij</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main classNazwa="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
        <div classNazwa="space-y-6">
          <div>
            <h2 classNazwa="text-4xl md:text-5xl font-bold mb-2">Ceny</h2>
            <p classNazwa="text-lg text-muted-foreground">
              Track real-time cryptocurrency prices and market data
            </p>
          </div>

          <div classNazwa="relative max-w-md">
            <Search classNazwa="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Szukaj kryptowalut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNazwa="pl-12 h-12 text-base border-2"
            />
          </div>
        </div>

        <div classNazwa="md:hidden space-y-3">
          {filteredData.slice(0, 30).map((coin) => (
            <Card key={coin.id} classNazwa="border">
              <CardContent classNazwa="py-4">
                <div classNazwa="flex items-center justify-between gap-3">
                  <div classNazwa="flex items-center gap-3 min-w-0">
                    <img src={coin.image || '/placeholder.svg'} alt={coin.name} classNazwa="w-9 h-9 rounded-full" />
                    <div classNazwa="min-w-0">
                      <p classNazwa="font-semibold truncate">{coin.name}</p>
                      <p classNazwa="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                    </div>
                  </div>
                  <div classNazwa="text-right">
                    <p classNazwa="font-semibold">zł {coin.current_price?.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                    <p classNazwa={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div classNazwa="mt-3">
                  {authenticated ? (
                    <Link href={`/trade?coin=${coin.id}`}>
                      <Button classNazwa="w-full">Handel {coin.symbol.toUpperCase()}</Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button variant="outline" classNazwa="w-full">Create account to trade</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card classNazwa="border-2 hidden md:block">
          <CardHeader>
            <CardTitle classNazwa="text-2xl">Przegląd rynku</CardTitle>
          </CardHeader>
          <CardContent>
            <div classNazwa="overflow-x-auto">
              <table classNazwa="w-full">
                <thead>
                  <tr classNazwa="border-b border-border">
                    <th classNazwa="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Pozycja
                    </th>
                    <th classNazwa="text-left py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Nazwa
                    </th>
                    <th classNazwa="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Cena
                    </th>
                    <th classNazwa="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      Zmiana 24h
                    </th>
                    <th classNazwa="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden md:table-cell">
                      Kapitalizacja
                    </th>
                    <th classNazwa="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground hidden lg:table-cell">
                      Wolumen (24h)
                    </th>
                    <th classNazwa="text-right py-4 px-3 font-semibold text-xs uppercase text-muted-foreground">
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((coin) => (
                    <tr key={coin.id} classNazwa="border-b border-border hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => authenticated && router.push(`/trade?coin=${coin.id}`)}>
                      <td classNazwa="py-5 px-3 text-sm font-medium text-muted-foreground">
                        {coin.market_cap_rank}
                      </td>
                      <td classNazwa="py-5 px-3">
                        <div classNazwa="flex items-center gap-3">
                          <img
                            src={coin.image || "/placeholder.svg"}
                            alt={coin.name}
                            classNazwa="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p classNazwa="font-semibold">{coin.name}</p>
                            <p classNazwa="text-sm text-muted-foreground uppercase font-medium">
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td classNazwa="py-5 px-3 text-right font-semibold">
                        ${coin.current_price?.toLocaleString('pl-PL', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '0.00'}
                      </td>
                      <td classNazwa="py-5 px-3 text-right">
                        {coin.price_change_percentage_24h != null ? (
                          <div
                            classNazwa={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-sm ${
                              coin.price_change_percentage_24h >= 0
                                ? 'bg-success/10 text-success'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {coin.price_change_percentage_24h >= 0 ? (
                              <TrendingUp classNazwa="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown classNazwa="w-3.5 h-3.5" />
                            )}
                            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        ) : (
                          <span classNazwa="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td classNazwa="py-5 px-3 text-right font-medium hidden md:table-cell">
                        {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B` : '—'}
                      </td>
                      <td classNazwa="py-5 px-3 text-right font-medium hidden lg:table-cell">
                        {coin.total_volume ? `$${(coin.total_volume / 1e9).toFixed(2)}B` : '—'}
                      </td>
                      <td classNazwa="py-5 px-3 text-right">
                        {authenticated ? (
                          <Link href={`/trade?coin=${coin.id}`}>
                            <Button size="sm" classNazwa="shadow-sm">Handel</Button>
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
                <div classNazwa="py-16 text-center">
                  <p classNazwa="text-muted-foreground text-lg">
                    No cryptocurrencies found matching your search.
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchQuery('')}
                    classNazwa="mt-4"
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
