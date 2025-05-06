import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateOrderNumber } from "../client/src/lib/utils";

async function seed() {
  try {
    console.log("🌱 Iniciando seeding do banco de dados...");

    // Seed categories
    const categories = ["electronics", "computers", "peripherals", "accessories"];

    // Seed products
    const productData = [
      {
        name: "Smartphone XS Max",
        code: "SP-XSM-001",
        category: "electronics",
        price: "3499.00",
        quantity: 25,
        minimumStock: 10
      },
      {
        name: "Notebook Ultra",
        code: "NB-ULT-002",
        category: "computers",
        price: "4850.00",
        quantity: 12,
        minimumStock: 8
      },
      {
        name: "Mouse Sem Fio PRO",
        code: "MS-WL-002",
        category: "peripherals",
        price: "129.90",
        quantity: 8,
        minimumStock: 15
      },
      {
        name: "Fone de Ouvido Bluetooth",
        code: "FO-BT-003",
        category: "accessories",
        price: "199.90",
        quantity: 12,
        minimumStock: 20
      },
      {
        name: "Cabo HDMI 2.0",
        code: "CB-HDMI-001",
        category: "accessories",
        price: "29.90",
        quantity: 5,
        minimumStock: 10
      },
      {
        name: "SSD 1TB",
        code: "SSD-1TB-001",
        category: "computers",
        price: "599.90",
        quantity: 18,
        minimumStock: 5
      },
      {
        name: "Teclado Mecânico RGB",
        code: "KB-MEC-001",
        category: "peripherals",
        price: "349.90",
        quantity: 10,
        minimumStock: 8
      }
    ];

    // Insert products
    for (const product of productData) {
      // Check if product already exists
      const existingProduct = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.code, product.code)
      });

      if (!existingProduct) {
        await db.insert(schema.products).values({
          name: product.name,
          code: product.code,
          category: product.category as any,
          price: product.price,
          quantity: product.quantity,
          minimumStock: product.minimumStock,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Produto criado: ${product.name}`);
      } else {
        console.log(`⏩ Produto já existe: ${product.name}`);
      }
    }

    // Seed customers
    const customerData = [
      {
        name: "Maria Silva",
        email: "maria@email.com"
      },
      {
        name: "João Santos",
        email: "joao@email.com"
      },
      {
        name: "Ana Oliveira",
        email: "ana@email.com"
      }
    ];

    const createdCustomers = [];

    // Insert customers
    for (const customer of customerData) {
      // Check if customer already exists
      const existingCustomer = await db.query.customers.findFirst({
        where: (customers, { eq }) => eq(customers.email, customer.email)
      });

      if (!existingCustomer) {
        const [newCustomer] = await db.insert(schema.customers).values({
          name: customer.name,
          email: customer.email,
          createdAt: new Date()
        }).returning();
        
        createdCustomers.push(newCustomer);
        console.log(`✅ Cliente criado: ${customer.name}`);
      } else {
        createdCustomers.push(existingCustomer);
        console.log(`⏩ Cliente já existe: ${customer.name}`);
      }
    }

    // Seed orders
    if (createdCustomers.length > 0) {
      // Get all products for reference
      const allProducts = await db.query.products.findMany();
      
      if (allProducts.length === 0) {
        console.log("❌ Não há produtos para criar pedidos");
        return;
      }

      // Create orders for each customer
      for (let i = 0; i < createdCustomers.length; i++) {
        const customer = createdCustomers[i];
        
        // Check if customer already has orders
        const existingOrders = await db.query.orders.findMany({
          where: (orders, { eq }) => eq(orders.customerId, customer.id)
        });
        
        if (existingOrders.length > 0) {
          console.log(`⏩ Cliente ${customer.name} já possui pedidos`);
          continue;
        }
        
        // Create 1-2 orders per customer
        const numOrders = 1 + Math.floor(Math.random() * 2);
        
        for (let j = 0; j < numOrders; j++) {
          // Select 1-3 random products for this order
          const numProducts = 1 + Math.floor(Math.random() * 3);
          const selectedProducts: typeof allProducts = [];
          
          for (let k = 0; k < numProducts; k++) {
            const randomIndex = Math.floor(Math.random() * allProducts.length);
            const product = allProducts[randomIndex];
            
            // Check if product already selected for this order
            if (!selectedProducts.find(p => p.id === product.id)) {
              selectedProducts.push(product);
            }
          }
          
          if (selectedProducts.length === 0) continue;
          
          // Calculate total
          let total = 0;
          for (const product of selectedProducts) {
            const price = typeof product.price === "string" ? 
              parseFloat(product.price) : product.price;
            total += price * 1; // quantity = 1
          }
          
          // Create order
          const orderStatuses = ["pending", "processing", "shipped", "delivered"];
          const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
          
          const [newOrder] = await db.insert(schema.orders).values({
            customerId: customer.id,
            orderNumber: generateOrderNumber(),
            status: randomStatus as any,
            total: total.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          console.log(`✅ Pedido criado: ${newOrder.orderNumber} para ${customer.name}`);
          
          // Create order items
          for (const product of selectedProducts) {
            const quantity = 1; // Simple case
            
            await db.insert(schema.orderItems).values({
              orderId: newOrder.id,
              productId: product.id,
              quantity,
              price: product.price,
              createdAt: new Date()
            });
            
            // Update product stock
            await db.update(schema.products)
              .set({ 
                quantity: product.quantity - quantity,
                updatedAt: new Date()
              })
              .where(eq(schema.products.id, product.id));
          }
        }
      }
    }

    // Seed activities
    const activityData = [
      {
        type: "order",
        description: "Novo pedido #12458 foi registrado",
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        type: "inventory",
        description: "Estoque atualizado para Smartphone XS Max",
        createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      },
      {
        type: "alert",
        description: "Alerta de estoque baixo para Cabo HDMI 2.0",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        type: "product",
        description: "João Silva cadastrou 5 novos produtos",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      }
    ];

    // Insert activities if none exist
    const existingActivities = await db.query.activities.findMany();
    
    if (existingActivities.length === 0) {
      for (const activity of activityData) {
        await db.insert(schema.activities).values({
          type: activity.type,
          description: activity.description,
          createdAt: activity.createdAt
        });
        console.log(`✅ Atividade criada: ${activity.description}`);
      }
    } else {
      console.log("⏩ Já existem atividades no sistema");
    }

    console.log("✅ Seed concluído com sucesso!");

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
  }
}

seed();
