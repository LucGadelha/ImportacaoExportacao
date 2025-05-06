import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityList from "@/components/dashboard/ActivityList";
import StockAlerts from "@/components/dashboard/StockAlerts";
import {
  ShoppingBag,
  FileText,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalProducts: number;
  activeOrders: number;
  stockAlerts: number;
  monthlyRevenue: number;
  lastUpdate: string;
  percentages: {
    products: number;
    orders: number;
    stockAlerts: number;
    revenue: number;
  };
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fallback stats while loading
  const displayStats = stats || {
    totalProducts: 0,
    activeOrders: 0,
    stockAlerts: 0,
    monthlyRevenue: 0,
    lastUpdate: new Date().toISOString(),
    percentages: {
      products: 0,
      orders: 0,
      stockAlerts: 0,
      revenue: 0
    }
  };

  return (
    <section className="mb-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Última atualização: </span>
          <span className="text-sm font-medium">
            {isLoading 
              ? "Carregando..." 
              : new Date(displayStats.lastUpdate).toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total de Produtos"
          value={displayStats.totalProducts.toString()}
          icon={ShoppingBag}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          percentageChange={displayStats.percentages.products}
        />
        
        <StatsCard
          title="Pedidos Ativos"
          value={displayStats.activeOrders.toString()}
          icon={FileText}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          percentageChange={displayStats.percentages.orders}
        />
        
        <StatsCard
          title="Alertas de Estoque"
          value={displayStats.stockAlerts.toString()}
          icon={AlertTriangle}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          percentageChange={displayStats.percentages.stockAlerts}
          changeText="desde a última semana"
        />
        
        <StatsCard
          title="Faturamento Mensal"
          value={formatCurrency(displayStats.monthlyRevenue)}
          icon={DollarSign}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          percentageChange={displayStats.percentages.revenue}
        />
      </div>

      {/* Recent Activity and Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList />
        <StockAlerts />
      </div>
    </section>
  );
}
