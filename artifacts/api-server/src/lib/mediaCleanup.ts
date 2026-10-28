import { count, eq, or } from "drizzle-orm";
import type { Logger } from "pino";
import { clientsTable, db, testimonialsTable, workItemsTable } from "@workspace/db";
import { isStoredObjectPath } from "./mediaUploads";
import { ObjectNotFoundError, ObjectStorageService } from "./objectStorage";

const objectStorageService = new ObjectStorageService();

/** Number of rows, across every media column, that still point at an uploaded object. */
async function referenceCount(objectPath: string): Promise<number> {
  const [work] = await db
    .select({ value: count() })
    .from(workItemsTable)
    .where(or(eq(workItemsTable.imageUrl, objectPath), eq(workItemsTable.mediaUrl, objectPath)));
  const [clients] = await db
    .select({ value: count() })
    .from(clientsTable)
    .where(eq(clientsTable.logoUrl, objectPath));
  const [testimonials] = await db
    .select({ value: count() })
    .from(testimonialsTable)
    .where(eq(testimonialsTable.imageUrl, objectPath));
  return (work?.value ?? 0) + (clients?.value ?? 0) + (testimonials?.value ?? 0);
}

/**
 * Deletes uploaded objects that no portfolio row references any more, so
 * replaced or removed media does not keep taking up storage. Call it after the
 * database change has been committed. Best-effort: problems are logged and
 * never surfaced to the administrator.
 */
export async function releaseStoredMedia(
  candidates: Array<string | null | undefined>,
  log: Pick<Logger, "info" | "warn">,
): Promise<void> {
  const objectPaths = [...new Set(candidates.filter(isStoredObjectPath))];
  for (const objectPath of objectPaths) {
    try {
      if ((await referenceCount(objectPath)) > 0) continue;
      const file = await objectStorageService.getObjectEntityFile(objectPath);
      await file.delete({ ignoreNotFound: true });
      log.info({ objectPath }, "Deleted upload that is no longer referenced");
    } catch (error) {
      if (error instanceof ObjectNotFoundError) continue;
      log.warn({ err: error, objectPath }, "Could not delete unreferenced upload");
    }
  }
}
