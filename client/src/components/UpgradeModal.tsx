import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TierCard from './TierCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      <style>{`
        [data-radix-dialog-overlay] {
          backdrop-filter: blur(4px);
        }
        .upgrade-modal-content::-webkit-scrollbar {
          display: none;
        }
        .upgrade-modal-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .upgrade-modal-content > button {
          background-color: #202020 !important;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15) !important;
          opacity: 1 !important;
          border-radius: 4px !important;
        }
        .upgrade-modal-content > button:hover {
          background-color: #2a2a2a !important;
        }
        .upgrade-modal-content > button svg {
          color: rgba(255, 255, 255, 0.39) !important;
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className={`upgrade-modal-content ${
            isMobile 
              ? 'max-w-[90vw] rounded-[24px]' 
              : 'max-w-6xl'
            } max-h-[90vh] overflow-y-auto bg-[#000000] border-[#ffffff14]`}
        >
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight-custom text-white/90">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-white/80">
            Hold more $AU tokens to unlock premium features and higher limits
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-[#ffffff0a] border-[#ffffff14]">
          <Info className="h-4 w-4 text-white/64" />
          <AlertDescription className="text-white/80">
            Prices may increase. Lock in your tier by holding the required $AU tokens.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TierCard 
            name="Free Trial"
            messagesPerHour="5 every 4 hours"
            voiceHoursPerDay="1 voice message every 4 hours"
            isCurrentTier={true}
          />
          <TierCard 
            name="Electrum"
            requirement="100k $AU"
            messagesPerHour={20}
            voiceHoursPerDay={1}
            isUpgrade={true}
          />
          <TierCard 
            name="Pro"
            requirement="200k $AU"
            messagesPerHour={40}
            voiceHoursPerDay={2}
            isUpgrade={true}
          />
          <TierCard 
            name="Gold"
            requirement="300k $AU"
            messagesPerHour={50}
            voiceHoursPerDay={4}
            isUpgrade={true}
          />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
