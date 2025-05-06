import { db } from "@db";
import { 
  products, 
  customers, 
  orders, 
  orderItems, 
  activities, 
  productInsertSchema, 
  customerInsertSchema,
  orderInsertSchema,
  orderItemInsertSchema,
  activityInsertSchema,
  ProductInsert,
  CustomerInsert,
  OrderInsert,
  OrderItemInsert,
  ActivityInsert,
  Product,
  Customer,
  Order,
  OrderItem,
  Activity
} from "@shared/schema";
import { eq, desc, and, lte, gte, lt } from "drizzle-orm";

// PRODUCTS
export const getAllProducts = async () => {
  return db.query.products.findMany({
    orderBy: [desc(products.createdAt)]
  });
};

export const getProductById = async (id: number) => {
  return db.query.products.findFirst({
    where: eq(products.id, id)
  });
};

export const createProduct = async (data: ProductInsert) => {
  const validatedData = productInsertSchema.parse(data);
  const [newProduct] = await db.insert(products).values(validatedData).returning();
  return newProduct;
};

export const updateProduct = async (id: number, data: Partial<ProductInsert>) => {
  const [updatedProduct] = await db
    .update(products)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(products.id, id))
    .returning();
  return updatedProduct;
};

export const deleteProduct = async (id: number) => {
  await db.delete(products).where(eq(products.id, id));
};

export const updateProductStock = async (id: number, quantity: number, minimumStock: number) => {
  const [updatedProduct] = await db
    .update(products)
    .set({
      quantity,
      minimumStock,
      updatedAt: new Date()
    })
    .where(eq(products.id, id))
    .returning();
  return updatedProduct;
};

export const getLowStockProducts = async () => {
  return db.query.products.findMany({
    where: (products, { lt, or }) => 
      or(
        lt(products.quantity, products.minimumStock),
        eq(products.quantity, 0)
      )
  });
};

// CUSTOMERS
export const getAllCustomers = async () => {
  return db.query.customers.findMany({
    orderBy: [desc(customers.createdAt)]
  });
};

export const getCustomerById = async (id: number) => {
  return db.query.customers.findFirst({
    where: eq(customers.id, id)
  });
};

export const getCustomerByEmail = async (email: string) => {
  return db.query.customers.findFirst({
    where: eq(customers.email, email)
  });
};

export const createCustomer = async (data: CustomerInsert) => {
  const validatedData = customerInsertSchema.parse(data);
  
  // Check if customer already exists with this email
  const existingCustomer = await getCustomerByEmail(validatedData.email);
  if (existingCustomer) {
    return existingCustomer;
  }
  
  const [newCustomer] = await db.insert(customers).values(validatedData).returning();
  return newCustomer;
};

// ORDERS
export const getAllOrders = async () => {
  return db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)]
  });
};

export const getOrderById = async (id: number) => {
  return db.query.orders.findFirst({
    where: eq(orders.id, id)
  });
};

export const getOrdersByCustomerId = async (customerId: number) => {
  return db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    orderBy: [desc(orders.createdAt)]
  });
};

export const getOrdersByDateRange = async (startDate: Date | string, endDate: Date | string) => {
  const startDateString = startDate instanceof Date ? startDate.toISOString() : startDate;
  const endDateString = endDate instanceof Date ? endDate.toISOString() : endDate;
  
  return db.query.orders.findMany({
    where: and(
      gte(orders.createdAt, startDateString),
      lte(orders.createdAt, endDateString)
    ),
    orderBy: [desc(orders.createdAt)]
  });
};

export const getActiveOrders = async () => {
  return db.query.orders.findMany({
    where: (orders, { eq, or }) => or(
      eq(orders.status, 'pending'),
      eq(orders.status, 'processing')
    ),
    orderBy: [desc(orders.createdAt)]
  });
};

export const createOrder = async (data: OrderInsert) => {
  const validatedData = orderInsertSchema.parse(data);
  const [newOrder] = await db.insert(orders).values(validatedData).returning();
  return newOrder;
};

export const updateOrder = async (id: number, data: Partial<OrderInsert>) => {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(orders.id, id))
    .returning();
  return updatedOrder;
};

// ORDER ITEMS
export const getOrderItemsByOrderId = async (orderId: number) => {
  return db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId)
  });
};

export const getOrderItemsByProductId = async (productId: number) => {
  return db.query.orderItems.findMany({
    where: eq(orderItems.productId, productId)
  });
};

export const getOrderItemsWithProductByOrderId = async (orderId: number) => {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId)
  });
  
  const result = [];
  
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product) {
      result.push({
        ...item,
        product
      });
    }
  }
  
  return result;
};

export const createOrderItem = async (data: OrderItemInsert) => {
  const validatedData = orderItemInsertSchema.parse(data);
  const [newOrderItem] = await db.insert(orderItems).values(validatedData).returning();
  return newOrderItem;
};

// ACTIVITIES
export const getRecentActivities = async (limit = 10) => {
  return db.query.activities.findMany({
    orderBy: [desc(activities.createdAt)],
    limit
  });
};

export const createActivity = async (data: ActivityInsert) => {
  const validatedData = activityInsertSchema.parse(data);
  const [newActivity] = await db.insert(activities).values(validatedData).returning();
  return newActivity;
};

export const storage = {
  // Products
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getLowStockProducts,
  
  // Customers
  getAllCustomers,
  getCustomerById,
  getCustomerByEmail,
  createCustomer,
  
  // Orders
  getAllOrders,
  getOrderById,
  getOrdersByCustomerId,
  getOrdersByDateRange,
  getActiveOrders,
  createOrder,
  updateOrder,
  
  // Order Items
  getOrderItemsByOrderId,
  getOrderItemsByProductId,
  getOrderItemsWithProductByOrderId,
  createOrderItem,
  
  // Activities
  getRecentActivities,
  createActivity
};
