import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const healthcareCaseStudyTable = pgTable("healthcare_case_study", {
  id: integer("id").primaryKey().default(1),
  clientName: text("client_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Healthcare content"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HealthcareCaseStudy = typeof healthcareCaseStudyTable.$inferSelect;
