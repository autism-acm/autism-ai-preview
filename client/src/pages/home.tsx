import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import InfoSidebar from '@/components/InfoSidebar';
import UpgradeModal from '@/components/UpgradeModal';
import WelcomePopup from '@/components/WelcomePopup';
import { useSession } from '@/hooks/use-session';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [infoSidebarCollapsed, setInfoSidebarCollapsed] = useState(true);
  const [chatSidebarCollapsed, setChatSidebarCollapsed] = useState(true);
  const { data: session, isLoading } = useSession();

  // Calculate sidebar width based on viewport - matches CSS clamp
  const getSidebarWidth = () => {
    if (typeof window === 'undefined') return 256;
    const vwWidth = window.innerWidth * 0.16;
    return Math.min(Math.max(vwWidth, 200), 256);
  };


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tier = (session?.tier || 'Free Trial') as "Free Trial" | "Electrum" | "Pro" | "Gold";
  const messagesRemaining = session?.messageLimit?.remaining || 0;
  const messagesLimit = session?.messageLimit?.limit || 5;
  const voiceRemaining = session?.voiceLimit?.remaining || 0;
  const voiceLimit = session?.voiceLimit?.limit || 60;
  const resetTime = session?.messageLimit?.resetTime ? new Date(session.messageLimit.resetTime) : new Date();

  return (
    <div className="flex h-screen bg-black relative">
      {/* InfoSidebar toggle button - centered vertically on LEFT */}
      <div className="fixed top-1/2 -translate-y-1/2 z-50 hidden xl:block" style={{ left: '4px' }}>
        <button
          onClick={() => setInfoSidebarCollapsed(!infoSidebarCollapsed)}
          className="relative bg-[#303030] hover:bg-[#404040] rounded-full p-1 transition-colors"
          style={{
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(#303030, #303030), linear-gradient(135deg, #efbf04, #d4af37, #7a6100)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          {infoSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-300" />
          )}
        </button>
      </div>
      
      {/* Chat sidebar toggle button - aligned to bottom matching chatbox on RIGHT */}
      <div className="fixed bottom-4 z-50 hidden xl:block" style={{ right: '4px' }}>
        <button
          onClick={() => setChatSidebarCollapsed(!chatSidebarCollapsed)}
          className="bg-[#303030] hover:bg-[#404040] border border-[#505050] rounded-full p-1 transition-colors"
        >
          {chatSidebarCollapsed ? (
            <ChevronLeft className="h-4 w-4 text-gray-300" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          )}
        </button>
      </div>
      
      <InfoSidebar 
        isCollapsed={infoSidebarCollapsed} 
        tier={tier}
        tokenBalance={session?.tokenBalance || 0}
        onUpgradeClick={() => setUpgradeModalOpen(true)}
        messagesRemaining={messagesRemaining}
        maxMessages={messagesLimit}
      />
      
      <Sidebar 
        infoSidebarWidth={0}
        isInfoSidebarCollapsed={true}
        isCollapsed={chatSidebarCollapsed}
        onUpgradeClick={() => setUpgradeModalOpen(true)}
      />
      
      <main 
        className="flex-1 flex flex-col transition-all duration-300 px-4 pt-16 xl:pt-0"
        data-info-collapsed={infoSidebarCollapsed}
        data-chat-collapsed={chatSidebarCollapsed}
      >
        <ChatInterface 
          remainingMessages={messagesRemaining} 
          maxMessages={messagesLimit} 
        />
      </main>

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      <WelcomePopup />
    </div>
  );
}
