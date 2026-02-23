import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, TrendingUp, Shield, Lightbulb, Target, BarChart3 } from 'lucide-react';

export default function NaukaPage() {
  return (
    <div classNazwa="min-h-screen bg-background">
      <header classNazwa="border-b border-border bg-card">
        <div classNazwa="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" classNazwa="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div classNazwa="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <TrendingUp classNazwa="w-4 h-4 text-primary-foreground" />
            </div>
            <span classNazwa="text-xl font-bold">CryptoVest</span>
          </Link>
          <div classNazwa="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </Link>
            <Link href="/register">
              <Button>Zacznij</Button>
            </Link>
          </div>
        </div>
      </header>

      <main classNazwa="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" classNazwa="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft classNazwa="w-4 h-4" />
          Powrót do strony głównej
        </Link>

        <div classNazwa="mb-12">
          <h1 classNazwa="text-4xl md:text-6xl font-bold mb-4 text-balance">
            Nauka about crypto
          </h1>
          <p classNazwa="text-xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
            Build your crypto knowledge and start your investment journey with confidence
          </p>
        </div>

        <div classNazwa="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card classNazwa="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div classNazwa="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen classNazwa="w-6 h-6 text-primary" />
              </div>
              <CardTitle classNazwa="text-xl">What is cryptocurrency?</CardTitle>
            </CardHeader>
            <CardContent>
              <p classNazwa="text-muted-foreground leading-relaxed mb-4">
                Cryptocurrency is a digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit or double-spend.
              </p>
              <Badge variant="secondary">Beginner</Badge>
            </CardContent>
          </Card>

          <Card classNazwa="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div classNazwa="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp classNazwa="w-6 h-6 text-success" />
              </div>
              <CardTitle classNazwa="text-xl">How to buy crypto</CardTitle>
            </CardHeader>
            <CardContent>
              <p classNazwa="text-muted-foreground leading-relaxed mb-4">
                Nauka the step-by-step process of purchasing cryptocurrency, from creating an account to executing your first trade.
              </p>
              <Badge variant="secondary">Beginner</Badge>
            </CardContent>
          </Card>

          <Card classNazwa="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div classNazwa="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield classNazwa="w-6 h-6 text-primary" />
              </div>
              <CardTitle classNazwa="text-xl">Crypto security</CardTitle>
            </CardHeader>
            <CardContent>
              <p classNazwa="text-muted-foreground leading-relaxed mb-4">
                Understand best practices for keeping your cryptocurrency safe, including secure storage and account protection.
              </p>
              <Badge variant="secondary">Beginner</Badge>
            </CardContent>
          </Card>

          <Card classNazwa="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div classNazwa="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 classNazwa="w-6 h-6 text-success" />
              </div>
              <CardTitle classNazwa="text-xl">Reading charts</CardTitle>
            </CardHeader>
            <CardContent>
              <p classNazwa="text-muted-foreground leading-relaxed mb-4">
                Master the art of reading price charts and understanding market trends to make informed trading decisions.
              </p>
              <Badge>Intermediate</Badge>
            </CardContent>
          </Card>

          <Card classNazwa="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div classNazwa="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Target classNazwa="w-6 h-6 text-primary" />
              </div>
              <CardTitle classNazwa="text-xl">Trading strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <p classNazwa="text-muted-foreground leading-relaxed mb-4">
                Explore different trading strategies including day trading, swing trading, and long-term holding approaches.
              </p>
              <Badge>Intermediate</Badge>
            </CardContent>
          </Card>

          <Card classNazwa="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div classNazwa="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb classNazwa="w-6 h-6 text-success" />
              </div>
              <CardTitle classNazwa="text-xl">Portfel management</CardTitle>
            </CardHeader>
            <CardContent>
              <p classNazwa="text-muted-foreground leading-relaxed mb-4">
                Nauka how to build a diversified portfolio, manage risk, and optimize your cryptocurrency investments.
              </p>
              <Badge>Advanced</Badge>
            </CardContent>
          </Card>
        </div>

        <div classNazwa="bg-card border-2 border-border rounded-2xl p-8 md:p-12 text-center space-y-6">
          <h3 classNazwa="text-3xl md:text-4xl font-bold text-balance">
            Ready to put your knowledge into practice?
          </h3>
          <p classNazwa="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Start trading and build your crypto portfolio with CryptoVest today
          </p>
          <Link href="/register">
            <Button size="lg" classNazwa="gap-2">
              Create Free Account
              <ArrowLeft classNazwa="w-4 h-4 rotate-180" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
