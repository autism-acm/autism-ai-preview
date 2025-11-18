import ChatInterface from '../ChatInterface';

export default function ChatInterfaceExample() {
  return (
    <div className="h-screen">
      <ChatInterface remainingMessages={5} maxMessages={5} />
    </div>
  );
}
