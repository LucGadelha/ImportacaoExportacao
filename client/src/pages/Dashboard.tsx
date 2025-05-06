import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityList from "@/components/dashboard/ActivityList";
import StockAlerts from "@/components/dashboard/StockAlerts";
import {
  ShoppingBag,
  FileText,
  AlertTriangle,
  DollarSign,
  RotateCw,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile, useBreakpoint } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const isMobile = useMobile();
  const isSmall = useBreakpoint("sm");
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFilter, setDateFilter] = useState("month");
  
  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
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
  
  const handleRefresh = () => {
    refetch();
  };

  // Renderizar barra de título com informações e ações
  const renderTitleBar = () => (
    <div className={cn(
      "mb-6 flex flex-wrap gap-2", 
      isMobile ? "justify-between" : "items-center justify-between"
    )}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
      
      <div className={cn(
        "flex items-center",
        isMobile ? "w-full justify-between mt-2" : "space-x-2"
      )}>
        <div className="flex items-center mr-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <select 
              className="bg-transparent border-none focus:outline-none py-1 pr-8 appearance-none cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
            </select>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size={isSmall ? "sm" : "default"}
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RotateCw className="h-4 w-4 mr-1" />
          {isSmall ? "" : "Atualizar"}
        </Button>
      </div>
    </div>
  );

  // Renderizar cards de estatísticas com loading states
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {isLoading ? (
        <>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-7 w-1/2 mb-2" />
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </>
      ) : (
        <>
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
            changeText="desde a semana anterior"
          />
          
          <StatsCard
            title="Faturamento"
            value={formatCurrency(displayStats.monthlyRevenue)}
            icon={DollarSign}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            percentageChange={displayStats.percentages.revenue}
          />
        </>
      )}
    </div>
  );

  // Renderizar tendência de receita vs despesas
  const renderTrends = () => (
    <Card className="mb-6 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Visão Geral Financeira
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Receita</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Despesas</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">Receita Total</span>
            </div>
            <span className="text-green-500 font-semibold">{formatCurrency(displayStats.monthlyRevenue)}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: "70%" }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Meta: {formatCurrency(displayStats.monthlyRevenue * 1.2)}</span>
            <span>70%</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm font-medium">Despesas Totais</span>
            </div>
            <span className="text-red-500 font-semibold">{formatCurrency(displayStats.monthlyRevenue * 0.6)}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{ width: "60%" }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Limite: {formatCurrency(displayStats.monthlyRevenue * 0.7)}</span>
            <span>85%</span>
          </div>
        </div>
      </div>
    </Card>
  );

  // Renderizar tabs para diferentes seções em dispositivos móveis
  const renderMobileTabs = () => (
    <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="alerts">Alertas</TabsTrigger>
        <TabsTrigger value="activity">Atividades</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        {renderStatsCards()}
        {renderTrends()}
      </TabsContent>
      
      <TabsContent value="alerts">
        <StockAlerts />
      </TabsContent>
      
      <TabsContent value="activity">
        <ActivityList />
      </TabsContent>
    </Tabs>
  );

  // Renderizar layout para desktop
  const renderDesktopLayout = () => (
    <>
      {renderTitleBar()}
      {renderStatsCards()}
      {renderTrends()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList />
        <StockAlerts />
      </div>
    </>
  );

  return (
    <section className="mb-8">
      {isMobile ? (
        renderMobileTabs()
      ) : (
        renderDesktopLayout()
      )}
      
      <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Última atualização: {isLoading 
            ? "Carregando..." 
            : new Date(displayStats.lastUpdate).toLocaleString('pt-BR')}
        </p>
      </div>
    </section>
  );
}
