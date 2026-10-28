/**
 * Delivery of uploaded media to browsers.
 *
 * Instead of piping every image and video through this server, requests for
 * stored media are redirected to short-lived signed App Storage URLs. The
 * browser then downloads straight from storage, which handles range requests
 * (video seeking) natively and keeps large files off the API process.
 *
 * Uploaded object names are random and their content never changes, so signed
 * URLs are cached in memory and reused for most of their lifetime.
 */
import { ObjectStorageService } from "./objectStorage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const SIGNED_URL_TTL_SEC = 60 * 60 * 24;
/** Reuse a cached signed URL until this much of its lifetime remains. */
const REUSE_SAFETY_MARGIN_SEC = 60 * 60 * 2;
/** How long browsers may cache the redirect itself (must stay below the margin). */
export const REDIRECT_CACHE_SECONDS = 60 * 60;
const MAX_CACHED_URLS = 2000;

const objectStorageService = new ObjectStorageService();
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export class InvalidObjectPathError extends Error {
  constructor() {
    super("Invalid object path");
    this.name = "InvalidObjectPathError";
  }
}

/** Splits `/bucket/dir/file` into bucket and object names. */
function parseStoragePath(fullPath: string): { bucketName: string; objectName: string } {
  const parts = (fullPath.startsWith("/") ? fullPath : `/${fullPath}`).split("/");
  if (parts.length < 3 || !parts[1] || !parts.slice(2).join("/")) {
    throw new InvalidObjectPathError();
  }
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

/** Maps an `/objects/...` path (as stored in the database) to its storage location. */
export function storageLocationForObjectPath(objectPath: string): { bucketName: string; objectName: string } {
  if (!/^\/objects\/[A-Za-z0-9._\-/]+$/.test(objectPath) || objectPath.includes("..")) {
    throw new InvalidObjectPathError();
  }
  const entityId = objectPath.slice("/objects/".length);
  const privateDir = objectStorageService.getPrivateObjectDir().replace(/\/$/, "");
  return parseStoragePath(`${privateDir}/${entityId}`);
}

async function signReadUrl(bucketName: string, objectName: string): Promise<string> {
  const response = await fetch(`${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "GET",
      expires_at: new Date(Date.now() + SIGNED_URL_TTL_SEC * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`);
  }
  const { signed_url: signedUrl } = (await response.json()) as { signed_url: string };
  return signedUrl;
}

/** Returns a signed read URL for the object, reusing a cached one when it is still fresh. */
export async function getSignedReadUrl(bucketName: string, objectName: string): Promise<string> {
  const key = `${bucketName}/${objectName}`;
  const cached = signedUrlCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt - REUSE_SAFETY_MARGIN_SEC * 1000 > now) {
    return cached.url;
  }

  const url = await signReadUrl(bucketName, objectName);
  signedUrlCache.delete(key);
  signedUrlCache.set(key, { url, expiresAt: now + SIGNED_URL_TTL_SEC * 1000 });
  if (signedUrlCache.size > MAX_CACHED_URLS) {
    const oldest = signedUrlCache.keys().next().value;
    if (oldest !== undefined) signedUrlCache.delete(oldest);
  }
  return url;
}
