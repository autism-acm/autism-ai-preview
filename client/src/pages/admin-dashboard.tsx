import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Volume2, Users, Activity, Webhook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AudioCacheEntry {
  id: string;
  sessionId: string;
  conversationId: string;
  audioUrl: string;
  secureToken: string;
  text: string;
  duration: number;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  sessionId: string;
  conversationId: string;
  requestData: any;
  responseData: any;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('audio');

  const { data: audioCache, isLoading: audioLoading } = useQuery<AudioCacheEntry[]>({
    queryKey: ['/api/admin/audio'],
  });

  const { data: webhookLogs, isLoading: webhooksLoading } = useQuery<WebhookLog[]>({
    queryKey: ['/api/admin/webhooks'],
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight-custom">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage AUtism GOLD application</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audio</CardTitle>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{audioCache?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Generated audio files</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Webhook Calls</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhookLogs?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total n8n webhook calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {webhookLogs
                  ? `${Math.round((webhookLogs.filter(l => l.status === 'success').length / webhookLogs.length) * 100)}%`
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Webhook success rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="audio">Audio Cache</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audio Cache</CardTitle>
                <CardDescription>
                  All generated audio files with secure access tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {audioLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
                    {!audioLoading && (!audioCache || audioCache.length === 0) && (
                      <p className="text-sm text-muted-foreground">No audio files yet</p>
                    )}
                    {audioCache?.map((audio) => (
                      <Card key={audio.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {audio.duration}s
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(audio.createdAt), 'PPp')}
                                </span>
                              </div>
                              <p className="text-sm">{audio.text}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyToClipboard(audio.audioUrl, 'Audio URL')}
                              data-testid={`button-copy-audio-${audio.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Session:</span>
                              <code className="rounded bg-muted px-1 py-0.5">{audio.sessionId.slice(0, 8)}</code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(audio.sessionId, 'Session ID')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Token:</span>
                              <code className="rounded bg-muted px-1 py-0.5">{audio.secureToken.slice(0, 16)}...</code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(audio.secureToken, 'Secure Token')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Logs</CardTitle>
                <CardDescription>
                  n8n webhook call history and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {webhooksLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
                    {!webhooksLoading && (!webhookLogs || webhookLogs.length === 0) && (
                      <p className="text-sm text-muted-foreground">No webhook logs yet</p>
                    )}
                    {webhookLogs?.map((log) => (
                      <Card key={log.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.createdAt), 'PPp')}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="font-medium">Session:</span>{' '}
                              <code className="rounded bg-muted px-1 py-0.5">{log.sessionId?.slice(0, 8)}</code>
                            </div>
                            <div>
                              <span className="font-medium">Request:</span>{' '}
                              <code className="rounded bg-muted px-1 py-0.5">
                                {JSON.stringify(log.requestData).slice(0, 100)}...
                              </code>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
