import { storage } from "../storage";
import { getTierLimits } from "./solana";
import type { Session } from "@shared/schema";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime: Date;
}

export async function checkMessageRateLimit(session: Session): Promise<RateLimitResult> {
  const limits = getTierLimits(session.tier);
  const now = new Date();
  
  // Get or create rate limit for current period
  let rateLimit = await storage.getRateLimit(session.id);
  
  if (!rateLimit) {
    // Create new rate limit period
    const periodEnd = new Date(now.getTime() + limits.messagePeriodHours * 60 * 60 * 1000);
    rateLimit = await storage.createRateLimit({
      sessionId: session.id,
      periodStart: now,
      periodEnd,
      messagesUsed: 0,
      voiceMinutesUsed: 0,
    });
  }

  const allowed = rateLimit.messagesUsed < limits.messageLimit;
  const remaining = Math.max(0, limits.messageLimit - rateLimit.messagesUsed);

  return {
    allowed,
    remaining,
    limit: limits.messageLimit,
    resetTime: rateLimit.periodEnd,
  };
}

export async function incrementMessageCount(sessionId: string): Promise<void> {
  const rateLimit = await storage.getRateLimit(sessionId);
  if (rateLimit) {
    await storage.updateRateLimit(rateLimit.id, {
      messagesUsed: rateLimit.messagesUsed + 1,
    });
  }
}

export async function checkVoiceRateLimit(session: Session, minutesRequested: number = 1): Promise<RateLimitResult> {
  const limits = getTierLimits(session.tier);
  const now = new Date();
  
  // Get or create rate limit for current period
  let rateLimit = await storage.getRateLimit(session.id);
  
  if (!rateLimit) {
    // Create new rate limit period
    const periodEnd = new Date(now.getTime() + limits.voicePeriodHours * 60 * 60 * 1000);
    rateLimit = await storage.createRateLimit({
      sessionId: session.id,
      periodStart: now,
      periodEnd,
      messagesUsed: 0,
      voiceMinutesUsed: 0,
    });
  }

  const allowed = (rateLimit.voiceMinutesUsed + minutesRequested) <= limits.voiceLimit;
  const remaining = Math.max(0, limits.voiceLimit - rateLimit.voiceMinutesUsed);

  return {
    allowed,
    remaining,
    limit: limits.voiceLimit,
    resetTime: rateLimit.periodEnd,
  };
}

export async function incrementVoiceMinutes(sessionId: string, minutes: number): Promise<void> {
  const rateLimit = await storage.getRateLimit(sessionId);
  if (rateLimit) {
    await storage.updateRateLimit(rateLimit.id, {
      voiceMinutesUsed: rateLimit.voiceMinutesUsed + minutes,
    });
  }
}
