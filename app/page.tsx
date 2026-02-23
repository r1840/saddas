'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  Wallet, 
  Lock,
  Globe,
  Smartphone,
  CheckCircle2,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export default function LandingPage() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);

  useEffect(() => {
    fetch('/api/market')
      .then(res => res.json())
      .then(data => setCryptos(data.slice(0, 5)))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-success via-success/90 to-success text-white py-3 text-center font-semibold text-sm md:text-base sticky top-0 z-[60] shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <Star className="w-4 h-4 fill-white" />
          <span>KOD <span className="px-2 py-1 bg-white/20 rounded font-bold mx-1">BONUS</span> DLA 15% BONUSU OD PIERWSZEJ WPŁATY</span>
          <Star className="w-4 h-4 fill-white" />
        </div>
      </div>
      
      <header className="sticky top-12 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                CryptoVest
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/markets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Ceny
              </Link>
              <Link href="/learn" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Nauka
              </Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                O nas
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">Zaloguj się</Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2">
                  Zacznij
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(69,92,255,0.1),transparent_50%)]" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <Star className="w-3.5 h-3.5 mr-1.5 fill-primary text-primary" />
                Zaufanie tysięcy inwestorów
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold text-balance leading-[1.1] tracking-tight">
                Rozpocznij swój portfel krypto
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
                CryptoVest to najprostsze miejsce do kupna i sprzedaży kryptowalut. Załóż konto i zacznij już dziś.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-12 shadow-lg shadow-primary/20">
                    Zacznij
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/markets">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 bg-transparent">
                    Przeglądaj rynki
                  </Button>
                </Link>
              </div>

              {cryptos.length > 0 && (
                <div className="mt-16 p-6 bg-card border border-border rounded-2xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">CENY NA ŻYWO</h3>
                    <Link href="/markets" className="text-sm text-primary hover:underline">
                      Zobacz wszystko
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {cryptos.map((crypto) => (
                      <div key={crypto.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <img src={crypto.image || "/placeholder.svg"} alt={crypto.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-semibold">{crypto.name}</div>
                            <div className="text-xs text-muted-foreground uppercase">{crypto.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">zł {crypto.current_price.toLocaleString()}</div>
                          <div className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                            {crypto.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Stwórz swój portfel kryptowalut już dziś
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                CryptoVest oferuje funkcje, które czynią go najlepszym miejscem do rozpoczęcia handlu
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Zarządzaj swoim portfelem</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track all your crypto investments in one place with real-time updates and comprehensive analytics.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">Natychmiastowy handel</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Wykonuj transakcje natychmiast dzięki zaawansowanemu silnikowi handlowemu. Bez opóźnień i bez problemów.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Bezpieczne przechowywanie</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your data and assets are protected with bank-level security and encryption.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">Ochrona portfela</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Keep your crypto safe with our advanced portfolio protection and monitoring systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-between">
                    <Smartphone className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Aplikacje mobilne</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fully responsive design that works seamlessly on mobile, tablet, and desktop.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
                    <Globe className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">Lider branży</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Uzyskaj dostęp do ponad 100 kryptowalut z danymi rynkowymi w czasie rzeczywistym.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Bezpieczna
                </div>
                <p className="text-lg text-muted-foreground">Platforma handlowa</p>
              </div>
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-success/70">
                  100+
                </div>
                <p className="text-lg text-muted-foreground">Kryptowaluty</p>
              </div>
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  24/7
                </div>
                <p className="text-lg text-muted-foreground">Dostęp do rynku</p>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Zacznij w kilka minut
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Rozpocznij handel kryptowalutami w trzech prostych krokach
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-primary/20">
                    1
                  </div>
                  <h3 className="text-2xl font-bold">Utwórz konto</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sign up with your email and verify your identity in minutes
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-primary/20">
                    2
                  </div>
                  <h3 className="text-2xl font-bold">Przeglądaj rynki</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Browse 100+ cryptocurrencies with real-time market data
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-primary/20">
                    3
                  </div>
                  <h3 className="text-2xl font-bold">Zacznij handlować</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kupuj i sprzedawaj krypto natychmiast po cenach rynkowych na żywo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="px-4 py-1.5">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  Bezpieczeństwo klasy premium
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-bold text-balance">
                  Najbardziej zaufana platforma kryptowalutowa
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Uważamy, że CryptoVest to najbezpieczniejszy sposób handlu i zarządzania kryptowalutami.
                  Oto kilka powodów dlaczego.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Zaawansowane szyfrowanie</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Your personal data and portfolio are protected with bank-level encryption
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Bezpieczna sessions</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Zaawansowane zarządzanie sesjami chroni Twoje konto
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Nacisk na prywatność</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        We never share your personal information without your consent
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-success/10 rounded-3xl p-8 border border-border shadow-2xl">
                  <div className="bg-card rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <h3 className="font-bold text-lg">Twój portfel</h3>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        Bezpiecznad
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Łączne saldo</div>
                      <div className="text-4xl font-bold">zł 0.00</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="text-xs text-muted-foreground mb-1">Zmiana 24h</div>
                        <div className="text-success font-semibold">+zł 0.00</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="text-xs text-muted-foreground mb-1">Aktywa</div>
                        <div className="font-semibold">Gotowe do startu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Zacznij handlować today
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
                Dołącz do tysięcy inwestorów i buduj swój portfel kryptowalut na naszej bezpiecznej platformie
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2 text-base px-8 h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Odbierz swój bonus
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Dlaczego CryptoVest
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Najlepsze praktyki bezpieczeństwa</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cutting-edge security measures to protect your account and personal information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Dane rynkowe na żywo</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Uzyskaj dostęp do cen na żywo i informacji rynkowych dla ponad 100 kryptowalut
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Wgląd w portfel</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track performance, analyze trends, and make informed decisions with detailed analytics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Handel on the go</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Zarządzaj swoim portfelem from anywhere with our fully responsive platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-2 bg-gradient-to-br from-card to-card/50 overflow-hidden">
              <CardContent className="pt-12 pb-12 text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-balance">
                    Gotowe do startu trading?
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                    Dołącz do CryptoVest i uzyskaj natychmiastowy dostęp do ponad 100 kryptowalut oraz danych na żywo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">Firma</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    O nas
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground transition-colors">
                    Kariera
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produkty</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/markets" className="hover:text-foreground transition-colors">
                    Ceny
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="hover:text-foreground transition-colors">
                    Portfel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Nauka</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/learn" className="hover:text-foreground transition-colors">
                    Podstawy krypto
                  </Link>
                </li>
                <li>
                  <Link href="/learn" className="hover:text-foreground transition-colors">
                    Wskazówki handlowe
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Informacje prawne</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Regulamin
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Polityka prywatności
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span>© 2026 CryptoVest. Wszelkie prawa zastrzeżone.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
