import { pgTable, serial, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  orderDate: text("order_date").notNull(),
  estimatedReadyDate: text("estimated_ready_date"),
  items: jsonb("items").notNull().$type<OrderItem[]>(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  photoUrls: jsonb("photo_urls").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}
