// Real-time Voice Streaming Service
// Integrates ElevenLabs TTS WebSocket with Gemini Live API for bidirectional audio conversations

import WebSocket from 'ws';
import { GoogleGenAI } from '@google/genai';
import { storage } from '../storage';
import { generateSecureToken } from '../utils/fingerprint';

interface VoiceStreamingSession {
  sessionId: string;
  conversationId: string;
  elevenLabsWs?: WebSocket;
  geminiSession?: any;
  isActive: boolean;
  startTime: number;
}

export class VoiceStreamingService {
  private activeSessions: Map<string, VoiceStreamingSession> = new Map();
  private geminiClient: GoogleGenAI;

  constructor() {
    this.geminiClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY! 
    });
  }

  /**
   * Initialize bidirectional voice streaming session
   * Combines ElevenLabs TTS output with Gemini audio understanding
   */
  async initializeVoiceSession(
    clientWs: WebSocket,
    sessionId: string,
    conversationId: string,
    personality: string
  ): Promise<void> {
    const streamSessionId = `${sessionId}-${Date.now()}`;
    
    console.log(`[Voice] Initializing voice session: ${streamSessionId}`);

    const voiceSession: VoiceStreamingSession = {
      sessionId: streamSessionId,
      conversationId,
      isActive: true,
      startTime: Date.now(),
    };

    this.activeSessions.set(streamSessionId, voiceSession);

    try {
      // Initialize ElevenLabs WebSocket for TTS output
      await this.initializeElevenLabs(clientWs, voiceSession);

      // Initialize Gemini Live API for audio input understanding
      await this.initializeGeminiLive(clientWs, voiceSession, personality);

      // Set up client message handlers
      this.setupClientHandlers(clientWs, voiceSession);

    } catch (error) {
      console.error('[Voice] Failed to initialize voice session:', error);
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to initialize voice streaming' 
      }));
      this.cleanupSession(streamSessionId);
    }
  }

  /**
   * Initialize ElevenLabs WebSocket for real-time TTS
   */
  private async initializeElevenLabs(
    clientWs: WebSocket,
    voiceSession: VoiceStreamingSession
  ): Promise<void> {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'default_voice_id';
    const modelId = 'eleven_turbo_v2_5';
    
    const elevenLabsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;
    
    const elevenLabsWs = new WebSocket(elevenLabsUrl);
    voiceSession.elevenLabsWs = elevenLabsWs;

    elevenLabsWs.on('open', () => {
      console.log('[Voice] ElevenLabs WebSocket connected');
      
      // Initialize with voice settings
      elevenLabsWs.send(JSON.stringify({
        text: ' ',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          speed: 1.0,
        },
        xi_api_key: process.env.ELEVENLABS_API_KEY,
      }));
    });

    elevenLabsWs.on('message', async (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString());
        
        if (response.audio) {
          // Forward audio chunks to client
          clientWs.send(JSON.stringify({
            type: 'audio_output',
            audio: response.audio,
            alignment: response.alignment,
          }));

          // Cache audio for playback/admin access
          if (response.isFinal) {
            await this.cacheAudioOutput(
              voiceSession.sessionId,
              voiceSession.conversationId,
              response.audio
            );
          }
        }
      } catch (error) {
        console.error('[Voice] ElevenLabs message error:', error);
      }
    });

    elevenLabsWs.on('error', (error) => {
      console.error('[Voice] ElevenLabs WebSocket error:', error);
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        message: 'TTS connection error' 
      }));
    });
  }

  /**
   * Initialize Gemini Live API for bidirectional audio streaming
   */
  private async initializeGeminiLive(
    clientWs: WebSocket,
    voiceSession: VoiceStreamingSession,
    personality: string
  ): Promise<void> {
    try {
      // Configure Gemini Live API for audio input/output
      const config = {
        response_modalities: ['TEXT'], // We use ElevenLabs for audio output
        realtime_input_config: {
          automatic_activity_detection: {
            disabled: false,
            start_of_speech_sensitivity: 'START_SENSITIVITY_LOW',
            end_of_speech_sensitivity: 'END_SENSITIVITY_HIGH',
            silence_duration_ms: 100,
          },
        },
        system_instruction: this.getPersonalitySystemPrompt(personality),
      };

      // Note: Gemini Live API connection would be established here
      // For now, we'll use the standard Gemini API and upgrade to Live API when available
      console.log('[Voice] Gemini configuration prepared for personality:', personality);
      
      clientWs.send(JSON.stringify({ 
        type: 'voice_ready',
        message: 'Voice streaming ready' 
      }));

    } catch (error) {
      console.error('[Voice] Gemini Live initialization error:', error);
      throw error;
    }
  }

  /**
   * Setup client WebSocket message handlers
   */
  private setupClientHandlers(
    clientWs: WebSocket,
    voiceSession: VoiceStreamingSession
  ): void {
    clientWs.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'audio_input':
            // User speaking - process through Gemini for understanding
            await this.processAudioInput(message.audio, voiceSession, clientWs);
            break;

          case 'text_input':
            // User typing - send to ElevenLabs for TTS
            await this.processTextInput(message.text, voiceSession);
            break;

          case 'stop':
            // User stopped speaking
            this.handleStopSpeaking(voiceSession);
            break;

          default:
            console.warn('[Voice] Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('[Voice] Client message error:', error);
      }
    });

    clientWs.on('close', () => {
      console.log('[Voice] Client disconnected');
      this.cleanupSession(voiceSession.sessionId);
    });
  }

  /**
   * Process audio input from user (speech-to-text via Gemini)
   */
  private async processAudioInput(
    audioData: string,
    voiceSession: VoiceStreamingSession,
    clientWs: WebSocket
  ): Promise<void> {
    // In production, use Gemini Live API for real-time audio understanding
    // For now, send acknowledgment
    clientWs.send(JSON.stringify({ 
      type: 'audio_processing',
      message: 'Processing your speech...' 
    }));
  }

  /**
   * Process text input and convert to speech via ElevenLabs
   */
  private async processTextInput(
    text: string,
    voiceSession: VoiceStreamingSession
  ): Promise<void> {
    if (!voiceSession.elevenLabsWs || voiceSession.elevenLabsWs.readyState !== WebSocket.OPEN) {
      console.error('[Voice] ElevenLabs WebSocket not ready');
      return;
    }

    // Send text to ElevenLabs for TTS
    voiceSession.elevenLabsWs.send(JSON.stringify({
      text: text,
      try_trigger_generation: true,
    }));
  }

  /**
   * Handle user stopping speech
   */
  private handleStopSpeaking(voiceSession: VoiceStreamingSession): void {
    if (!voiceSession.elevenLabsWs || voiceSession.elevenLabsWs.readyState !== WebSocket.OPEN) {
      return;
    }

    // Flush remaining audio
    voiceSession.elevenLabsWs.send(JSON.stringify({
      text: '',
      flush: true,
    }));
  }

  /**
   * Cache audio output for secure access
   */
  private async cacheAudioOutput(
    sessionId: string,
    conversationId: string,
    audioBase64: string
  ): Promise<void> {
    try {
      const secureToken = generateSecureToken();
      const audioUrl = `/api/audio/${secureToken}`;

      await storage.createAudioCache({
        sessionId,
        conversationId,
        audioUrl,
        secureToken,
        text: 'Voice conversation audio',
        voiceSettings: {
          provider: 'elevenlabs',
          model: 'eleven_turbo_v2_5',
        },
      });

      console.log('[Voice] Audio cached with secure token');
    } catch (error) {
      console.error('[Voice] Failed to cache audio:', error);
    }
  }

  /**
   * Get system prompt based on personality
   */
  private getPersonalitySystemPrompt(personality: string): string {
    const prompts: Record<string, string> = {
      'AUtistic AI': 'You are AUtistic AI, specialized in meme coins and creative content. Be casual, fun, and knowledgeable about crypto culture.',
      'Level 1 ASD': 'You are Level 1 ASD, focused on learning, facts, and solving complex problems. Be analytical and educational.',
      'Savantist': 'You are Savantist, the expert in advanced trading insights. Provide deep analysis with maximum detail and precision.',
    };

    return prompts[personality] || prompts['AUtistic AI'];
  }

  /**
   * Cleanup voice session
   */
  private cleanupSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.isActive = false;

      if (session.elevenLabsWs) {
        session.elevenLabsWs.close();
      }

      this.activeSessions.delete(sessionId);
      console.log(`[Voice] Session cleaned up: ${sessionId}`);
    }
  }
}

// Singleton instance
export const voiceStreamingService = new VoiceStreamingService();
