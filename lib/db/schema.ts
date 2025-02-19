import { pgTable, text, timestamp, decimal } from "drizzle-orm/pg-core";

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  file_url: text("file_url").notNull(),
  customer_name: text("customer_name"),
  vendor_name: text("vendor_name"),
  invoice_number: text("invoice_number").unique(),
  invoice_date: timestamp("invoice_date"),
  due_date: timestamp("due_date"),
  amount: decimal("amount"),
  created_at: timestamp("created_at").defaultNow(),
});
