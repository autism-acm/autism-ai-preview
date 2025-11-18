import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, MessageSquare, Coins } from 'lucide-react';

const WELCOME_SEEN_KEY = 'autism-ai-welcome-seen';

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl bg-[#000000] border-2 border-[#efbf04] text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            <span className="gradient-gold">Welcome to AUtism GOLD!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-white/90 text-lg">
            Your AI-powered assistant in the Web3 ecosystem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 bg-[#ffffff0a] rounded-lg border border-[#ffffff14]">
              <div className="p-2 bg-[#efbf04] rounded-lg">
                <MessageSquare className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Chat Assistant</h3>
                <p className="text-sm text-white/80">
                  Get help with meme coins, trading insights, homework, and more with AI personas tailored to your needs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#ffffff0a] rounded-lg border border-[#ffffff14]">
              <div className="p-2 bg-[#efbf04] rounded-lg">
                <Coins className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Token-Based Tiers</h3>
                <p className="text-sm text-white/80">
                  Hold $AU tokens to unlock higher message limits and premium features
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#ffffff0a] rounded-lg border border-[#ffffff14]">
              <div className="p-2 bg-[#efbf04] rounded-lg">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multiple AI Personalities</h3>
                <p className="text-sm text-white/80">
                  Choose from AUtistic AI, Level 1 ASD, or Savantist for different use cases
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#ffffff0a] rounded-lg border border-[#ffffff14]">
              <div className="p-2 bg-[#efbf04] rounded-lg">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Web3 Integration</h3>
                <p className="text-sm text-white/80">
                  Connect your Solana wallet to access exclusive features and track your holdings
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#efbf04]/10 border border-[#efbf04] rounded-lg p-4 text-center">
            <p className="text-sm text-white/90">
              <strong className="gradient-gold">Free Trial:</strong> Start with 5 messages every 4 hours. 
              Upgrade by holding more $AU tokens for higher limits!
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleClose}
            className="bg-[#efbf04] hover:bg-[#d4af37] text-black font-semibold px-8 py-2 text-lg"
          >
            Let's Go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
