'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Shield, Trash2, DollarSign, TrendingUp, Zap, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Copy, X, Menu, Bot } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  auto_trading_enabled?: boolean;
}

interface Portfolio {
  userId: string;
  cash: string;
  holdings: Record<string, any>;
}

interface Pump {
  id: string;
  userId: string;
  coinId: string;
  percentage: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  completedPercentage: number;
  isActive: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(2);
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + formatNumber(num);
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [portfolios, setPortfolios] = useState<Record<string, Portfolio>>({});
  const [activePumps, setActivePumps] = useState<Record<string, Pump>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [assetType, setAssetType] = useState('cash');
  const [updating, setUpdating] = useState(false);
  const [pumpDialogOpen, setPumpDialogOpen] = useState(false);
  const [pumpUserId, setPumpUserId] = useState<string | null>(null);
  const [pumpCoinId, setPumpCoinId] = useState('');
  const [pumpPercentage, setPumpPercentage] = useState('');
  const [pumpDuration, setPumpDuration] = useState('');
  const [pumping, setPumping] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawUserId, setWithdrawUserId] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCrypto, setWithdrawCrypto] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const cryptoAddresses = {
    btc: { name: 'Bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    eth: { name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
  };

  useEffect(() => {
    async function loadAdmin() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }

        const sessionData = await sessionRes.json();
        if (!sessionData.user.isAdmin) {
          router.push('/dashboard');
          return;
        }

        const usersRes = await fetch('/api/admin/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);

          const portfolioPromises = usersData.map(async (user: User) => {
            const portfolioRes = await fetch(`/api/portfolio?userId=${user.id}`);
            if (portfolioRes.ok) {
              const portfolio = await portfolioRes.json();
              return { userId: user.id, portfolio };
            }
            return null;
          });

          const portfolioResults = await Promise.all(portfolioPromises);
          const portfolioMap: Record<string, Portfolio> = {};
          portfolioResults.forEach((result) => {
            if (result) {
              portfolioMap[result.userId] = result.portfolio;
            }
          });
          setPortfolios(portfolioMap);

          const pumpRes = await fetch('/api/pump/status');
          if (pumpRes.ok) {
            const pumpData = await pumpRes.json();
            const pumpMap: Record<string, Pump> = {};
            pumpData.pumps.forEach((pump: Pump) => {
              pumpMap[pump.userId] = pump;
            });
            setActivePumps(pumpMap);
          }
        }
      } catch (err) {
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();

    const interval = setInterval(loadAdmin, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteUserId }),
      });

      if (!response.ok) {
        setError('Failed to delete user');
        return;
      }

      setUsers(users.filter((u) => u.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (err) {
      setError('An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUserId || newBalance === '') return;

    setUpdating(true);
    setError('');

    try {
      const response = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, amount: newBalance, assetType }),
      });

      if (!response.ok) {
        setError('Failed to update balance');
        return;
      }

      const data = await response.json();
      setPortfolios({ ...portfolios, [selectedUserId]: data.portfolio });
      setBalanceDialogOpen(false);
      setSelectedUserId(null);
      setNewBalance('');
      setAssetType('cash');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const openBalanceDialog = (userId: string) => {
    setSelectedUserId(userId);
    setNewBalance(portfolios[userId]?.cash || '0.00');
    setBalanceDialogOpen(true);
  };

  const openPumpDialog = (userId: string) => {
    setPumpUserId(userId);
    setPumpCoinId('');
    setPumpPercentage('');
    setPumpDuration('');
    setPumpDialogOpen(true);
  };

  const handlePump = async () => {
    if (!pumpUserId || !pumpCoinId || !pumpPercentage || !pumpDuration) return;

    setPumping(true);
    setError('');

    try {
      const response = await fetch('/api/admin/pump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pumpUserId,
          coinId: pumpCoinId,
          percentage: parseFloat(pumpPercentage),
          durationMinutes: parseFloat(pumpDuration),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to start pump');
        setPumping(false);
        return;
      }

      const pumpData = await response.json();
      setActivePumps({ ...activePumps, [pumpUserId]: pumpData.pump });

      setPumpDialogOpen(false);
      setPumpUserId(null);
      setPumpCoinId('');
      setPumpPercentage('');
      setPumpDuration('');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setPumping(false);
    }
  };

  const canPump = (userId: string) => {
    const portfolio = portfolios[userId];
    if (!portfolio) return false;
    const hasHoldings = Object.keys(portfolio.holdings).length > 0;
    const hasBalance = parseFloat(portfolio.cash) > 0;
    return hasHoldings || hasBalance;
  };

  const getUserCoins = (userId: string): string[] => {
    const portfolio = portfolios[userId];
    if (!portfolio) return [];
    return Object.keys(portfolio.holdings).filter(
      (coinId) => parseFloat(portfolio.holdings[coinId].amount) > 0
    );
  };

  const handleCancelPump = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/pump/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const newPumps = { ...activePumps };
        delete newPumps[userId];
        setActivePumps(newPumps);
      }
    } catch (err) {
    }
  };

  const hasActivePump = (userId: string): boolean => {
    return !!activePumps[userId];
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const openDepositDialog = (userId: string) => {

  };

  const openWithdrawDialog = (userId: string) => {

  };

  const copyToClipboard = (text: string) => {

  };

  const getUserCryptoHoldings = (userId: string): { coinId: string, amount: string }[] => {
    const portfolio = portfolios[userId];
    if (!portfolio) return [];
    return Object.entries(portfolio.holdings).map(([coinId, holding]) => ({
      coinId,
      amount: holding.amount,
    }));
  };

  const handleWithdraw = async () => {
    if (!withdrawUserId || !withdrawCrypto || !withdrawAmount || !withdrawAddress) return;

    setWithdrawing(true);
    setError('');

    try {
      const response = await fetch('/api/admin/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: withdrawUserId,
          coinId: withdrawCrypto,
          amount: parseFloat(withdrawAmount),
          address: withdrawAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to withdraw');
        return;
      }

      setWithdrawSuccess(true);

    } catch (err) {
      setError('An error occurred');
    } finally {
      setWithdrawing(false);
    }
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

  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.isAdmin).length;
  const regularUsers = totalUsers - adminUsers;

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
                <Button variant="ghost" className="font-medium">Dashboard</Button>
              </Link>
              <Link href="/trade">
                <Button variant="ghost" className="font-medium">Trade</Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="ghost" className="font-medium">Portfolio</Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" className="font-medium">Admin</Button>
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex">
            <Button variant="outline" onClick={handleLogout}>
              Logout
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
                <Button variant="ghost" className="w-full justify-start h-10">Dashboard</Button>
              </Link>
              <Link href="/trade" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-10">Trade</Button>
              </Link>
              <Link href="/portfolio" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-10">Portfolio</Button>
              </Link>
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-10">Admin</Button>
              </Link>
              <div className="pt-2 mt-1 border-t border-border">
                <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent h-10">
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Admin Panel</h2>
            <p className="text-muted-foreground mt-1">Manage users and monitor activity</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                With admin privileges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regular Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regularUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Standard accounts
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                      Username
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                      Role
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-sm text-muted-foreground">
                      Balance
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
                      Created
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-sm text-muted-foreground">
                      Auto Trading
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-sm text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-2 font-medium">{user.username}</td>
                      <td className="py-4 px-2 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.username}</p>
                              {hasActivePump(user.id) && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary animate-pulse flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  LIVE PUMP
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {portfolios[user.id] ? (
                          <div className="space-y-1">
                            <div className="font-semibold">
                              Cash: {formatCurrency(portfolios[user.id].cash)}
                            </div>
                            {portfolios[user.id].holdings && Object.keys(portfolios[user.id].holdings).length > 0 && (
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                {Object.entries(portfolios[user.id].holdings)
                                  .filter(([_, holding]) => {
                                    const holdingData = holding as { amount?: string } | string;
                                    const amountStr = typeof holdingData === 'object' ? holdingData.amount : holdingData;
                                    const numAmount = parseFloat(amountStr || '0');
                                    return !isNaN(numAmount) && numAmount > 0;
                                  })
                                  .map(([coinId, holding]) => {
                                    const holdingData = holding as { amount?: string } | string;
                                    const amountStr = typeof holdingData === 'object' ? holdingData.amount : holdingData;
                                    const numAmount = parseFloat(amountStr || '0');
                                    const displayName = coinId.charAt(0).toUpperCase() + coinId.slice(1);
                                    return (
                                      <div key={coinId}>
                                        {displayName}: {formatNumber(numAmount)}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">$0</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {user.auto_trading_enabled ? (
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <Bot className="w-4 h-4 text-success" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex gap-2 justify-end">
                          {hasActivePump(user.id) ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelPump(user.id)}
                              title="Cancel active pump"
                            >
                              Cancel Pump
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPumpDialog(user.id)}
                              disabled={!canPump(user.id)}
                              title={!canPump(user.id) ? 'User needs holdings to pump' : 'Pump portfolio'}
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBalanceDialog(user.id)}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteUserId(user.id)}
                            disabled={user.isAdmin}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Note:</strong> Admin users cannot be deleted from the panel. Only regular user accounts can be removed.
          </AlertDescription>
        </Alert>
      </main>

      <Dialog open={pumpDialogOpen} onOpenChange={setPumpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Pump Portfolio
            </DialogTitle>
            <DialogDescription>
              Gradually increase a cryptocurrency holding over time. Select the coin, percentage increase, and duration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coin">Select Cryptocurrency</Label>
              <Select value={pumpCoinId} onValueChange={setPumpCoinId} disabled={pumping}>
                <SelectTrigger id="coin">
                  <SelectValue placeholder="Choose a coin" />
                </SelectTrigger>
                <SelectContent>
                  {pumpUserId && getUserCoins(pumpUserId).length > 0 ? (
                    getUserCoins(pumpUserId).map((coinId) => (
                      <SelectItem key={coinId} value={coinId}>
                        {coinId.toUpperCase()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No holdings available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Pump Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                step="1"
                min="1"
                max="1000"
                placeholder="e.g., 400"
                value={pumpPercentage}
                onChange={(e) => setPumpPercentage(e.target.value)}
                disabled={pumping}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                step="1"
                min="1"
                placeholder="e.g., 60"
                value={pumpDuration}
                onChange={(e) => setPumpDuration(e.target.value)}
                disabled={pumping}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPumpDialogOpen(false)}
              disabled={pumping}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePump}
              disabled={pumping || !pumpCoinId || !pumpPercentage || !pumpDuration}
              className="bg-primary"
            >
              {pumping ? 'Starting...' : 'Start Pump'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Add to User Balance
            </DialogTitle>
            <DialogDescription>
              Add cash or crypto to this user's account. Select the asset type and enter the amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select value={assetType} onValueChange={setAssetType} disabled={updating}>
                <SelectTrigger id="assetType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash (USD)</SelectItem>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                  <SelectItem value="sol">Solana (SOL)</SelectItem>
                  <SelectItem value="bnb">Binance Coin (BNB)</SelectItem>
                  <SelectItem value="xrp">Ripple (XRP)</SelectItem>
                  <SelectItem value="ada">Cardano (ADA)</SelectItem>
                  <SelectItem value="doge">Dogecoin (DOGE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">
                {assetType === 'cash' ? 'Amount ($)' : `Amount (${assetType.toUpperCase()})`}
              </Label>
              <Input
                id="balance"
                type="number"
                step={assetType === 'cash' ? '0.01' : '0.00000001'}
                min="0"
                placeholder={assetType === 'cash' ? '0.00' : '0.00000000'}
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                disabled={updating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBalanceDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance} disabled={updating || newBalance === ''}>
              {updating ? 'Adding...' : 'Add to Balance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action will permanently remove
              their account, portfolio, and transaction history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
