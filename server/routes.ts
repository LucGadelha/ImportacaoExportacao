import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq, desc, and, lte, gte } from "drizzle-orm";
import { 
  products, 
  customers, 
  orders, 
  orderItems, 
  activities,
  carriers,
  shipments,
  Product, 
  Customer,
  Order,
  OrderItem,
  Carrier,
  Shipment,
  shipmentStatusEnum,
  shipmentTypeEnum
} from "@shared/schema";
import { generateOrderNumber } from "../client/src/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiPrefix = '/api';

  // PRODUCTS ROUTES
  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const idParam = req.params.id;
      // Validar se o id é um número válido
      if (!idParam || isNaN(parseInt(idParam))) {
        return res.status(400).json({ message: "ID de produto inválido" });
      }
      
      const id = parseInt(idParam);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  app.post(`${apiPrefix}/products`, async (req, res) => {
    try {
      const newProduct = await storage.createProduct(req.body);
      
      // Register activity
      await storage.createActivity({
        type: "product",
        description: `Novo produto ${newProduct.name} foi cadastrado`,
        referenceId: newProduct.id
      });
      
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Erro ao criar produto" });
    }
  });

  app.patch(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const idParam = req.params.id;
      // Validar se o id é um número válido
      if (!idParam || isNaN(parseInt(idParam))) {
        return res.status(400).json({ message: "ID de produto inválido" });
      }
      
      const id = parseInt(idParam);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      const updatedProduct = await storage.updateProduct(id, req.body);
      
      // Register activity
      await storage.createActivity({
        type: "product",
        description: `Produto ${updatedProduct.name} foi atualizado`,
        referenceId: updatedProduct.id
      });
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  });

  app.delete(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const idParam = req.params.id;
      // Validar se o id é um número válido
      if (!idParam || isNaN(parseInt(idParam))) {
        return res.status(400).json({ message: "ID de produto inválido" });
      }
      
      const id = parseInt(idParam);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      // Check if product is used in any order
      const orderItems = await storage.getOrderItemsByProductId(id);
      if (orderItems.length > 0) {
        return res.status(400).json({ 
          message: "Não é possível excluir o produto pois está associado a pedidos" 
        });
      }
      
      await storage.deleteProduct(id);
      
      // Register activity
      await storage.createActivity({
        type: "product",
        description: `Produto ${product.name} foi excluído`,
        referenceId: id
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Erro ao excluir produto" });
    }
  });

  app.patch(`${apiPrefix}/products/:id/stock`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      const { quantity, minimumStock } = req.body;
      
      const updatedProduct = await storage.updateProductStock(id, quantity, minimumStock);
      
      // Register activity
      await storage.createActivity({
        type: "inventory",
        description: `Estoque do produto ${updatedProduct.name} foi atualizado para ${quantity} unidades`,
        referenceId: updatedProduct.id
      });
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Erro ao atualizar estoque" });
    }
  });

  app.get(`${apiPrefix}/products/low-stock`, async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Erro ao buscar produtos com estoque baixo" });
    }
  });

  // CUSTOMERS ROUTES
  app.post(`${apiPrefix}/customers`, async (req, res) => {
    try {
      const { name, email } = req.body;
      
      // Check if customer already exists with this email
      const existingCustomer = await storage.getCustomerByEmail(email);
      
      if (existingCustomer) {
        return res.json(existingCustomer); // Return existing customer
      }
      
      const newCustomer = await storage.createCustomer({ name, email });
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Erro ao criar cliente" });
    }
  });

  // ORDERS ROUTES
  app.get(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });

  app.get(`${apiPrefix}/orders/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // Get order items
      const items = await storage.getOrderItemsByOrderId(id);
      
      // Get customer
      const customer = await storage.getCustomerById(order.customerId);
      
      res.json({
        ...order,
        items,
        customer
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Erro ao buscar pedido" });
    }
  });

  app.post(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const { customerName, customerEmail, orderNumber, status, items } = req.body;
      
      // Create or get existing customer
      const customer = await storage.createCustomer({
        name: customerName,
        email: customerEmail
      });
      
      // Calculate total
      let total = 0;
      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
        }
        
        // Check stock
        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Quantidade insuficiente em estoque para o produto ${product.name}` 
          });
        }
        
        const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        total += itemPrice * item.quantity;
      }
      
      // Create order
      const newOrder = await storage.createOrder({
        customerId: customer.id,
        orderNumber: orderNumber || generateOrderNumber(),
        status: status || "pending",
        total: total.toString()
      });
      
      // Create order items and update stock
      for (const item of items) {
        await storage.createOrderItem({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
        
        // Update product stock
        const product = await storage.getProductById(item.productId);
        await storage.updateProductStock(
          item.productId, 
          product!.quantity - item.quantity,
          product!.minimumStock
        );
      }
      
      // Register activity
      await storage.createActivity({
        type: "order",
        description: `Novo pedido ${newOrder.orderNumber} foi registrado`,
        referenceId: newOrder.id
      });
      
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });

  app.patch(`${apiPrefix}/orders/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      const { status } = req.body;
      
      const updatedOrder = await storage.updateOrder(id, { status });
      
      // Register activity
      await storage.createActivity({
        type: "order",
        description: `Status do pedido ${updatedOrder.orderNumber} foi atualizado para ${status}`,
        referenceId: updatedOrder.id
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Erro ao atualizar pedido" });
    }
  });

  // INVENTORY ROUTES
  app.get(`${apiPrefix}/inventory/stats`, async (req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      
      const totalItems = allProducts.reduce((sum, product) => sum + product.quantity, 0);
      
      const lowStockItems = allProducts.filter(product => 
        product.quantity < product.minimumStock
      ).length;
      
      const totalValue = allProducts.reduce((sum, product) => {
        const price = typeof product.price === "string" ? 
          parseFloat(product.price) : product.price;
        return sum + (price * product.quantity);
      }, 0);
      
      res.json({
        totalItems,
        lowStockItems,
        totalValue
      });
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas de estoque" });
    }
  });

  // ACTIVITIES ROUTES
  app.get(`${apiPrefix}/activities`, async (req, res) => {
    try {
      const recentActivities = await storage.getRecentActivities();
      res.json(recentActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Erro ao buscar atividades recentes" });
    }
  });

  // DASHBOARD ROUTES
  app.get(`${apiPrefix}/dashboard/stats`, async (req, res) => {
    try {
      // Total products
      const allProducts = await storage.getAllProducts();
      const totalProducts = allProducts.length;
      
      // Active orders
      const activeOrders = await storage.getActiveOrders();
      
      // Stock alerts
      const lowStockProducts = await storage.getLowStockProducts();
      const stockAlerts = lowStockProducts.length;
      
      // Monthly revenue
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const thisMonthOrders = await storage.getOrdersByDateRange(
        startOfMonth.toISOString(),
        currentDate.toISOString()
      );
      
      const monthlyRevenue = thisMonthOrders.reduce((sum, order) => {
        const orderTotal = typeof order.total === "string" ? 
          parseFloat(order.total) : order.total;
        return sum + orderTotal;
      }, 0);
      
      // Get previous month stats for comparison
      const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      const prevMonthOrders = await storage.getOrdersByDateRange(
        startOfPrevMonth.toISOString(),
        endOfPrevMonth.toISOString()
      );
      
      const prevMonthRevenue = prevMonthOrders.reduce((sum, order) => {
        const orderTotal = typeof order.total === "string" ? 
          parseFloat(order.total) : order.total;
        return sum + orderTotal;
      }, 0);
      
      // Calculate percentage changes
      const calculatePercentage = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      
      const percentages = {
        products: calculatePercentage(totalProducts, totalProducts - 5), // Mocked previous value
        orders: calculatePercentage(activeOrders.length, activeOrders.length - 3), // Mocked previous value
        stockAlerts: calculatePercentage(stockAlerts, stockAlerts + 1), // Mocked previous value
        revenue: calculatePercentage(monthlyRevenue, prevMonthRevenue)
      };
      
      res.json({
        totalProducts,
        activeOrders: activeOrders.length,
        stockAlerts,
        monthlyRevenue,
        lastUpdate: new Date().toISOString(),
        percentages
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas do dashboard" });
    }
  });

  // REPORTS ROUTES
  app.get(`${apiPrefix}/reports/sales`, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Data inicial e final são obrigatórias" });
      }
      
      // Get orders in date range
      const ordersInRange = await storage.getOrdersByDateRange(
        startDate as string,
        endDate as string
      );
      
      // Get all order items for these orders
      let allOrderItems: (OrderItem & { product: Product })[] = [];
      for (const order of ordersInRange) {
        const items = await storage.getOrderItemsWithProductByOrderId(order.id);
        allOrderItems = [...allOrderItems, ...items];
      }
      
      // Calculate overview stats
      const totalSales = ordersInRange.reduce((sum, order) => {
        const orderTotal = typeof order.total === "string" ? 
          parseFloat(order.total.toString()) : order.total;
        return sum + orderTotal;
      }, 0);
      
      const orderCount = ordersInRange.length;
      const averageTicket = orderCount > 0 ? totalSales / orderCount : 0;
      const productsSold = allOrderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Calculate top products
      const productSales: Record<number, { 
        id: number; 
        name: string; 
        quantity: number; 
        total: number; 
      }> = {};
      
      allOrderItems.forEach(item => {
        const price = typeof item.price === "string" ? 
          parseFloat(item.price.toString()) : item.price;
        
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            id: item.productId,
            name: item.product.name,
            quantity: 0,
            total: 0
          };
        }
        
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].total += price * item.quantity;
      });
      
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      
      // Calculate sales by category
      const categorySales: Record<string, { 
        category: string; 
        total: number;
      }> = {};
      
      allOrderItems.forEach(item => {
        const price = typeof item.price === "string" ? 
          parseFloat(item.price.toString()) : item.price;
        
        if (!categorySales[item.product.category]) {
          categorySales[item.product.category] = {
            category: item.product.category,
            total: 0
          };
        }
        
        categorySales[item.product.category].total += price * item.quantity;
      });
      
      const salesByCategory = Object.values(categorySales);
      
      // Calculate sales by period
      const salesByDate: Record<string, { 
        date: string; 
        total: number;
      }> = {};
      
      ordersInRange.forEach(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const orderTotal = typeof order.total === "string" ? 
          parseFloat(order.total.toString()) : order.total;
        
        if (!salesByDate[orderDate]) {
          salesByDate[orderDate] = {
            date: orderDate,
            total: 0
          };
        }
        
        salesByDate[orderDate].total += orderTotal;
      });
      
      const salesByPeriod = Object.values(salesByDate)
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Prepare sales details
      const salesDetails = await Promise.all(
        ordersInRange.map(async (order) => {
          const items = await storage.getOrderItemsWithProductByOrderId(order.id);
          const customer = await storage.getCustomerById(order.customerId);
          
          const products = items.map(item => 
            `${item.product.name} (${item.quantity})`
          ).join(", ");
          
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
            customerName: customer?.name || `Cliente #${order.customerId}`,
            products,
            total: order.total,
            status: order.status
          };
        })
      );
      
      res.json({
        overview: {
          totalSales,
          orderCount,
          averageTicket,
          productsSold
        },
        topProducts,
        salesByCategory,
        salesByPeriod,
        salesDetails
      });
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ message: "Erro ao gerar relatório de vendas" });
    }
  });

  // EXCHANGE RATES API
  app.get(`${apiPrefix}/exchange-rates`, async (req, res) => {
    try {
      const { base, date } = req.query;
      const baseCurrency = (base as string) || 'USD';
      
      const exchangeRates = await storage.getExchangeRates(
        baseCurrency, 
        date as string | undefined
      );
      
      res.json(exchangeRates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      res.status(500).json({ message: "Erro ao buscar taxas de câmbio" });
    }
  });
  
  app.post(`${apiPrefix}/exchange-rates/convert`, async (req, res) => {
    try {
      const { amount, from, to, date } = req.body;
      
      if (!amount || !from || !to) {
        return res.status(400).json({ 
          message: "Valores obrigatórios: amount, from, to" 
        });
      }
      
      const parsedAmount = parseFloat(amount);
      
      if (isNaN(parsedAmount)) {
        return res.status(400).json({ message: "Valor inválido para conversão" });
      }
      
      const result = await storage.convertCurrency(
        parsedAmount,
        from,
        to,
        date
      );
      
      res.json({
        from,
        to,
        amount: parsedAmount,
        convertedAmount: result.amount,
        rate: result.rate,
        date: date || new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Erro ao converter moeda" 
      });
    }
  });
  
  // TRANSPORTADORAS (CARRIERS) ROUTES
  app.get(`${apiPrefix}/carriers`, async (req, res) => {
    try {
      const onlyActive = req.query.active === 'true';
      const carriers = onlyActive 
        ? await storage.getActiveCarriers()
        : await storage.getAllCarriers();
      
      res.json(carriers);
    } catch (error) {
      console.error("Erro ao buscar transportadoras:", error);
      res.status(500).json({ message: "Erro ao buscar transportadoras" });
    }
  });
  
  app.get(`${apiPrefix}/carriers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de transportadora inválido" });
      }
      
      const carrier = await storage.getCarrierById(id);
      if (!carrier) {
        return res.status(404).json({ message: "Transportadora não encontrada" });
      }
      
      res.json(carrier);
    } catch (error) {
      console.error("Erro ao buscar transportadora:", error);
      res.status(500).json({ message: "Erro ao buscar transportadora" });
    }
  });
  
  app.post(`${apiPrefix}/carriers`, async (req, res) => {
    try {
      const newCarrier = await storage.createCarrier(req.body);
      res.status(201).json(newCarrier);
    } catch (error) {
      console.error("Erro ao criar transportadora:", error);
      res.status(500).json({ message: "Erro ao criar transportadora" });
    }
  });
  
  app.patch(`${apiPrefix}/carriers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de transportadora inválido" });
      }
      
      const carrier = await storage.getCarrierById(id);
      if (!carrier) {
        return res.status(404).json({ message: "Transportadora não encontrada" });
      }
      
      const updatedCarrier = await storage.updateCarrier(id, req.body);
      res.json(updatedCarrier);
    } catch (error) {
      console.error("Erro ao atualizar transportadora:", error);
      res.status(500).json({ message: "Erro ao atualizar transportadora" });
    }
  });
  
  // EMBARQUES (SHIPMENTS) ROUTES
  app.get(`${apiPrefix}/shipments`, async (req, res) => {
    try {
      let shipments;
      
      // Filtrar por status ou próximos embarques
      if (req.query.status) {
        shipments = await storage.getShipmentsByStatus(req.query.status as string);
      } else if (req.query.upcoming === 'true') {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        shipments = await storage.getUpcomingShipments(days);
      } else {
        shipments = await storage.getAllShipments();
      }
      
      res.json(shipments);
    } catch (error) {
      console.error("Erro ao buscar embarques:", error);
      res.status(500).json({ message: "Erro ao buscar embarques" });
    }
  });
  
  app.get(`${apiPrefix}/shipments/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de embarque inválido" });
      }
      
      const shipment = await storage.getShipmentById(id);
      if (!shipment) {
        return res.status(404).json({ message: "Embarque não encontrado" });
      }
      
      res.json(shipment);
    } catch (error) {
      console.error("Erro ao buscar embarque:", error);
      res.status(500).json({ message: "Erro ao buscar embarque" });
    }
  });
  
  app.get(`${apiPrefix}/orders/:orderId/shipments`, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "ID de pedido inválido" });
      }
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      const shipments = await storage.getShipmentsByOrderId(orderId);
      res.json(shipments);
    } catch (error) {
      console.error("Erro ao buscar embarques do pedido:", error);
      res.status(500).json({ message: "Erro ao buscar embarques do pedido" });
    }
  });
  
  app.post(`${apiPrefix}/shipments`, async (req, res) => {
    try {
      // Verificar se o pedido existe
      const orderId = req.body.orderId;
      if (!orderId) {
        return res.status(400).json({ message: "ID do pedido é obrigatório" });
      }
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // Verificar se a transportadora existe
      const carrierId = req.body.carrierId;
      if (!carrierId) {
        return res.status(400).json({ message: "ID da transportadora é obrigatório" });
      }
      
      const carrier = await storage.getCarrierById(carrierId);
      if (!carrier) {
        return res.status(404).json({ message: "Transportadora não encontrada" });
      }
      
      // Verificar se a data de agendamento é válida
      if (!req.body.scheduledDate) {
        return res.status(400).json({ message: "Data de agendamento é obrigatória" });
      }
      
      // Criar embarque
      const newShipment = await storage.createShipment(req.body);
      res.status(201).json(newShipment);
    } catch (error) {
      console.error("Erro ao criar embarque:", error);
      res.status(500).json({ message: "Erro ao criar embarque" });
    }
  });
  
  app.patch(`${apiPrefix}/shipments/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de embarque inválido" });
      }
      
      const shipment = await storage.getShipmentById(id);
      if (!shipment) {
        return res.status(404).json({ message: "Embarque não encontrado" });
      }
      
      const updatedShipment = await storage.updateShipment(id, req.body);
      res.json(updatedShipment);
    } catch (error) {
      console.error("Erro ao atualizar embarque:", error);
      res.status(500).json({ message: "Erro ao atualizar embarque" });
    }
  });
  
  app.post(`${apiPrefix}/shipments/:id/cancel`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de embarque inválido" });
      }
      
      const shipment = await storage.getShipmentById(id);
      if (!shipment) {
        return res.status(404).json({ message: "Embarque não encontrado" });
      }
      
      const { reason } = req.body;
      const canceledShipment = await storage.cancelShipment(id, reason);
      res.json(canceledShipment);
    } catch (error) {
      console.error("Erro ao cancelar embarque:", error);
      res.status(500).json({ message: "Erro ao cancelar embarque" });
    }
  });

  // Obter metadados para embarques
  app.get(`${apiPrefix}/shipments-metadata`, async (req, res) => {
    try {
      // Retornar tipos de embarque e status possíveis
      res.json({
        types: shipmentTypeEnum.enumValues,
        statuses: shipmentStatusEnum.enumValues
      });
    } catch (error) {
      console.error("Erro ao buscar metadados de embarques:", error);
      res.status(500).json({ message: "Erro ao buscar metadados de embarques" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
