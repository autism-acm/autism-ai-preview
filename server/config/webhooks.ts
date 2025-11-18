// N8N Webhook Configuration for Different AI Personalities
// Each personality has separate webhooks for TEXT and VOICE modalities

export type AIPersonality = 'AUtistic AI' | 'Level 1 ASD' | 'Savantist';
export type Modality = 'TEXT' | 'VOICE' | 'IMAGE';

interface WebhookConfig {
  personality: AIPersonality;
  modality: Modality;
  url: string;
}

// Webhook URL Builder - Replace with your actual N8N webhook URLs
const buildWebhookUrl = (personality: AIPersonality, modality: Modality): string => {
  const baseUrl = process.env.N8N_BASE_URL || 'https://n8n.io/webhook/autism';
  
  // Normalize personality name for URL
  const personalitySlug = personality.toLowerCase().replace(/\s+/g, '-');
  const modalitySlug = modality.toLowerCase();
  
  return `${baseUrl}/prompt-${personalitySlug}-${modalitySlug}`;
};

// Webhook Configuration Map
export const WEBHOOK_CONFIG: Record<AIPersonality, Record<Modality, string>> = {
  'AUtistic AI': {
    TEXT: process.env.N8N_AUTISTIC_AI_TEXT || buildWebhookUrl('AUtistic AI', 'TEXT'),
    VOICE: process.env.N8N_AUTISTIC_AI_VOICE || buildWebhookUrl('AUtistic AI', 'VOICE'),
    IMAGE: process.env.N8N_AUTISTIC_AI_IMAGE || buildWebhookUrl('AUtistic AI', 'IMAGE'),
  },
  'Level 1 ASD': {
    TEXT: process.env.N8N_LEVEL1_ASD_TEXT || buildWebhookUrl('Level 1 ASD', 'TEXT'),
    VOICE: process.env.N8N_LEVEL1_ASD_VOICE || buildWebhookUrl('Level 1 ASD', 'VOICE'),
    IMAGE: process.env.N8N_LEVEL1_ASD_IMAGE || buildWebhookUrl('Level 1 ASD', 'IMAGE'),
  },
  'Savantist': {
    TEXT: process.env.N8N_SAVANTIST_TEXT || buildWebhookUrl('Savantist', 'TEXT'),
    VOICE: process.env.N8N_SAVANTIST_VOICE || buildWebhookUrl('Savantist', 'VOICE'),
    IMAGE: process.env.N8N_SAVANTIST_IMAGE || buildWebhookUrl('Savantist', 'IMAGE'),
  },
};

// Get webhook URL for specific personality and modality
export function getWebhookUrl(personality: AIPersonality, modality: Modality): string {
  return WEBHOOK_CONFIG[personality][modality];
}

// Webhook Request Payload Interface
export interface WebhookPayload {
  personality: AIPersonality;
  modality: Modality;
  sessionId: string;
  conversationId?: string;
  messageId?: string;
  content: string;
  metadata?: {
    tier: string;
    tokenBalance: number;
    walletAddress?: string;
    timestamp: number;
    userAgent?: string;
  };
}

// Webhook Response Interface
export interface WebhookResponse {
  success: boolean;
  response?: string;
  audioUrl?: string;
  error?: string;
  metadata?: any;
}
