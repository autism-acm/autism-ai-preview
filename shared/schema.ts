import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - stores admin users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table - tracks user sessions with fingerprinting
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fingerprint: text("fingerprint").notNull(), // Combined hash of cookie, IP, user agent
  walletAddress: text("wallet_address"),
  tokenBalance: integer("token_balance").default(0).notNull(),
  tier: text("tier").default("Free Trial").notNull(), // "Free Trial", "Electrum", "Pro", "Gold"
  cookieToken: text("cookie_token").unique(),
  cookieExpiry: timestamp("cookie_expiry"),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  fingerprintIdx: index("fingerprint_idx").on(table.fingerprint),
  cookieTokenIdx: index("cookie_token_idx").on(table.cookieToken),
  walletAddressIdx: index("wallet_address_idx").on(table.walletAddress),
}));

// Conversations table
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index("conversation_session_idx").on(table.sessionId),
}));

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  isImage: boolean("is_image").default(false).notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  metadata: jsonb("metadata"), // Store additional data like generation params
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index("message_conversation_idx").on(table.conversationId),
  createdAtIdx: index("message_created_at_idx").on(table.createdAt),
}));

// Audio cache table - stores all generated audio files securely
export const audioCache = pgTable("audio_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  messageId: varchar("message_id").references(() => messages.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url").notNull(),
  secureToken: text("secure_token").notNull().unique(), // For secure access
  text: text("text").notNull(), // Original text that was converted to speech
  duration: integer("duration"), // Duration in seconds
  voiceSettings: jsonb("voice_settings"), // ElevenLabs voice configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index("audio_session_idx").on(table.sessionId),
  conversationIdIdx: index("audio_conversation_idx").on(table.conversationId),
  createdAtIdx: index("audio_created_at_idx").on(table.createdAt),
  secureTokenIdx: index("audio_secure_token_idx").on(table.secureToken),
}));

// Rate limit tracking table
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  periodStart: timestamp("period_start").defaultNow().notNull(),
  periodEnd: timestamp("period_end").notNull(),
  messagesUsed: integer("messages_used").default(0).notNull(),
  voiceMinutesUsed: integer("voice_minutes_used").default(0).notNull(),
}, (table) => ({
  sessionIdIdx: index("rate_limit_session_idx").on(table.sessionId),
  periodEndIdx: index("rate_limit_period_end_idx").on(table.periodEnd),
}));

// Webhook logs table - track n8n webhook calls
export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  requestData: jsonb("request_data").notNull(),
  responseData: jsonb("response_data"),
  status: text("status").notNull(), // "success", "error"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("webhook_created_at_idx").on(table.createdAt),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  lastSeen: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertAudioCacheSchema = createInsertSchema(audioCache).omit({
  id: true,
  createdAt: true,
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertAudioCache = z.infer<typeof insertAudioCacheSchema>;
export type AudioCache = typeof audioCache.$inferSelect;

export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;

export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;
