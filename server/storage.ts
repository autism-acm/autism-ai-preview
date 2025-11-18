import { db } from "./db";
import { 
  users, sessions, conversations, messages, audioCache, rateLimits, webhookLogs,
  type User, type Session, type Conversation, type Message, type AudioCache, type RateLimit, type WebhookLog,
  type InsertUser, type InsertSession, type InsertConversation, type InsertMessage, 
  type InsertAudioCache, type InsertRateLimit, type InsertWebhookLog
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session methods
  getSession(id: string): Promise<Session | undefined>;
  getSessionByFingerprint(fingerprint: string): Promise<Session | undefined>;
  getSessionByCookieToken(cookieToken: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, data: Partial<Session>): Promise<Session | undefined>;

  // Conversation methods
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsBySession(sessionId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | undefined>;

  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Audio cache methods
  getAudioCache(id: string): Promise<AudioCache | undefined>;
  getAudioCacheByToken(secureToken: string): Promise<AudioCache | undefined>;
  getAudioCacheBySession(sessionId: string): Promise<AudioCache[]>;
  getAudioCacheByConversation(conversationId: string): Promise<AudioCache[]>;
  createAudioCache(audio: InsertAudioCache): Promise<AudioCache>;

  // Rate limit methods
  getRateLimit(sessionId: string): Promise<RateLimit | undefined>;
  createRateLimit(rateLimit: InsertRateLimit): Promise<RateLimit>;
  updateRateLimit(id: string, data: Partial<RateLimit>): Promise<RateLimit | undefined>;

  // Webhook log methods
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(limit?: number): Promise<WebhookLog[]>;
  
  // Admin methods
  getAllAudioCache(limit?: number): Promise<AudioCache[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Session methods
  async getSession(id: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return result[0];
  }

  async getSessionByFingerprint(fingerprint: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.fingerprint, fingerprint)).limit(1);
    return result[0];
  }

  async getSessionByCookieToken(cookieToken: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.cookieToken, cookieToken)).limit(1);
    return result[0];
  }

  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const updateData: any = { ...data };
    // Update lastSeen to current time on any session update
    updateData.lastSeen = new Date();
    const result = await db.update(sessions).set(updateData).where(eq(sessions.id, id)).returning();
    return result[0];
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.sessionId, sessionId)).orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(conversations).set(updateData).where(eq(conversations.id, id)).returning();
    return result[0];
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Audio cache methods
  async getAudioCache(id: string): Promise<AudioCache | undefined> {
    const result = await db.select().from(audioCache).where(eq(audioCache.id, id)).limit(1);
    return result[0];
  }

  async getAudioCacheByToken(secureToken: string): Promise<AudioCache | undefined> {
    const result = await db.select().from(audioCache).where(eq(audioCache.secureToken, secureToken)).limit(1);
    return result[0];
  }

  async getAudioCacheBySession(sessionId: string): Promise<AudioCache[]> {
    return await db.select().from(audioCache).where(eq(audioCache.sessionId, sessionId)).orderBy(desc(audioCache.createdAt));
  }

  async getAudioCacheByConversation(conversationId: string): Promise<AudioCache[]> {
    return await db.select().from(audioCache).where(eq(audioCache.conversationId, conversationId)).orderBy(audioCache.createdAt);
  }

  async createAudioCache(audio: InsertAudioCache): Promise<AudioCache> {
    const result = await db.insert(audioCache).values(audio).returning();
    return result[0];
  }

  // Rate limit methods
  async getRateLimit(sessionId: string): Promise<RateLimit | undefined> {
    const now = new Date();
    const result = await db.select().from(rateLimits)
      .where(and(
        eq(rateLimits.sessionId, sessionId),
        gte(rateLimits.periodEnd, now)
      ))
      .limit(1);
    return result[0];
  }

  async createRateLimit(rateLimit: InsertRateLimit): Promise<RateLimit> {
    const result = await db.insert(rateLimits).values(rateLimit).returning();
    return result[0];
  }

  async updateRateLimit(id: string, data: Partial<RateLimit>): Promise<RateLimit | undefined> {
    const updateData: any = { ...data };
    const result = await db.update(rateLimits).set(updateData).where(eq(rateLimits.id, id)).returning();
    return result[0];
  }

  // Webhook log methods
  async createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog> {
    const result = await db.insert(webhookLogs).values(log).returning();
    return result[0];
  }

  async getWebhookLogs(limit: number = 100): Promise<WebhookLog[]> {
    return await db.select().from(webhookLogs).orderBy(desc(webhookLogs.createdAt)).limit(limit);
  }
  
  // Admin methods
  async getAllAudioCache(limit: number = 100): Promise<AudioCache[]> {
    return await db.select().from(audioCache).orderBy(desc(audioCache.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
