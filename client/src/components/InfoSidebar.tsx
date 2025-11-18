import { Button } from '@/components/ui/button';

interface InfoSidebarProps {
  isCollapsed: boolean;
  tier: string;
  tokenBalance: number;
  onUpgradeClick?: () => void;
  messagesRemaining?: number;
  maxMessages?: number;
}

export default function InfoSidebar({ isCollapsed, tier, tokenBalance = 0, onUpgradeClick, messagesRemaining = 5, maxMessages = 5 }: InfoSidebarProps) {
  const formatBalance = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  const getNextTier = () => {
    if (tokenBalance >= 300000) return null;
    if (tokenBalance >= 200000) return { name: 'Gold', need: 300000 - tokenBalance };
    if (tokenBalance >= 100000) return { name: 'Pro', need: 200000 - tokenBalance };
    return { name: 'Electrum', need: 100000 - tokenBalance };
  };

  const nextTier = getNextTier();

  return (
    <aside
      className="hidden xl:flex fixed z-20 transition-all duration-300"
      style={{
        left: '8px',
        top: '8px',
        bottom: '8px',
        width: isCollapsed ? '0' : 'clamp(200px, 16vw, 256px)',
        pointerEvents: isCollapsed ? 'none' : 'auto'
      }}
    >
      <div 
        className="w-full bg-[#202020] transition-all duration-300"
        style={{
          opacity: isCollapsed ? 0 : 1,
          transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div className={`h-full flex flex-col`}>
        {/* Logo and Branding */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#404040]">
          <a href="https://app.autism.gold/" className="flex-shrink-0">
            <img src="/autism-ai.png" alt="Autism AI" className="w-12 h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
          </a>
          <div className="flex flex-col">
            <span className="text-[0.65rem] text-gray-400">Powered by</span>
            <span className="text-[0.85rem] font-semibold gradient-gold leading-tight" style={{ letterSpacing: '-0.06em' }}>
              Autism Capital Markets
            </span>
          </div>
        </div>

        {/* DiGen App Button */}
        <div className="border-b border-[#404040] relative">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-xs text-white/80 bg-white/10 border border-white/20 rounded-[24px] backdrop-blur-sm px-3"
            style={{ 
              maxWidth: '90%',
              paddingTop: '6px',
              paddingBottom: '6px'
            }}
          >
            11/22
          </div>
          <button 
            className="w-full flex items-center justify-center border border-[#00B487] bg-[#B8E5DA] shadow-[inset_0_2px_4px_rgba(250,249,246,0.15)] hover-elevate active-elevate-2 backdrop-blur-sm"
            style={{ padding: '12px 0' }}
            data-testid="button-digen-app"
          >
            <img src="/digen_logo.png" alt="DiGen" className="h-6 object-contain" />
          </button>
        </div>

        {/* Flexible spacer */}
        <div className="flex-1" />

        {/* Token Balance and Upgrade Section - Aligned to bottom */}
        <div className="mt-auto p-4 border-t border-[#404040] space-y-4">
          {/* Current Tier and Balance */}
          <div>
            <p className="text-xs text-gray-400 mb-1">$AU Balance</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatBalance(tokenBalance)}
            </p>
            <p className="text-sm text-gray-300 mt-1">{tier}</p>
            <p className="text-xs text-gray-400 mt-1">{messagesRemaining}/{maxMessages} Messages • 1/1 hours</p>
          </div>

          {/* Upgrade Info - This section is aligned to bottom */}
          {nextTier && (
            <div className="bg-[#303030] rounded-lg p-3 border border-[#404040]">
              <p className="text-sm font-medium text-white mb-1">Upgrade to {nextTier.name}</p>
              <p className="text-xs text-gray-400">
                Hold {formatBalance(nextTier.need)} more $AU tokens to unlock higher limits
              </p>
            </div>
          )}

          {/* Upgrade Button */}
          <Button
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-br from-[#efbf04] to-[#7a6100] hover:opacity-90 text-black font-semibold border-0"
          >
            Upgrade
          </Button>

          {/* Token Info */}
          <div className="pt-2 text-xs text-gray-400 space-y-1">
            <p>Token Address: B1oE...pump</p>
            <p>Prices may increase</p>
          </div>
        </div>
        </div>
      </div>
    </aside>
  );
}
