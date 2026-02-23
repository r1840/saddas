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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div classNazwa="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div classNazwa="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div classNazwa="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(69,92,255,0.08),transparent_50%)]" />
      
      <Card classNazwa="w-full max-w-md relative border-2 shadow-xl">
        <CardHeader classNazwa="space-y-3 pb-6">
          <Link href="/" classNazwa="flex items-center justify-center gap-2 mb-2">
            <div classNazwa="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp classNazwa="w-5 h-5 text-primary-foreground" />
            </div>
            <span classNazwa="text-2xl font-bold">CryptoVest</span>
          </Link>
          <CardTitle classNazwa="text-3xl font-bold text-center">
            Get started
          </CardTitle>
          <CardDescription classNazwa="text-center text-base">
            Create your account to start trading cryptocurrencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} classNazwa="space-y-5">
            {error && (
              <Alert variant="destructive" classNazwa="border-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div classNazwa="space-y-2">
              <Label htmlFor="username" classNazwa="text-sm font-semibold">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                classNazwa="h-11 border-2"
              />
            </div>

            <div classNazwa="space-y-2">
              <Label htmlFor="email" classNazwa="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                classNazwa="h-11 border-2"
              />
            </div>

            <div classNazwa="space-y-2">
              <Label htmlFor="password" classNazwa="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                classNazwa="h-11 border-2"
              />
            </div>

            <div classNazwa="space-y-2">
              <Label htmlFor="dob" classNazwa="text-sm font-semibold">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                disabled={loading}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                classNazwa="h-11 border-2"
              />
              <p classNazwa="text-xs text-muted-foreground">
                You must be 18 or older to create an account
              </p>
            </div>

            <div classNazwa="space-y-2">
              <Label htmlFor="promoCode" classNazwa="text-sm font-semibold">Promo Code (Optional)</Label>
              <div classNazwa="relative">
                <Input
                  id="promoCode"
                  type="text"
                  placeholder='Enter code "BONUS" for 15% bonus'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  classNazwa="h-11 border-2 pr-20"
                />
                {promoCode === 'BONUS' && (
                  <div classNazwa="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-success text-xs font-bold">
                    <CheckCircle2 classNazwa="w-4 h-4" />
                    <span>Valid</span>
                  </div>
                )}
              </div>
              <p classNazwa="text-xs text-muted-foreground">
                Get 15% bonus on your first deposit with code BONUS
              </p>
            </div>

            <div classNazwa="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                disabled={loading}
                classNazwa="mt-1 w-4 h-4"
              />
              <Label htmlFor="terms" classNazwa="text-sm leading-relaxed cursor-pointer font-normal">
                {'I agree to the '}
                <Link href="/terms" classNazwa="text-primary hover:underline font-semibold" target="_blank">
                  Terms of Service
                </Link>
                {' and '}
                <Link href="/privacy" classNazwa="text-primary hover:underline font-semibold" target="_blank">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" classNazwa="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading || !agreedToTerms}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div classNazwa="mt-6 text-center text-sm">
            <span classNazwa="text-muted-foreground">{'Already have an account? '}</span>
            <Link href="/login" classNazwa="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
