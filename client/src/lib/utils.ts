import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
      ? new Intl.DateTimeFormat("pt-BR").format(dateObj)
      : "";
  } catch {
    return "";
  }
}

export function getStockStatus(quantity: number, minStock: number): "instock" | "low" | "critical" {
  if (quantity <= 0) return "critical";
  if (quantity < minStock) return "low";
  return "instock";
}

export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "status-badge-pending",
    processing: "status-badge-processing",
    shipped: "status-badge-shipped",
    delivered: "status-badge-delivered",
    canceled: "status-badge-canceled",
    critical: "status-badge-critical",
    low: "status-badge-low",
    instock: "status-badge-instock",
  };
  
  return statusMap[status] || "";
}

export function generateOrderNumber(): string {
  return `#${Math.floor(10000 + Math.random() * 90000)}`;
}

export function calculateTotalValue(products: Array<{ quantity: number, price: number | string }>): number {
  return products.reduce((total, item) => {
    const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return total + (item.quantity * price);
  }, 0);
}
