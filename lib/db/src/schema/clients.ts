import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logoUrl: text("logo_url"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({
  id: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
