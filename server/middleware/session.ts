import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { generateFingerprint, generateCookieToken } from "../utils/fingerprint";
import type { Session } from "@shared/schema";

const COOKIE_NAME = "autism_session";
const COOKIE_MAX_AGE = 180 * 24 * 60 * 60 * 1000; // 180 days in milliseconds

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const fingerprint = generateFingerprint(req);
    const cookieToken = req.cookies[COOKIE_NAME];
    
    let session: Session | undefined;

    // Try to get session by cookie token first (if exists and valid)
    if (cookieToken) {
      session = await storage.getSessionByCookieToken(cookieToken);
      
      // Check if cookie is still valid
      if (session && session.cookieExpiry && session.cookieExpiry < new Date()) {
        // Cookie expired, create new one
        const newCookieToken = generateCookieToken();
        const newExpiry = new Date(Date.now() + COOKIE_MAX_AGE);
        
        session = await storage.updateSession(session.id, {
          cookieToken: newCookieToken,
          cookieExpiry: newExpiry,
        });

        // Set new cookie
        res.cookie(COOKIE_NAME, newCookieToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: COOKIE_MAX_AGE,
        });
      } else if (session) {
        // Extend cookie expiry on each request
        const newExpiry = new Date(Date.now() + COOKIE_MAX_AGE);
        session = await storage.updateSession(session.id, {
          cookieExpiry: newExpiry,
        });

        // Update cookie
        res.cookie(COOKIE_NAME, cookieToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: COOKIE_MAX_AGE,
        });
      }
    }

    // If no session from cookie, try fingerprint
    if (!session) {
      session = await storage.getSessionByFingerprint(fingerprint);
    }

    // If still no session, create a new one
    if (!session) {
      const cookieToken = generateCookieToken();
      const cookieExpiry = new Date(Date.now() + COOKIE_MAX_AGE);
      
      session = await storage.createSession({
        fingerprint,
        tier: "Free Trial",
        tokenBalance: 0,
        cookieToken,
        cookieExpiry,
      });

      // Set cookie for new session
      res.cookie(COOKIE_NAME, cookieToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
      });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error("Session middleware error:", error);
    next(error);
  }
}
