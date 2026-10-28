import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateClientBody,
  CreateClientResponse,
  CreateTestimonialBody,
  CreateTestimonialResponse,
  DeleteClientParams,
  DeleteClientResponse,
  DeleteTestimonialParams,
  DeleteTestimonialResponse,
  GetAdminHealthcareCaseStudyResponse,
  GetPublicHealthcareCaseStudyResponse,
  ListAdminClientsResponse,
  ListAdminTestimonialsResponse,
  ListPublicClientsResponse,
  ListPublicTestimonialsResponse,
  UpdateClientBody,
  UpdateClientParams,
  UpdateClientResponse,
  UpdateHealthcareCaseStudyBody,
  UpdateHealthcareCaseStudyResponse,
  UpdateTestimonialBody,
  UpdateTestimonialParams,
  UpdateTestimonialResponse,
} from "@workspace/api-zod";
import {
  clientsTable,
  db,
  healthcareCaseStudyTable,
  testimonialsTable,
} from "@workspace/db";
import { requireAdmin } from "../middlewares/adminSession";

const router: IRouter = Router();

async function getCaseStudy() {
  const [study] = await db
    .select()
    .from(healthcareCaseStudyTable)
    .where(eq(healthcareCaseStudyTable.id, 1))
    .limit(1);
  return study;
}

router.get("/clients", async (_req, res): Promise<void> => {
  const clients = await db
    .select()
    .from(clientsTable)
    .orderBy(asc(clientsTable.displayOrder), asc(clientsTable.id));
  res.json(ListPublicClientsResponse.parse(clients));
});

router.get("/admin/clients", requireAdmin, async (_req, res): Promise<void> => {
  const clients = await db
    .select()
    .from(clientsTable)
    .orderBy(asc(clientsTable.displayOrder), asc(clientsTable.id));
  res.json(ListAdminClientsResponse.parse(clients));
});

router.post("/admin/clients", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [client] = await db.insert(clientsTable).values(parsed.data).returning();
  res.status(201).json(CreateClientResponse.parse(client));
});

router.patch("/admin/clients/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateClientParams.safeParse(req.params);
  const parsed = UpdateClientBody.safeParse(req.body);
  if (!params.success || !parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    res.status(400).json({ error: !params.success ? params.error.message : !parsed.success ? parsed.error.message : "Provide a field to update" });
    return;
  }
  const [client] = await db
    .update(clientsTable)
    .set(parsed.data)
    .where(eq(clientsTable.id, params.data.id))
    .returning();
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json(UpdateClientResponse.parse(client));
});

router.delete("/admin/clients/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [client] = await db
    .delete(clientsTable)
    .where(eq(clientsTable.id, params.data.id))
    .returning({ id: clientsTable.id });
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.status(204).json(DeleteClientResponse.parse(undefined));
});

router.get("/case-study/healthcare", async (_req, res): Promise<void> => {
  const study = await getCaseStudy();
  if (!study) {
    res.status(404).json({ error: "Healthcare case study not found" });
    return;
  }
  res.json(GetPublicHealthcareCaseStudyResponse.parse(study));
});

router.get("/admin/case-study/healthcare", requireAdmin, async (_req, res): Promise<void> => {
  const study = await getCaseStudy();
  if (!study) {
    res.status(404).json({ error: "Healthcare case study not found" });
    return;
  }
  res.json(GetAdminHealthcareCaseStudyResponse.parse(study));
});

router.put("/admin/case-study/healthcare", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateHealthcareCaseStudyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [study] = await db
    .insert(healthcareCaseStudyTable)
    .values({ id: 1, ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: healthcareCaseStudyTable.id,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();
  res.json(UpdateHealthcareCaseStudyResponse.parse(study));
});

router.get("/testimonials", async (_req, res): Promise<void> => {
  const testimonials = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.published, true))
    .orderBy(asc(testimonialsTable.displayOrder), asc(testimonialsTable.id));
  res.json(ListPublicTestimonialsResponse.parse(testimonials));
});

router.get("/admin/testimonials", requireAdmin, async (_req, res): Promise<void> => {
  const testimonials = await db
    .select()
    .from(testimonialsTable)
    .orderBy(asc(testimonialsTable.displayOrder), asc(testimonialsTable.id));
  res.json(ListAdminTestimonialsResponse.parse(testimonials));
});

router.post("/admin/testimonials", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateTestimonialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [testimonial] = await db.insert(testimonialsTable).values(parsed.data).returning();
  res.status(201).json(CreateTestimonialResponse.parse(testimonial));
});

router.patch("/admin/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateTestimonialParams.safeParse(req.params);
  const parsed = UpdateTestimonialBody.safeParse(req.body);
  if (!params.success || !parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    res.status(400).json({ error: !params.success ? params.error.message : !parsed.success ? parsed.error.message : "Provide a field to update" });
    return;
  }
  const [testimonial] = await db
    .update(testimonialsTable)
    .set(parsed.data)
    .where(eq(testimonialsTable.id, params.data.id))
    .returning();
  if (!testimonial) {
    res.status(404).json({ error: "Testimonial not found" });
    return;
  }
  res.json(UpdateTestimonialResponse.parse(testimonial));
});

router.delete("/admin/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteTestimonialParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [testimonial] = await db
    .delete(testimonialsTable)
    .where(eq(testimonialsTable.id, params.data.id))
    .returning({ id: testimonialsTable.id });
  if (!testimonial) {
    res.status(404).json({ error: "Testimonial not found" });
    return;
  }
  res.status(204).json(DeleteTestimonialResponse.parse(undefined));
});

export default router;
