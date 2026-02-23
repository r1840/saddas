import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, TrendingUp, Shield, Lightbulb, Target, BarChart3 } from 'lucide-react';

export default function NaukaPage() {
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

        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
            Nauka about crypto
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
            Build your crypto knowledge and start your investment journey with confidence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">What is cryptocurrency?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cryptocurrency is a digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit or double-spend.
              </p>
              <Badge variant="secondary">Beginner</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-xl">How to buy crypto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nauka the step-by-step process of purchasing cryptocurrency, from creating an account to executing your first trade.
              </p>
              <Badge variant="secondary">Beginner</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Crypto security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Understand best practices for keeping your cryptocurrency safe, including secure storage and account protection.
              </p>
              <Badge variant="secondary">Beginner</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-xl">Reading charts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Master the art of reading price charts and understanding market trends to make informed trading decisions.
              </p>
              <Badge>Intermediate</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Trading strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Explore different trading strategies including day trading, swing trading, and long-term holding approaches.
              </p>
              <Badge>Intermediate</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-xl">Portfel management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nauka how to build a diversified portfolio, manage risk, and optimize your cryptocurrency investments.
              </p>
              <Badge>Advanced</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-8 md:p-12 text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold text-balance">
            Ready to put your knowledge into practice?
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Start trading and build your crypto portfolio with CryptoVest today
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Create Free Account
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
