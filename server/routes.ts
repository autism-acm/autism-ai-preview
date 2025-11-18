import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { sessionMiddleware } from "./middleware/session";
import { adminMiddleware } from "./middleware/admin";
import { checkMessageRateLimit, incrementMessageCount, checkVoiceRateLimit, incrementVoiceMinutes } from "./utils/rateLimit";
import { getTokenBalance } from "./utils/solana";
import { generateSecureToken, hashPassword, verifyPassword } from "./utils/fingerprint";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const N8N_WEBHOOK_URL = "https://autism.app.n8n.cloud/webhook/autism-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  app.use(sessionMiddleware);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get current session info
  app.get("/api/session", async (req, res) => {
    try {
      const session = req.session!;
      const rateLimit = await checkMessageRateLimit(session);
      const voiceLimit = await checkVoiceRateLimit(session);

      res.json({
        tier: session.tier,
        tokenBalance: session.tokenBalance,
        walletAddress: session.walletAddress,
        messageLimit: {
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
          resetTime: rateLimit.resetTime,
        },
        voiceLimit: {
          remaining: voiceLimit.remaining,
          limit: voiceLimit.limit,
          resetTime: voiceLimit.resetTime,
        },
      });
    } catch (error) {
      console.error("Error getting session:", error);
      res.status(500).json({ error: "Failed to get session info" });
    }
  });

  // Connect wallet and update token balance
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const session = req.session!;

      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      // Get token balance from Solana
      const { balance, tier } = await getTokenBalance(walletAddress);

      // Update session with wallet info
      const updatedSession = await storage.updateSession(session.id, {
        walletAddress,
        tokenBalance: balance,
        tier,
      });

      res.json({
        walletAddress: updatedSession?.walletAddress,
        tokenBalance: updatedSession?.tokenBalance,
        tier: updatedSession?.tier,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  // Disconnect wallet
  app.post("/api/wallet/disconnect", async (req, res) => {
    try {
      const session = req.session!;

      const updatedSession = await storage.updateSession(session.id, {
        walletAddress: null,
        tokenBalance: 0,
        tier: "Free Trial",
      });

      res.json({
        tier: updatedSession?.tier,
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      res.status(500).json({ error: "Failed to disconnect wallet" });
    }
  });

  // Get conversations for current session
  app.get("/api/conversations", async (req, res) => {
    try {
      const session = req.session!;
      const conversations = await storage.getConversationsBySession(session.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const session = req.session!;

      // Verify conversation belongs to this session
      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.sessionId !== session.id) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(id);
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const { content, conversationId, requestImage = false } = req.body;
      const session = req.session!;

      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Check rate limit
      const rateLimit = await checkMessageRateLimit(session);
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: "Rate limit exceeded", 
          resetTime: rateLimit.resetTime 
        });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.sessionId !== session.id) {
          return res.status(404).json({ error: "Conversation not found" });
        }
      } else {
        conversation = await storage.createConversation({
          sessionId: session.id,
          title: content.substring(0, 50),
        });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content,
        isImage: false,
      });

      // Call n8n webhook (don't increment until we successfully generate a response)
      try {
        await axios.post(N8N_WEBHOOK_URL, {
          sessionId: session.id,
          conversationId: conversation.id,
          messageId: userMessage.id,
          content,
          tier: session.tier,
          requestImage,
        });
        
        await storage.createWebhookLog({
          sessionId: session.id,
          conversationId: conversation.id,
          requestData: { content, requestImage },
          responseData: { status: "sent" },
          status: "success",
        });
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
        await storage.createWebhookLog({
          sessionId: session.id,
          conversationId: conversation.id,
          requestData: { content, requestImage },
          responseData: { error: String(webhookError) },
          status: "error",
        });
      }

      // Generate AI response using Gemini
      try {
        let aiResponseText: string;
        let imageUrl: string | undefined;

        if (requestImage) {
          // For image requests, generate a descriptive response
          const prompt = `Based on this request: "${content}", provide a detailed description that could be used to generate an image. Focus on visual elements, composition, style, and mood.`;
          const result = await gemini.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
          });
          aiResponseText = result.text || "I encountered an issue generating the image description.";
          // Note: Actual image generation would require additional API integration (DALL-E, Stable Diffusion, etc.)
        } else {
          const result = await gemini.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: content,
          });
          aiResponseText = result.text || "I apologize, but I couldn't generate a response.";
        }

        // Save AI response
        const aiMessage = await storage.createMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: aiResponseText,
          isImage: requestImage,
          imageUrl,
        });

        // Only increment message count after successful AI response
        await incrementMessageCount(session.id);

        res.json({
          conversation,
          userMessage,
          aiMessage,
          rateLimit: {
            remaining: rateLimit.remaining - 1,
            limit: rateLimit.limit,
            resetTime: rateLimit.resetTime,
          },
        });
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        
        // Save error message
        const errorMessage = await storage.createMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          isImage: false,
        });

        // Still increment even on error to prevent spam
        await incrementMessageCount(session.id);

        res.json({
          conversation,
          userMessage,
          aiMessage: errorMessage,
          rateLimit: {
            remaining: rateLimit.remaining - 1,
            limit: rateLimit.limit,
            resetTime: rateLimit.resetTime,
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Generate voice with ElevenLabs
  app.post("/api/voice/generate", async (req, res) => {
    try {
      const { text, conversationId, messageId } = req.body;
      const session = req.session!;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      // Check voice rate limit (estimate 1 minute per request)
      const voiceLimit = await checkVoiceRateLimit(session, 1);
      if (!voiceLimit.allowed) {
        return res.status(429).json({ 
          error: "Voice limit exceeded", 
          resetTime: voiceLimit.resetTime 
        });
      }

      // Generate secure token for audio access
      const secureToken = generateSecureToken();

      // Integrate with ElevenLabs API
      let audioUrl = `https://example.com/audio/${secureToken}.mp3`;
      let duration = 60;

      if (process.env.ELEVENLABS_API_KEY) {
        try {
          const elevenLabsResponse = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Default voice ID
            {
              text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
              },
            },
            {
              headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
              },
              responseType: 'arraybuffer',
            }
          );

          // In production, you'd save this to cloud storage (S3, etc.)
          // For now, we're using a placeholder URL
          audioUrl = `https://example.com/audio/${secureToken}.mp3`;
          
          // Estimate duration (rough estimate: 150 words per minute)
          const wordCount = text.split(' ').length;
          duration = Math.ceil((wordCount / 150) * 60);
        } catch (elevenLabsError) {
          console.error("ElevenLabs API error:", elevenLabsError);
          // Continue with mock data if ElevenLabs fails
        }
      }

      // Save to audio cache
      const audioCache = await storage.createAudioCache({
        sessionId: session.id,
        conversationId,
        messageId: messageId || null,
        audioUrl,
        secureToken,
        text,
        duration,
        voiceSettings: { voice: "default" },
      });

      // Increment voice usage
      await incrementVoiceMinutes(session.id, 1);

      res.json({
        audioUrl,
        secureToken,
        duration: audioCache.duration,
        voiceLimit: {
          remaining: voiceLimit.remaining - 1,
          limit: voiceLimit.limit,
          resetTime: voiceLimit.resetTime,
        },
      });
    } catch (error) {
      console.error("Error generating voice:", error);
      res.status(500).json({ error: "Failed to generate voice" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isAdmin || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set admin cookie
      res.cookie("autism_admin", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 180 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, username: user.username });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  // Admin routes (protected)
  app.use("/api/admin", adminMiddleware);

  // Get all sessions (admin only)
  app.get("/api/admin/sessions", async (req, res) => {
    try {
      // This would need a new storage method to get all sessions
      res.json({ message: "Admin sessions endpoint" });
    } catch (error) {
      console.error("Error getting sessions:", error);
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  // Get all audio cache entries (admin only)
  app.get("/api/admin/audio", async (req, res) => {
    try {
      const { sessionId, conversationId, limit } = req.query;

      let audioEntries: any[] = [];
      if (sessionId) {
        audioEntries = await storage.getAudioCacheBySession(sessionId as string);
      } else if (conversationId) {
        audioEntries = await storage.getAudioCacheByConversation(conversationId as string);
      } else {
        const limitNum = parseInt(limit as string) || 100;
        audioEntries = await storage.getAllAudioCache(limitNum);
      }

      res.json(audioEntries);
    } catch (error) {
      console.error("Error getting audio:", error);
      res.status(500).json({ error: "Failed to get audio cache" });
    }
  });

  // Get webhook logs (admin only)
  app.get("/api/admin/webhooks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getWebhookLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error getting webhook logs:", error);
      res.status(500).json({ error: "Failed to get webhook logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
