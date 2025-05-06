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
import { eq, desc, and, lte, gte, lt, sql } from "drizzle-orm";

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
  // Convert to SQL-compatible date strings
  const formatDate = (date: Date | string): string => {
    if (date instanceof Date) {
      return date.toISOString();
    }
    return String(date);
  };
  
  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);
  
  // Criando SQL customizado para evitar problemas de tipagem
  const query = db.select().from(orders).where(
    sql`${orders.createdAt} >= ${startDateFormatted} AND ${orders.createdAt} <= ${endDateFormatted}`
  ).orderBy(desc(orders.createdAt));
  
  return query;
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

// EXCHANGE RATES
// Cache para taxas de câmbio
interface ExchangeRateCache {
  [key: string]: {
    rates: { [currency: string]: number };
    timestamp: number;
    hits: number;
  };
}

const exchangeRateCache: ExchangeRateCache = {};
const CACHE_TTL = 3600000; // 1 hora em milissegundos
const CACHE_MAX_SIZE = 100; // Limite máximo de entradas em cache

export const getExchangeRates = async (baseCurrency = 'USD', date?: string): Promise<{rates: {[currency: string]: number}, timestamp: number, cached: boolean}> => {
  const cacheKey = `${baseCurrency}_${date || 'latest'}`;
  const now = Date.now();
  
  // Verificar se temos no cache e se ainda é válido
  if (exchangeRateCache[cacheKey] && (now - exchangeRateCache[cacheKey].timestamp) < CACHE_TTL) {
    // Incrementar contador de hits para esta entrada de cache
    exchangeRateCache[cacheKey].hits = (exchangeRateCache[cacheKey].hits || 0) + 1;
    
    return { 
      ...exchangeRateCache[cacheKey],
      cached: true
    };
  }
  
  // Limpar cache se exceder o tamanho máximo
  const cacheSize = Object.keys(exchangeRateCache).length;
  if (cacheSize >= CACHE_MAX_SIZE) {
    // Remover as entradas mais antigas ou menos usadas
    const entries = Object.entries(exchangeRateCache);
    // Ordenar pelo timestamp (mais antigo primeiro) ou menor número de hits
    entries.sort((a, b) => {
      // Se a diferença de timestamp for grande, use isso como critério
      const timeDiff = a[1].timestamp - b[1].timestamp;
      if (Math.abs(timeDiff) > CACHE_TTL / 2) {
        return timeDiff;
      }
      // Caso contrário, use o número de hits como critério
      return (a[1].hits || 0) - (b[1].hits || 0);
    });
    
    // Remover 20% das entradas mais antigas/menos usadas
    const removeCount = Math.ceil(cacheSize * 0.2); 
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      delete exchangeRateCache[entries[i][0]];
    }
  }
  
  try {
    // Se não estiver no cache ou expirou, buscar nova taxa
    // Esta implementação usa taxas de conversão estáticas para demonstração
    // Em um ambiente real, você usaria uma API externa como Open Exchange Rates, APILAYER, etc.
    const baseRates: {[key: string]: number} = {
      'USD': 1.0,
      'EUR': 0.92,
      'BRL': 5.20,
      'GBP': 0.78,
      'JPY': 150.45,
      'CAD': 1.35,
      'AUD': 1.52,
      'CNY': 7.23,
      'CHF': 0.89,
      'MXN': 16.85
    };
    
    // Converter todas as taxas para a moeda base solicitada
    const baseRate = baseRates[baseCurrency] || 1;
    
    // Calcular taxas de acordo com a moeda base
    const rates: {[key: string]: number} = {};
    for (const [currency, rate] of Object.entries(baseRates)) {
      rates[currency] = rate / baseRate;
    }
    
    // Armazenar no cache
    const result = {
      rates,
      timestamp: now,
      cached: false
    };
    
    exchangeRateCache[cacheKey] = {
      rates,
      timestamp: now,
      hits: 1  // Iniciar contador de hits
    };
    
    return result;
  } catch (error) {
    console.error('Erro ao buscar taxas de câmbio:', error);
    throw new Error('Não foi possível obter as taxas de câmbio');
  }
};

export const convertCurrency = async (
  amount: number, 
  fromCurrency = 'USD', 
  toCurrency = 'BRL', 
  date?: string
): Promise<{amount: number, rate: number}> => {
  const { rates } = await getExchangeRates(fromCurrency, date);
  
  if (!rates[toCurrency]) {
    throw new Error(`Moeda ${toCurrency} não disponível para conversão`);
  }
  
  const rate = rates[toCurrency];
  return {
    amount: amount * rate,
    rate
  };
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
  createActivity,
  
  // Exchange Rates
  getExchangeRates,
  convertCurrency
};
