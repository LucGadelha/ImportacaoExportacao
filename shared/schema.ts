import { pgTable, text, serial, integer, timestamp, numeric, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const productCategoryEnum = pgEnum('product_category', [
  'electronics',
  'computers',
  'peripherals',
  'accessories'
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'canceled'
]);

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'agendado',     // Scheduled
  'em_preparacao', // In preparation
  'pronto',        // Ready
  'em_transito',   // In transit
  'entregue',      // Delivered
  'cancelado'      // Cancelled
]);

export const shipmentTypeEnum = pgEnum('shipment_type', [
  'maritimo',     // Maritime
  'aereo',        // Air
  'rodoviario',   // Road
  'ferroviario'   // Rail
]);

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  category: productCategoryEnum("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // order, product, inventory, shipment
  description: text("description").notNull(),
  referenceId: integer("reference_id"), // ID related to the activity type
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Carriers (Transportadoras)
export const carriers = pgTable("carriers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  contact: text("contact").notNull(),
  phone: text("phone"),
  email: text("email"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Shipments (Embarques)
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  shipmentNumber: text("shipment_number").notNull().unique(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  carrierId: integer("carrier_id").references(() => carriers.id).notNull(),
  type: shipmentTypeEnum("type").notNull(),
  status: shipmentStatusEnum("status").notNull().default('agendado'),
  scheduledDate: timestamp("scheduled_date").notNull(),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  notes: text("notes"),
  documents: text("documents"), // JSON string with document references
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems)
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  shipments: many(shipments)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] })
}));

export const carriersRelations = relations(carriers, ({ many }) => ({
  shipments: many(shipments)
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, { fields: [shipments.orderId], references: [orders.id] }),
  carrier: one(carriers, { fields: [shipments.carrierId], references: [carriers.id] })
}));

// Validation Schemas
export const productInsertSchema = createInsertSchema(products, {
  name: (schema) => schema.min(3, "O nome deve ter pelo menos 3 caracteres"),
  code: (schema) => schema.min(2, "O código deve ter pelo menos 2 caracteres"),
  price: (schema) => schema.min(0.01, "O preço deve ser maior que zero"),
  quantity: (schema) => schema.min(0, "A quantidade não pode ser negativa"),
  minimumStock: (schema) => schema.min(0, "O estoque mínimo não pode ser negativo")
});

export const customerInsertSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: (schema) => schema.email("E-mail inválido")
});

export const orderInsertSchema = createInsertSchema(orders, {
  total: (schema) => schema.min(0, "O total deve ser maior ou igual a zero")
});

export const orderItemInsertSchema = createInsertSchema(orderItems, {
  quantity: (schema) => schema.min(1, "A quantidade deve ser pelo menos 1"),
  price: (schema) => schema.min(0, "O preço não pode ser negativo")
});

export const activityInsertSchema = createInsertSchema(activities);

export const carrierInsertSchema = createInsertSchema(carriers, {
  name: (schema) => schema.min(3, "O nome deve ter pelo menos 3 caracteres"),
  code: (schema) => schema.min(2, "O código deve ter pelo menos 2 caracteres"),
  contact: (schema) => schema.min(3, "O nome do contato deve ter pelo menos 3 caracteres"),
  email: (schema) => schema.email("E-mail inválido").optional().nullable()
});

export const shipmentInsertSchema = createInsertSchema(shipments, {
  shipmentNumber: (schema) => schema.min(4, "O número do embarque deve ter pelo menos 4 caracteres"),
  origin: (schema) => schema.min(3, "A origem deve ter pelo menos 3 caracteres"),
  destination: (schema) => schema.min(3, "O destino deve ter pelo menos 3 caracteres")
});

// Types
export type Product = typeof products.$inferSelect;
export type ProductInsert = z.infer<typeof productInsertSchema>;

export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = z.infer<typeof customerInsertSchema>;

export type Order = typeof orders.$inferSelect;
export type OrderInsert = z.infer<typeof orderInsertSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type OrderItemInsert = z.infer<typeof orderItemInsertSchema>;

export type Activity = typeof activities.$inferSelect;
export type ActivityInsert = z.infer<typeof activityInsertSchema>;

export type Carrier = typeof carriers.$inferSelect;
export type CarrierInsert = z.infer<typeof carrierInsertSchema>;

export type Shipment = typeof shipments.$inferSelect;
export type ShipmentInsert = z.infer<typeof shipmentInsertSchema>;
