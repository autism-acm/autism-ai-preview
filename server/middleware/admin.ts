import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { User } from "@shared/schema";

const ADMIN_COOKIE_NAME = "autism_admin";
const ADMIN_COOKIE_MAX_AGE = 180 * 24 * 60 * 60 * 1000; // 180 days

declare global {
  namespace Express {
    interface Request {
      admin?: User;
    }
  }
}

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const adminToken = req.cookies[ADMIN_COOKIE_NAME];
    
    if (!adminToken) {
      return res.status(401).json({ error: "Unauthorized - Admin login required" });
    }

    // AdminToken is the user ID for simplicity in this implementation
    const user = await storage.getUser(adminToken);
    
    if (!user || !user.isAdmin) {
      res.clearCookie(ADMIN_COOKIE_NAME);
      return res.status(401).json({ error: "Unauthorized - Admin access required" });
    }

    req.admin = user;
    
    // Extend cookie on each request
    res.cookie(ADMIN_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    next(error);
  }
}
