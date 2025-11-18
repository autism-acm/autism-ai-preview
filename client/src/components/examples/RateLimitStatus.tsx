import RateLimitStatus from '../RateLimitStatus';

export default function RateLimitStatusExample() {
  return (
    <div className="p-8 grid gap-6 md:grid-cols-2">
      <RateLimitStatus 
        messagesUsed={2}
        messagesMax={5}
        voiceMinutesUsed={15}
        voiceMinutesMax={60}
      />
      <RateLimitStatus 
        messagesUsed={18}
        messagesMax={20}
        voiceMinutesUsed={45}
        voiceMinutesMax={60}
      />
    </div>
  );
}
