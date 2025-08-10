import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isDriver: integer("is_driver").default(0),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  status: text("status").notNull().default("created"),
  createdAt: timestamp("created_at").defaultNow(),
  customerName: text("customer_name").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  retailer: text("retailer").notNull(),
  notes: text("notes"),
  price: integer("price").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  isDriver: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  pickupAddress: true,
  retailer: true,
  notes: true,
  price: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
