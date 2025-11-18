import WalletButton from './WalletButton';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onUpgradeClick?: () => void;
}

export default function Header({ onUpgradeClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <a href="https://app.autism.gold/" className="flex-shrink-0">
            <img src="/autism-ai.png" alt="Autism AI" className="w-10 h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
          </a>
          <div>
            <h1 className="text-xl font-bold tracking-tight-custom" data-testid="text-app-title">
              AUtism GOLD
            </h1>
            <p className="text-xs gradient-gold" style={{ letterSpacing: '-0.06em' }}>
              Powered by Autism Capital Markets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUpgradeClick}
            data-testid="button-upgrade"
          >
            Upgrade
          </Button>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
