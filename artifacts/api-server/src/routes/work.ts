import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, workItemsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminSession";
import {
  CreateWorkItemBody,
  CreateWorkItemResponse,
  DeleteWorkItemParams,
  ListAdminWorkResponse,
  ListPublicWorkQueryParams,
  ListPublicWorkResponse,
  UpdateWorkItemBody,
  UpdateWorkItemParams,
  UpdateWorkItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/work", async (req, res): Promise<void> => {
  const query = ListPublicWorkQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const filters = [eq(workItemsTable.published, true)];
  if (query.data.featured !== undefined) {
    filters.push(eq(workItemsTable.featured, query.data.featured));
  }

  const items = await db
    .select()
    .from(workItemsTable)
    .where(and(...filters))
    .orderBy(workItemsTable.displayOrder, desc(workItemsTable.createdAt));

  res.json(ListPublicWorkResponse.parse(items));
});

router.get("/admin/work", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(workItemsTable)
    .orderBy(workItemsTable.displayOrder, desc(workItemsTable.createdAt));
  res.json(ListAdminWorkResponse.parse(items));
});

router.post("/admin/work", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateWorkItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(workItemsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateWorkItemResponse.parse(item));
});

router.patch(
  "/admin/work/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateWorkItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdateWorkItemBody.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
      res.status(400).json({
        error: parsed.success ? "Provide at least one field to update" : parsed.error.message,
      });
      return;
    }

    const [item] = await db
      .update(workItemsTable)
      .set(parsed.data)
      .where(eq(workItemsTable.id, params.data.id))
      .returning();

    if (!item) {
      res.status(404).json({ error: "Work item not found" });
      return;
    }
    res.json(UpdateWorkItemResponse.parse(item));
  },
);

router.delete(
  "/admin/work/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeleteWorkItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [item] = await db
      .delete(workItemsTable)
      .where(eq(workItemsTable.id, params.data.id))
      .returning({ id: workItemsTable.id });
    if (!item) {
      res.status(404).json({ error: "Work item not found" });
      return;
    }
    res.sendStatus(204);
  },
);

export default router;
