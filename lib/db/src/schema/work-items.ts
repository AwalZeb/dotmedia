import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workItemsTable = pgTable("work_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type").notNull().default("image"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkItemSchema = createInsertSchema(workItemsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkItem = z.infer<typeof insertWorkItemSchema>;
export type WorkItem = typeof workItemsTable.$inferSelect;
