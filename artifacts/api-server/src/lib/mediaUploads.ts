/**
 * Rules for media that administrators may upload for the public website.
 * Mirrored on the client for instant feedback; the server copy is the one
 * that counts.
 */
export const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] as const;
export const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 300 * 1024 * 1024;

export type UploadKind = "image" | "video";

type UploadVerdict =
  | { ok: true; kind: UploadKind }
  | { ok: false; status: 413 | 415; message: string };

const MEGABYTE = 1024 * 1024;

export function describeUploadLimits(): string {
  return `Images (JPG, PNG, WebP, GIF, AVIF) up to ${MAX_IMAGE_BYTES / MEGABYTE} MB and videos (MP4, WebM, MOV) up to ${MAX_VIDEO_BYTES / MEGABYTE} MB are accepted.`;
}

export function uploadKindFor(contentType: string): UploadKind | null {
  const normalized = contentType.trim().toLowerCase();
  if ((IMAGE_CONTENT_TYPES as readonly string[]).includes(normalized)) return "image";
  if ((VIDEO_CONTENT_TYPES as readonly string[]).includes(normalized)) return "video";
  return null;
}

export function validateUpload(input: { size: number; contentType: string }): UploadVerdict {
  const kind = uploadKindFor(input.contentType);
  if (!kind) {
    return {
      ok: false,
      status: 415,
      message: `That file type is not supported. ${describeUploadLimits()}`,
    };
  }
  const limit = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (input.size > limit) {
    return {
      ok: false,
      status: 413,
      message: kind === "image"
        ? `Images must be ${MAX_IMAGE_BYTES / MEGABYTE} MB or smaller. Export a compressed JPG or WebP for the web.`
        : `Videos must be ${MAX_VIDEO_BYTES / MEGABYTE} MB or smaller. Export a compressed MP4 (H.264) for the web.`,
    };
  }
  return { ok: true, kind };
}

/** True when a stored media reference points at an uploaded App Storage object. */
export function isStoredObjectPath(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\/objects\/[A-Za-z0-9._\-/]+$/.test(value);
}
