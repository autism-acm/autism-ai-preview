// N8N Webhook Service
// Handles sending requests to N8N webhooks and processing responses

import axios, { AxiosError } from 'axios';
import { getWebhookUrl, type AIPersonality, type Modality, type WebhookPayload, type WebhookResponse } from '../config/webhooks';
import { storage } from '../storage';

export class N8NWebhookService {
  /**
   * Send request to N8N webhook for specific personality and modality
   */
  static async sendToWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
    const webhookUrl = getWebhookUrl(payload.personality, payload.modality);
    
    try {
      console.log(`[N8N] Sending ${payload.modality} request to ${payload.personality} webhook`);
      
      const response = await axios.post<WebhookResponse>(webhookUrl, {
        ...payload,
        timestamp: Date.now(),
      }, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AUtism-GOLD-App/1.0',
        },
      });

      // Log webhook interaction
      await this.logWebhookCall(payload, response.data);

      return response.data;
    } catch (error) {
      console.error('[N8N] Webhook request failed:', error);
      
      const errorResponse: WebhookResponse = {
        success: false,
        error: error instanceof AxiosError 
          ? `Webhook error: ${error.message}` 
          : 'Unknown webhook error',
      };

      // Log failed webhook call
      await this.logWebhookCall(payload, errorResponse);

      return errorResponse;
    }
  }

  /**
   * Log webhook call to database
   */
  private static async logWebhookCall(payload: WebhookPayload, response: WebhookResponse): Promise<void> {
    try {
      await storage.createWebhookLog({
        sessionId: payload.sessionId,
        conversationId: payload.conversationId,
        requestData: {
          personality: payload.personality,
          modality: payload.modality,
          content: payload.content,
          metadata: payload.metadata,
        },
        responseData: response,
        status: response.success ? 'success' : 'error',
      });
    } catch (error) {
      console.error('[N8N] Failed to log webhook call:', error);
    }
  }

  /**
   * Process TEXT request through N8N
   */
  static async processTextMessage(
    personality: AIPersonality,
    content: string,
    sessionId: string,
    conversationId?: string,
    messageId?: string,
    metadata?: any
  ): Promise<WebhookResponse> {
    return this.sendToWebhook({
      personality,
      modality: 'TEXT',
      sessionId,
      conversationId,
      messageId,
      content,
      metadata,
    });
  }

  /**
   * Process VOICE request through N8N
   */
  static async processVoiceMessage(
    personality: AIPersonality,
    content: string,
    sessionId: string,
    conversationId?: string,
    messageId?: string,
    metadata?: any
  ): Promise<WebhookResponse> {
    return this.sendToWebhook({
      personality,
      modality: 'VOICE',
      sessionId,
      conversationId,
      messageId,
      content,
      metadata,
    });
  }

  /**
   * Process IMAGE request through N8N
   */
  static async processImageRequest(
    personality: AIPersonality,
    content: string,
    sessionId: string,
    conversationId?: string,
    messageId?: string,
    metadata?: any
  ): Promise<WebhookResponse> {
    return this.sendToWebhook({
      personality,
      modality: 'IMAGE',
      sessionId,
      conversationId,
      messageId,
      content,
      metadata,
    });
  }
}
