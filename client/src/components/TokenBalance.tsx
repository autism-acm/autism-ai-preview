import { Card, CardContent } from '@/components/ui/card';
import { Coins, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TokenBalanceProps {
  balance?: number;
  tier?: 'Free Trial' | 'Electrum' | 'Pro' | 'Gold';
}

export default function TokenBalance({ balance = 0, tier = 'Free Trial' }: TokenBalanceProps) {
  const formatBalance = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Gold':
        return 'bg-primary text-primary-foreground';
      case 'Pro':
        return 'bg-accent text-accent-foreground';
      case 'Electrum':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNextTier = () => {
    if (balance >= 300000) return null;
    if (balance >= 200000) return { name: 'Gold', need: 300000 - balance };
    if (balance >= 100000) return { name: 'Pro', need: 200000 - balance };
    return { name: 'Electrum', need: 100000 - balance };
  };

  const nextTier = getNextTier();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">$AU Balance</p>
                <p className="text-2xl font-bold tracking-tight-custom" data-testid="text-token-balance">
                  {formatBalance(balance)}
                </p>
              </div>
            </div>
            <Badge className={getTierColor(tier)} data-testid="badge-current-tier">
              {tier}
            </Badge>
          </div>

          {nextTier && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Upgrade to {nextTier.name}</p>
                <p className="text-xs text-muted-foreground">
                  Hold {formatBalance(nextTier.need)} more $AU tokens
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 text-xs text-muted-foreground">
            <p>Token Address: B1oE...pump</p>
            <p className="mt-1">Prices may increase</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
