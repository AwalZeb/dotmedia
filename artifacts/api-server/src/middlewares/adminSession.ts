import { createHmac, timingSafeEqual } from "node:crypto";
import type { CookieOptions, RequestHandler } from "express";

export const ADMIN_SESSION_COOKIE = "dot_media_admin";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function sessionKey(): string | null {
  return process.env.SESSION_SECRET?.trim() || null;
}

function signature(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function isAdminSessionValid(token?: string): boolean {
  const key = sessionKey();
  if (!key || !token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const providedSignature = token.slice(separator + 1);
  const expectedSignature = signature(payload, key);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      expiresAt?: unknown;
    };
    return typeof decoded.expiresAt === "number" && decoded.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string {
  const key = sessionKey();
  if (!key) throw new Error("SESSION_SECRET is not configured");
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000 }),
  ).toString("base64url");
  return `${payload}.${signature(payload, key)}`;
}

export function adminSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
    maxAge: ADMIN_SESSION_TTL_SECONDS * 1000,
  };
}

export const requireAdmin: RequestHandler = (req, res, next): void => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== req.get("host")) {
          res.status(403).json({ error: "Request origin was not accepted." });
          return;
        }
      } catch {
        res.status(403).json({ error: "Request origin was not accepted." });
        return;
      }
    }
  }

  if (!isAdminSessionValid(req.cookies?.[ADMIN_SESSION_COOKIE])) {
    res.status(401).json({ error: "Administrator session required" });
    return;
  }
  next();
};
