import { Router, type IRouter } from "express";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/adminSession";
import { ObjectStorageService } from "../lib/objectStorage";
import { describeUploadLimits, validateUpload } from "../lib/mediaUploads";
import {
  InvalidObjectPathError,
  REDIRECT_CACHE_SECONDS,
  getSignedReadUrl,
  storageLocationForObjectPath,
} from "../lib/mediaDelivery";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Administrators send JSON metadata (name, size, contentType) — never the
 * file — and receive a presigned URL to PUT the bytes straight into App
 * Storage. Only the media types and sizes the website can display are
 * accepted, so unsupported or oversized files are rejected before any bytes
 * move.
 */
router.post("/storage/uploads/request-url", requireAdmin, async (req, res): Promise<void> => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid upload details." });
    return;
  }

  const verdict = validateUpload(parsed.data);
  if (!verdict.ok) {
    res.status(verdict.status).json({ error: verdict.message });
    return;
  }

  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: parsed.data,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: `Could not prepare the upload. ${describeUploadLimits()}` });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Public assets from PUBLIC_OBJECT_SEARCH_PATHS (files added through the App
 * Storage pane). Redirects to a short-lived signed URL for the first match.
 */
router.get("/storage/public-objects/*filePath", async (req, res): Promise<void> => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    const url = await getSignedReadUrl(file.bucket.name, file.name);
    res.setHeader("Cache-Control", `private, max-age=${REDIRECT_CACHE_SECONDS}`);
    res.redirect(302, url);
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Media uploaded by administrators. Everything stored here is portfolio
 * content meant for the public website, so no session is required. The
 * response is a redirect to a signed storage URL, which the browser caches;
 * storage serves the bytes with native range support so videos can seek.
 */
router.get("/storage/objects/*path", async (req, res): Promise<void> => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const { bucketName, objectName } = storageLocationForObjectPath(`/objects/${wildcardPath}`);
    const url = await getSignedReadUrl(bucketName, objectName);
    res.setHeader("Cache-Control", `private, max-age=${REDIRECT_CACHE_SECONDS}`);
    res.redirect(302, url);
  } catch (error) {
    if (error instanceof InvalidObjectPathError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
