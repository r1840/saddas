'use client';

import React from "react"
import { TrendingUp, CheckCircle2 } from 'lucide-react'; // Import TrendingUp and CheckCircle2 components

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setNazwa użytkownika] = useState('');
  const [email, setE-mail] = useState('');
  const [password, setHasło] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('[app] Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(69,92,255,0.08),transparent_50%)]" />
      
      <Card className="w-full max-w-md relative border-2 shadow-xl">
        <CardHeader className="space-y-3 pb-6">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">CryptoVest</span>
          </Link>
          <CardTitle className="text-3xl font-bold text-center">
            Get started
          </CardTitle>
          <CardDescription className="text-center text-base">
            Utwórz konto, aby zacząć handlować kryptowalutami
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">Nazwa użytkownika</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setNazwa użytkownika(e.target.value)}
                required
                disabled={loading}
                className="h-11 border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setE-mail(e.target.value)}
                required
                disabled={loading}
                className="h-11 border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="Utwórz hasło (min. 6 znaków)"
                value={password}
                onChange={(e) => setHasło(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="h-11 border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-semibold">Data urodzenia</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                disabled={loading}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className="h-11 border-2"
              />
              <p className="text-xs text-muted-foreground">
                You must be 18 or older to create an account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoCode" className="text-sm font-semibold">Kod promocyjny (opcjonalnie)</Label>
              <div className="relative">
                <Input
                  id="promoCode"
                  type="text"
                  placeholder='Enter code "BONUS" for 15% bonus'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="h-11 border-2 pr-20"
                />
                {promoCode === 'BONUS' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-success text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Get 15% bonus on your first deposit with code BONUS
              </p>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                disabled={loading}
                className="mt-1 w-4 h-4"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-normal">
                {'Akceptuję '}
                <Link href="/terms" className="text-primary hover:underline font-semibold" target="_blank">
                  Regulamin
                </Link>
                {' and '}
                <Link href="/privacy" className="text-primary hover:underline font-semibold" target="_blank">
                  Polityka prywatności
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading || !agreedToTerms}>
              {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{'Masz już konto? '}</span>
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
