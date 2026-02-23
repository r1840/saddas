'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { BarChart3, LayoutPanel, Shield, TrendingUp, Wallet } from 'lucide-react';

interface MobileBottomNavProps {
  current: 'dashboard' | 'markets' | 'trade' | 'portfolio' | 'admin';
  isAdmin?: boolean;
}

export function MobileBottomNav({ current, isAdmin = false }: MobileBottomNavProps) {
  const items = useMemo(() => {
    const base = [
      { key: 'dashboard', label: 'Start', href: '/dashboard', icon: LayoutPanel },
      { key: 'markets', label: 'Rynki', href: '/markets', icon: BarChart3 },
      { key: 'trade', label: 'Handel', href: '/trade?coin=bitcoin', icon: TrendingUp },
      { key: 'portfolio', label: 'Portfel', href: '/portfolio', icon: Wallet },
    ] as const;

    if (isAdmin) {
      return [...base.slice(0, 4), { key: 'admin', label: 'Admin', href: '/admin', icon: Shield }] as const;
    }

    return base;
  }, [isAdmin]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = current === item.key;
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.href} className="flex-1">
              <div className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
