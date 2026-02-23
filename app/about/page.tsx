import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ArrowLeft, Users, Target, Rocket, Heart, Shield, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CryptoVest</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </Link>
            <Link href="/register">
              <Button>Zacznij</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Powrót do strony głównej
        </Link>

        <div className="mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Building the cryptoeconomy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
            CryptoVest is on a mission to increase economic freedom by making cryptocurrency accessible to everyone, everywhere.
          </p>
        </div>

        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Our mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that cryptocurrency and blockchain technology represent the future of finance. 
                Our mission is to create an open financial system for the world by providing a trusted platform 
                where anyone can easily trade and manage their digital assets.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded with the vision of democratizing access to cryptocurrency markets, CryptoVest combines 
                cutting-edge technology with user-friendly design to create the most trusted trading platform.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-success/10 rounded-3xl p-8 border border-border">
              <div className="bg-card rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">100+</div>
                    <div className="text-sm text-muted-foreground">Cryptocurrencies</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm text-muted-foreground">Trading Support</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">Fast</div>
                    <div className="text-sm text-muted-foreground">Instant Handels</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our values</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Trust</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Building a platform you can trust with your financial future
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Lightbulb className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-xl font-bold">Innovation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Constantly improving our platform with the latest technology
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Accessibility</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Making crypto trading simple and accessible for everyone
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-xl font-bold">Community</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Supporting our users on their crypto investment journey
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            Join the future of finance
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
            Start your cryptocurrency journey today with CryptoVest
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-8">
              Zacznij Now
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span>© 2026 CryptoVest. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
