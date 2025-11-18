import { Progress } from '@/components/ui/progress';
import { MessageSquare, Mic, Clock } from 'lucide-react';

interface RateLimitStatusProps {
  messagesUsed?: number;
  messagesMax?: number;
  voiceMinutesUsed?: number;
  voiceMinutesMax?: number;
  resetTime?: Date;
}

export default function RateLimitStatus({
  messagesUsed = 2,
  messagesMax = 5,
  voiceMinutesUsed = 0,
  voiceMinutesMax = 60,
  resetTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
}: RateLimitStatusProps) {
  const messageProgress = (messagesUsed / messagesMax) * 100;
  const voiceProgress = (voiceMinutesUsed / voiceMinutesMax) * 100;

  const getTimeUntilReset = () => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight-custom">Usage Status</h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span data-testid="text-reset-time">Resets in {getTimeUntilReset()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Messages</span>
            </div>
            <span className="font-medium" data-testid="text-messages-used">
              {messagesUsed}/{messagesMax}
            </span>
          </div>
          <Progress value={messageProgress} className="h-2" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-accent" />
              <span>Voice Time</span>
            </div>
            <span className="font-medium" data-testid="text-voice-used">
              {voiceMinutesUsed}/{voiceMinutesMax} min
            </span>
          </div>
          <Progress value={voiceProgress} className="h-2" />
        </div>
      </div>
    </div>
  );
}
