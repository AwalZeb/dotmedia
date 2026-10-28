import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateEnquiryBody,
  CreateEnquiryResponse,
  ListAdminEnquiriesResponse,
  UpdateAdminEnquiryBody,
  UpdateAdminEnquiryQueryParams,
  UpdateAdminEnquiryResponse,
} from "@workspace/api-zod";
import { db, enquiriesTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminSession";

const router: IRouter = Router();
const submissions = new Map<string, { count: number; resetAt: number }>();
const SUBMISSION_LIMIT = 4;
const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;
const successMessage = "Thank you! We've received your message and will contact you soon.";

function isSubmissionLimited(ip: string): boolean {
  const now = Date.now();
  const current = submissions.get(ip);
  if (!current || current.resetAt <= now) {
    submissions.set(ip, { count: 1, resetAt: now + SUBMISSION_WINDOW_MS });
    return false;
  }
  if (current.count >= SUBMISSION_LIMIT) return true;
  current.count += 1;
  return false;
}

async function sendNotification(enquiry: {
  fullName: string;
  phone: string;
  email: string | null;
  businessName: string;
  businessType: string;
  services: string[];
  message: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "Dot Media <onboarding@resend.dev>",
        to: ["dotmedia98@gmail.com"],
        reply_to: enquiry.email || undefined,
        subject: `New website enquiry from ${enquiry.fullName}`,
        text: [
          `Name: ${enquiry.fullName}`,
          `Phone / WhatsApp: ${enquiry.phone}`,
          `Email: ${enquiry.email || "Not provided"}`,
          `Business or practice: ${enquiry.businessName || "Not specified"}`,
          `Business type: ${enquiry.businessType || "Not specified"}`,
          `Services: ${enquiry.services.join(", ") || "Not specified"}`,
          "",
          enquiry.message || "No message provided.",
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      console.warn(`Enquiry notification was not sent (Resend status ${response.status}).`);
    }
  } catch {
    console.warn("Enquiry notification could not be sent.");
  }
}

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const ip = req.ip ?? "unknown";
  if (isSubmissionLimited(ip)) {
    res.status(429).json({ error: "Please wait a few minutes before sending another enquiry." });
    return;
  }

  // Silently accept likely bot submissions without storing or notifying.
  if (parsed.data.website.trim()) {
    res.status(201).json(CreateEnquiryResponse.parse({ message: successMessage }));
    return;
  }

  const enquiry = {
    fullName: parsed.data.fullName.trim(),
    phone: parsed.data.phone.trim(),
    email: parsed.data.email?.trim() || null,
    businessName: parsed.data.businessName?.trim() || "",
    businessType: parsed.data.businessType?.trim() || "",
    services: parsed.data.services ?? [],
    message: parsed.data.message?.trim() || "",
  };

  const [saved] = await db.insert(enquiriesTable).values(enquiry).returning();
  void sendNotification(enquiry);
  res.status(201).json(CreateEnquiryResponse.parse({ message: successMessage }));
  void saved;
});

router.get("/admin/enquiries", requireAdmin, async (_req, res): Promise<void> => {
  const enquiries = await db
    .select()
    .from(enquiriesTable)
    .orderBy(desc(enquiriesTable.createdAt));
  res.json(ListAdminEnquiriesResponse.parse(enquiries));
});

router.patch("/admin/enquiries", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminEnquiryQueryParams.safeParse(req.query);
  const body = UpdateAdminEnquiryBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [enquiry] = await db
    .update(enquiriesTable)
    .set({ status: body.data.status })
    .where(eq(enquiriesTable.id, params.data.id))
    .returning();
  if (!enquiry) {
    res.status(404).json({ error: "Enquiry not found" });
    return;
  }
  res.json(UpdateAdminEnquiryResponse.parse(enquiry));
});

export default router;
