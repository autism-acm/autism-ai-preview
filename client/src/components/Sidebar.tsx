import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, History } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SidebarProps {
  infoSidebarWidth: number;
  isInfoSidebarCollapsed: boolean;
  isCollapsed: boolean;
  onUpgradeClick?: () => void;
}

export default function Sidebar({ infoSidebarWidth, isInfoSidebarCollapsed, isCollapsed, onUpgradeClick }: SidebarProps) {
  const [memoryBank, setMemoryBank] = useState('');
  const [conversations, setConversations] = useState([
    'Robot revolution',
    'Why she broke up with y...',
    'Your meme portfolio',
    'Carrot cake recipe',
    'AI-generated autism cat'
  ]);

  const isVisible = !isCollapsed;

  return (
    <>
      {/* Desktop Sidebar - Overlay with margins on RIGHT */}
      <aside 
        className="hidden xl:flex fixed top-0 bottom-0 z-20 transition-all duration-300"
        style={{ 
          right: '8px',
          top: '8px',
          bottom: '8px',
          width: isVisible ? 'clamp(200px, 16vw, 256px)' : '0',
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
      >
        <div 
          className="flex flex-col w-full glass-effect p-3 relative transition-all duration-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
            borderRadius: '12px'
          }}
        >
          {/* Content */}

          {/* New Chat Button */}
          <div className="mb-3">
            <Button
              onClick={() => {}}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg justify-start gap-2 backdrop-blur-sm"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto space-y-1 mb-3">
            {conversations.map((conv, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
              >
                {conv}
              </button>
            ))}
          </div>

          {/* Memory Bank */}
          <div className="border-t border-white/10 pt-3 mb-3">
            <h3 className="text-sm font-semibold text-white mb-2">Memory Bank</h3>
            <p className="text-xs text-white/70 mb-2">
              Write everything here you want AUlon to remember
            </p>
            <Textarea
              value={memoryBank}
              onChange={(e) => setMemoryBank(e.target.value)}
              placeholder="Automagically generated; user appears to be a highly autistic individual."
              className="min-h-[80px] bg-white/5 border-white/10 text-white/90 placeholder:text-white/40 text-xs resize-none backdrop-blur-sm"
            />
          </div>

          {/* AUtism Summary */}
          <div className="border-t border-white/10 pt-3">
            <h3 className="text-sm font-semibold text-white mb-2">AUtism Summary</h3>
            <p className="text-xs text-white/70 mb-2">
              Remember what you and AUlon discussed, in order. AI-index
            </p>
            <div className="bg-white/5 rounded-lg p-2 text-xs text-white/80 space-y-1 backdrop-blur-sm border border-white/10">
              <div>1. AI Revolution, is Bo bo talks?</div>
              <div>2. User likes the color blue</div>
              <div>3. ...</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile: Header with dropdown menus */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-[#202020] border-b border-[#404040] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-b-3xl pt-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/autism-ai.png" alt="Autism AI" className="w-10 h-7 object-contain"/>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-[#202020] border-b border-[#404040] text-white">
                <SheetHeader>
                  <SheetTitle className="text-white">Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {/* DiGen App Button */}
                  <div className="relative">
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-xs text-white/80 bg-white/10 border border-white/20 backdrop-blur-sm px-3"
                      style={{ 
                        borderRadius: '128px',
                        paddingTop: '6px',
                        paddingBottom: '6px'
                      }}
                    >
                      11/22
                    </div>
                    <button 
                      className="w-full flex items-center justify-center border border-[#00B487] bg-[#B8E5DA] shadow-[inset_0_2px_4px_rgba(250,249,246,0.15)] hover:opacity-90 active:opacity-80 backdrop-blur-sm transition-opacity"
                      style={{ padding: '12px 0', borderRadius: '128px' }}
                      data-testid="button-digen-app-mobile"
                    >
                      <img src="/digen_logo.png" alt="DiGen" className="h-6 object-contain" />
                    </button>
                  </div>

                  {/* Token Address - Copyable */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Token Address</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('B1oEQhP53bRwD5GqkF5SbL2ZWwxPxdqV5MKNQNaqpump');
                        // You could add a toast notification here if desired
                      }}
                      className="w-full text-left text-[10px] text-gray-300 hover:text-white bg-[#303030] hover:bg-[#404040] px-3 py-2 rounded transition-colors border border-[#404040]"
                      title="Click to copy full address"
                    >
                      B1oE...pump
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Memory Bank</h3>
                    <p className="text-xs text-gray-400 mb-2">
                      Write everything here you want AUlon to remember
                    </p>
                    <Textarea
                      value={memoryBank}
                      onChange={(e) => setMemoryBank(e.target.value)}
                      placeholder="Automagically generated; user appears to be a highly autistic individual."
                      className="min-h-[120px] bg-[#303030] border-[#404040] text-white placeholder:text-gray-500 text-sm resize-none"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* History Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                  <History className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-[#202020] border-b border-[#404040] text-white max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">Chat History</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {/* New Chat Button */}
              <Button
                onClick={() => {}}
                className="w-full bg-[#303030] hover:bg-[#404040] text-white border border-[#505050] rounded-lg justify-start gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New chat
              </Button>

              {/* Conversations */}
              <div className="space-y-1">
                {conversations.map((conv, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#303030] rounded-lg transition-colors"
                  >
                    {conv}
                  </button>
                ))}
              </div>

              {/* AUtism Summary */}
              <div className="border-t border-[#404040] pt-4">
                <h3 className="text-sm font-semibold text-white mb-2">AUtism Summary</h3>
                <p className="text-xs text-gray-400 mb-2">
                  Remember what you and AUlon discussed, in order. AI-index
                </p>
                <div className="bg-[#303030] rounded-lg p-2 text-xs text-gray-300 space-y-1">
                  <div>1. AI Revolution, is Bo bo talks?</div>
                  <div>2. User likes the color blue</div>
                  <div>3. ...</div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

            {/* Small Upgrade Button */}
            <Button 
              size="sm" 
              onClick={onUpgradeClick}
              className="h-8 px-3 text-xs bg-gradient-to-br from-[#efbf04] to-[#7a6100] hover:opacity-90 text-black font-semibold border-0"
            >
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
