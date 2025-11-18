import TierCard from '../TierCard';

export default function TierCardExample() {
  return (
    <div className="p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <TierCard 
        name="Free Trial"
        messagesPerHour="5 messages"
        voiceHoursPerDay="1 voice message"
        isCurrentTier={true}
      />
      <TierCard 
        name="Electrum"
        requirement="100k $AU"
        messagesPerHour={20}
        voiceHoursPerDay={1}
        duration="14 days"
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
  );
}
