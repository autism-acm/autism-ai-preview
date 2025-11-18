import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TierCardProps {
  name: string;
  requirement?: string;
  messagesPerHour: number | string;
  voiceHoursPerDay: number | string;
  duration?: string;
  isCurrentTier?: boolean;
  isUpgrade?: boolean;
}

export default function TierCard({
  name,
  requirement,
  messagesPerHour,
  voiceHoursPerDay,
  duration,
  isCurrentTier = false,
  isUpgrade = false
}: TierCardProps) {
  const tierColors = {
    'Free Trial': 'secondary',
    'Electrum': 'accent',
    'Pro': 'primary',
    'Gold': 'primary'
  } as const;

  const tierVariant = tierColors[name as keyof typeof tierColors] || 'secondary';

  return (
    <Card className={`relative bg-[#000000] border-[#ffffff14] ${isCurrentTier ? 'ring-2 ring-primary' : ''}`}>
      {isCurrentTier && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default" data-testid={`badge-current-${name.toLowerCase().replace(' ', '-')}`}>
            Current Tier
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-white/90">
          <span className="tracking-tight-custom">{name}</span>
          {name === 'Gold' && <Badge variant="default" className="gap-1"><Coins className="h-3 w-3" />Premium</Badge>}
        </CardTitle>
        {requirement && (
          <CardDescription className="text-base font-medium text-white/80" data-testid={`text-requirement-${name.toLowerCase().replace(' ', '-')}`}>
            {requirement}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-md bg-primary/10 shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-white/90" data-testid={`text-messages-${name.toLowerCase().replace(' ', '-')}`}>
              {messagesPerHour} {typeof messagesPerHour === 'number' ? 'messages/hour' : ''}
            </div>
            <div className="text-sm text-[#ffffff80]">Message quota</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-md bg-accent/10 shrink-0">
            <Mic className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="font-semibold text-white/90" data-testid={`text-voice-${name.toLowerCase().replace(' ', '-')}`}>
              {voiceHoursPerDay} {typeof voiceHoursPerDay === 'number' ? 'hours/day' : ''}
            </div>
            <div className="text-sm text-[#ffffff80]">Voice chat time</div>
          </div>
        </div>
      </CardContent>

      {isUpgrade && (
        <CardFooter>
          <Button 
            className="w-full bg-[#202020] text-white hover:bg-[#303030] border-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]" 
            data-testid={`button-upgrade-${name.toLowerCase().replace(' ', '-')}`}
          >
            {requirement ? `Hold ${requirement}` : 'Get Started'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
