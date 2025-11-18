import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Loader2, Sparkles, Brain, Zap, Paperclip, X, FileText, Link2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api, type Message } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTypewriter } from '@/hooks/use-typewriter';
import TypewriterWelcome from './TypewriterWelcome';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type AICharacter = 'AUtistic AI' | 'Level 1 ASD' | 'Savantist';

interface Attachment {
  id: string;
  type: 'url' | 'image' | 'file';
  name: string;
  url?: string;
  preview?: string;
  size?: number;
}

interface ChatInterfaceProps {
  remainingMessages?: number;
  maxMessages?: number;
}

const SUGGESTED_PROMPTS = [
  { id: '1', label: 'y did she leave me', prompt: 'y did she leave me' },
  { id: '2', label: 'recipe apple', prompt: 'recipe apple' },
  { id: '3', label: 'full-port $au gud?', prompt: 'full-port $au gud?' },
];

// RFC 3986 compliant URL detection regex
const URL_REGEX = /(?:(?:https?|ftp):\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi;

export default function ChatInterface({ 
  remainingMessages = 5, 
  maxMessages = 5 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [localRemaining, setLocalRemaining] = useState(remainingMessages);
  const [selectedCharacter, setSelectedCharacter] = useState<AICharacter>('AUtistic AI');
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const placeholderText = useTypewriter();

  useEffect(() => {
    setLocalRemaining(remainingMessages);
  }, [remainingMessages]);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const rawHeight = textareaRef.current.scrollHeight;
      const clampedHeight = Math.min(rawHeight, 256);
      setTextareaHeight(clampedHeight);
      textareaRef.current.style.height = `${clampedHeight}px`;
    }
  }, [input]);

  // Detect URLs in input only after user types space or newline
  useEffect(() => {
    const lastChar = input.slice(-1);
    const hasSpaceOrNewline = lastChar === ' ' || lastChar === '\n';
    
    if (hasSpaceOrNewline && input.trim()) {
      const textBeforeSpace = input.slice(0, -1);
      const urls = textBeforeSpace.match(URL_REGEX);
      
      if (urls) {
        urls.forEach(url => {
          const exists = attachments.some(a => a.url === url);
          if (!exists) {
            const newAttachment: Attachment = {
              id: Date.now().toString() + Math.random(),
              type: 'url',
              name: url.substring(0, 40) + (url.length > 40 ? '...' : ''),
              url,
            };
            setAttachments(prev => [...prev, newAttachment]);
          }
        });
      }
    }
  }, [input]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.messages.send(content, conversationId, false);
    },
    onSuccess: (data) => {
      if (!conversationId) {
        setConversationId(data.conversation.id);
      }
      setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
      setLocalRemaining(data.rateLimit.remaining);
      setAttachments([]); // Clear attachments after send
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim() || localRemaining === 0) return;
    
    const userInput = input;
    setInput('');
    sendMessageMutation.mutate(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording 
        ? "Voice recording has been stopped." 
        : "Voice recording feature is coming soon!",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        type: isImage ? 'image' : 'file',
        name: file.name,
        size: file.size,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };
      setAttachments(prev => [...prev, newAttachment]);
    });

    // Simulate upload completion - keep uploading state until attachments are added
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getPersonaIcon = () => {
    switch(selectedCharacter) {
      case 'AUtistic AI': return <Sparkles className="h-3.5 w-3.5" />;
      case 'Level 1 ASD': return <Brain className="h-3.5 w-3.5" />;
      case 'Savantist': return <Zap className="h-3.5 w-3.5" />;
      default: return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const personaDescriptions = {
    'AUtistic AI': 'Useful for general conversation',
    'Level 1 ASD': 'Useful for learning facts and solving complex problems',
    'Savantist': 'Maximum autism for advanced trading insights'
  };

  const renderAttachments = () => {
    if (attachments.length === 0) return null;

    const images = attachments.filter(a => a.type === 'image');
    const urls = attachments.filter(a => a.type === 'url');
    const files = attachments.filter(a => a.type === 'file');

    // Condensed view if too many attachments
    if (attachments.length > 4) {
      return (
        <div className="flex items-start mb-2">
          <div 
            className="px-3 py-1.5 text-xs bg-[#000000] border border-[#606060] flex items-center gap-2"
            style={{ 
              borderRadius: '24px',
              boxShadow: 'inset 0 2px 8px rgba(32, 32, 32, 0.15)'
            }}
          >
            <FileText className="h-3 w-3 text-gray-400" />
            <span className="text-gray-300">
              {urls.length > 0 && `${urls.length} URL${urls.length > 1 ? 's' : ''}`}
              {urls.length > 0 && images.length > 0 && ' + '}
              {images.length > 0 && `${images.length} image${images.length > 1 ? 's' : ''}`}
              {(urls.length > 0 || images.length > 0) && files.length > 0 && ' + '}
              {files.length > 0 && `${files.length} file${files.length > 1 ? 's' : ''}`}
            </span>
            <button
              onClick={() => setAttachments([])}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    // Full view
    return (
      <div className="flex flex-wrap items-start gap-2 mb-2">
        {attachments.map(attachment => (
          <div
            key={attachment.id}
            className="px-3 py-1.5 text-xs bg-[#000000] border border-[#606060] flex items-center gap-2 group"
            style={{ 
              borderRadius: '24px',
              boxShadow: 'inset 0 2px 8px rgba(32, 32, 32, 0.15)'
            }}
          >
            {attachment.type === 'image' && attachment.preview ? (
              <img 
                src={attachment.preview} 
                alt={attachment.name}
                className="h-8 w-8 object-cover rounded"
                style={{ maxHeight: '64px', maxWidth: '64px' }}
              />
            ) : attachment.type === 'url' ? (
              <Link2 className="h-3 w-3 text-gray-400" />
            ) : (
              <FileText className="h-3 w-3 text-gray-400" />
            )}
            <span className="text-gray-300 max-w-[200px] truncate">{attachment.name}</span>
            <button
              onClick={() => removeAttachment(attachment.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col px-4 py-4 pb-0 xl:pb-4 items-center box-border">
      <style>{`
        @keyframes pulse-teal {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(8, 153, 129, 0.7);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(8, 153, 129, 0);
          }
        }
        .pulse-active {
          animation: pulse-teal 1.5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="w-full max-w-[80ch] flex flex-col h-full box-border">
        <ScrollArea className="flex-1 w-full mb-4">
          <div className="space-y-4 min-h-full flex flex-col">
          {messages.length === 0 && (
            <TypewriterWelcome hasMessages={messages.length > 0} />
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid={`message-${message.role}-${message.id}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                  {message.role === 'assistant' ? 'AI' : 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80ch] rounded-2xl px-4 py-2 border-2 ${
                  message.role === 'user'
                    ? 'bg-[#606060] border-[#eaeaea] text-white'
                    : 'bg-[#000000] border-[#202020] text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="mt-1 text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 rounded-2xl bg-[#000000] border-2 border-[#202020] px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-white">Thinking...</span>
              </div>
            </div>
          )}
          </div>
        </ScrollArea>

        <div className="w-full pb-4 xl:pb-0 box-border">
          {/* Attachment ribbon above chatbox */}
          {renderAttachments()}

          {/* Chat input box with buttons inside */}
          <div className="bg-[#2a2a2a] border-[#404040] border shadow-lg p-3 w-full box-border max-w-full" style={{ 
            borderRadius: '24px'
          }}>
            <div className="flex items-start gap-2 max-w-full">
              {/* AI Persona Selector - DESKTOP ONLY (conditionally rendered) */}
              {!isMobile && (
                <Popover open={personaMenuOpen} onOpenChange={setPersonaMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="!h-8 !w-8 !min-w-[32px] !min-h-[32px] bg-[#202020] border-[#404040] hover:bg-[#303030] text-white"
                      style={{ borderRadius: '32px' }}
                    >
                      {getPersonaIcon()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-[#202020] border-[#404040] text-white p-0" align="start">
                    <div className="space-y-1 p-2">
                      {(['AUtistic AI', 'Level 1 ASD', 'Savantist'] as AICharacter[]).map((persona) => (
                        <button
                          key={persona}
                          onClick={() => {
                            setSelectedCharacter(persona);
                            setPersonaMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCharacter === persona 
                              ? 'bg-[#404040] text-white' 
                              : 'text-gray-300 hover:bg-[#303030]'
                          }`}
                        >
                          <div className="font-medium text-sm">{persona}</div>
                          <div className="text-xs text-gray-400">{personaDescriptions[persona]}</div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* File upload button - DESKTOP ONLY (conditionally rendered) */}
              {!isMobile && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className={`!h-8 !w-8 !min-w-[32px] !min-h-[32px] hover:bg-[#404040] text-gray-400 hover:text-white transition-all rounded-[4px] hover:!rounded-[32px] p-0 ${
                      (isUploading || attachments.length > 0) ? '!rounded-[32px]' : ''
                    }`}
                    data-testid="button-file-upload"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}

              {/* Voice recording button - DESKTOP ONLY (conditionally rendered) */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  className={`!h-8 !w-8 !min-w-[32px] !min-h-[32px] hover:bg-[#404040] text-gray-400 hover:text-white transition-all relative rounded-[4px] hover:!rounded-[32px] p-0 ${
                    isRecording ? 'pulse-active bg-[#089981] border-2 border-[#03332B] !rounded-[32px]' : ''
                  }`}
                  data-testid="button-voice-toggle"
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5 text-white" /> : <Mic className="h-3.5 w-3.5" />}
                </Button>
              )}
            

              {/* Textarea - grows as needed */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholderText}
                className="chat-input-placeholder flex-1 min-h-[32px] max-h-[256px] resize-none bg-transparent border-0 text-[#ffffff] placeholder:text-[#ffffff] placeholder:text-sm xl:placeholder:text-base px-2 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 min-w-0"
                style={{
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  lineHeight: '20px',
                  height: textareaHeight || '32px'
                }}
                disabled={localRemaining === 0 || sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />

              {/* Send button - square with same size as Personality Selection */}
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || localRemaining === 0 || sendMessageMutation.isPending}
                className={`!h-8 !w-8 !min-w-[32px] !min-h-[32px] bg-[#efbf04] hover:bg-[#d4af37] text-black flex items-center justify-center transition-all shrink-0 rounded-[32px] hover:!rounded-[32px] ${
                  sendMessageMutation.isPending ? '!rounded-[32px]' : ''
                }`}
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Suggested prompts below chatbox */}
          {messages.length === 0 && (
            <>
              {/* Mobile: Buttons HORIZONTALLY left of Carousel */}
              <div className="md:hidden mt-4 flex items-center gap-2 w-full max-w-full box-border overflow-hidden">
                {/* Icon buttons horizontally on the left */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* AI Persona Selector - MOBILE ONLY (conditionally rendered) */}
                  {isMobile && (
                    <Popover open={personaMenuOpen} onOpenChange={setPersonaMenuOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="!h-8 !w-8 !min-w-[32px] !min-h-[32px] bg-[#202020] border-[#404040] hover:bg-[#303030] text-white"
                          style={{ borderRadius: '32px' }}
                        >
                          {getPersonaIcon()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-64 bg-[#202020] border-[#404040] text-white p-0 z-50" 
                        align="start"
                      >
                        <div className="space-y-1 p-2">
                          {(['AUtistic AI', 'Level 1 ASD', 'Savantist'] as AICharacter[]).map((persona) => (
                            <button
                              key={persona}
                              onClick={() => {
                                setSelectedCharacter(persona);
                                setPersonaMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                selectedCharacter === persona 
                                  ? 'bg-[#404040] text-white' 
                                  : 'text-gray-300 hover:bg-[#303030]'
                              }`}
                            >
                              <div className="font-medium text-sm">{persona}</div>
                              <div className="text-xs text-gray-400">{personaDescriptions[persona]}</div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* File upload button - MOBILE ONLY (conditionally rendered) */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className={`!h-8 !w-8 !min-w-[32px] !min-h-[32px] hover:bg-[#404040] text-gray-400 hover:text-white transition-all rounded-[4px] hover:!rounded-[32px] p-0 ${
                        (isUploading || attachments.length > 0) ? '!rounded-[32px]' : ''
                      }`}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {/* Voice recording button - MOBILE ONLY (conditionally rendered) */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRecording}
                      className={`!h-8 !w-8 !min-w-[32px] !min-h-[32px] hover:bg-[#404040] text-gray-400 hover:text-white transition-all relative rounded-[4px] hover:!rounded-[32px] p-0 ${
                        isRecording ? 'pulse-active bg-[#089981] border-2 border-[#03332B] !rounded-[32px]' : ''
                      }`}
                    >
                      {isRecording ? <MicOff className="h-3.5 w-3.5 text-white" /> : <Mic className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>

                {/* Carousel on the right - constrained with max-width to prevent overflow */}
                <div className="flex-1 min-w-0 max-w-[calc(100vw-180px)] overflow-x-auto">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: false,
                    }}
                    className="w-full max-w-full"
                    style={{ '--slide-gap': '0px' } as React.CSSProperties}
                  >
                    <CarouselContent className="ml-0 gap-2">
                      {SUGGESTED_PROMPTS.map((suggestion) => (
                        <CarouselItem key={suggestion.id} className="pl-0 basis-auto">
                          <button
                            onClick={() => handleSuggestionClick(suggestion.prompt)}
                            className="px-4 py-2 text-sm bg-[#202020] hover:bg-[#303030] text-gray-300 hover:text-white border border-[#404040] transition-colors whitespace-nowrap"
                            style={{ borderRadius: '20px' }}
                          >
                            {suggestion.label}
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              </div>
              
              {/* Desktop Wrap */}
              <div className="hidden md:flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {SUGGESTED_PROMPTS.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="px-4 py-2 text-sm bg-[#202020] hover:bg-[#303030] text-gray-300 hover:text-white border border-[#404040] transition-colors"
                    style={{ borderRadius: '20px' }}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {localRemaining === 0 && (
            <p className="text-sm font-medium text-destructive mt-2">
              Message limit reached. Upgrade your tier or wait for reset.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
