import { createHash, timingSafeEqual } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  EndAdminSessionResponse,
  GetAdminSessionResponse,
  StartAdminSessionBody,
  StartAdminSessionResponse,
} from "@workspace/api-zod";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isAdminSessionValid,
} from "../middlewares/adminSession";

const router: IRouter = Router();
const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function consumeLoginAttempt(ip: string): boolean {
  const now = Date.now();
  const existing = attempts.get(ip);
  if (!existing || existing.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return true;
  }
  if (existing.count >= ATTEMPT_LIMIT) return false;
  existing.count += 1;
  return true;
}

function samePassword(candidate: string, expected: string): boolean {
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash);
}

router.get("/admin/auth/session", (req, res): void => {
  res.json(
    GetAdminSessionResponse.parse({
      authenticated: isAdminSessionValid(req.cookies?.[ADMIN_SESSION_COOKIE]),
      configured: Boolean(process.env.ADMIN_PASSWORD?.trim() && process.env.SESSION_SECRET?.trim()),
    }),
  );
});

router.post("/admin/auth/session", (req, res): void => {
  const parsed = StartAdminSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const password = process.env.ADMIN_PASSWORD?.trim();
  const key = process.env.SESSION_SECRET?.trim();
  if (!password || !key) {
    res.status(503).json({ error: "Administrator sign-in is not configured yet." });
    return;
  }

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

  const ip = req.ip ?? "unknown";
  if (!consumeLoginAttempt(ip)) {
    res.status(429).json({ error: "Too many attempts. Please wait before trying again." });
    return;
  }

  if (!samePassword(parsed.data.password, password)) {
    res.status(401).json({ error: "The password was not accepted." });
    return;
  }

  attempts.delete(ip);
  res.cookie(ADMIN_SESSION_COOKIE, createAdminSessionToken(), adminSessionCookieOptions());
  res.json(StartAdminSessionResponse.parse({ authenticated: true, configured: true }));
});

router.post("/admin/auth/logout", (_req, res): void => {
  res.clearCookie(ADMIN_SESSION_COOKIE, {
    ...adminSessionCookieOptions(),
    maxAge: 0,
  });
  res.json(EndAdminSessionResponse.parse({
    authenticated: false,
    configured: Boolean(process.env.ADMIN_PASSWORD?.trim() && process.env.SESSION_SECRET?.trim()),
  }));
});

export default router;
