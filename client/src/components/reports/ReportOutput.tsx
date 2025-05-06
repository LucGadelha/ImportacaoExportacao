import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportFilters } from "./ReportFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import { Printer, FileSpreadsheet, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import ChartComponent from "./ChartComponent";
import { useMobile, useBreakpoint } from "@/hooks/use-mobile";

interface SalesOverview {
  totalSales: number;
  orderCount: number;
  averageTicket: number;
  productsSold: number;
}

interface TopProduct {
  id: number;
  name: string;
  quantity: number;
  total: number;
}

interface SalesByCategory {
  category: string;
  total: number;
}

interface SalesByPeriod {
  date: string;
  total: number;
}

interface SalesDetails {
  id: number;
  orderNumber: string;
  date: string;
  customerName: string;
  products: string;
  total: number;
  status: string;
}

interface SalesReportData {
  overview: SalesOverview;
  topProducts: TopProduct[];
  salesByCategory: SalesByCategory[];
  salesByPeriod: SalesByPeriod[];
  salesDetails: SalesDetails[];
}

export default function ReportOutput({ filters }: { filters: ReportFilters }) {
  const [reportTitle, setReportTitle] = useState("Relatório de Vendas");
  
  const { data, isLoading } = useQuery<SalesReportData>({
    queryKey: [`/api/reports/${filters.type}`, filters],
    enabled: !!filters,
  });
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportExcel = () => {
    window.open(`/api/reports/${filters.type}/export/excel?startDate=${filters.startDate}&endDate=${filters.endDate}`, "_blank");
  };
  
  const handleExportPDF = () => {
    window.open(`/api/reports/${filters.type}/export/pdf?startDate=${filters.startDate}&endDate=${filters.endDate}`, "_blank");
  };
  
  // Mapeamento de status para classes CSS
  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "status-badge-pending",
      processing: "status-badge-processing",
      shipped: "status-badge-shipped",
      delivered: "status-badge-delivered",
      canceled: "status-badge-canceled",
    };
    
    return statusMap[status] || "";
  };
  
  // Mapeamento de status para texto
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      processing: "Em processamento",
      shipped: "Enviado",
      delivered: "Entregue",
      canceled: "Cancelado",
    };
    
    return statusMap[status] || status;
  };
  
  const isMobile = useMobile();
  
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Visão geral skeleton */}
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-7 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Gráfico skeleton */}
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                <Skeleton className="h-52 w-full rounded-lg" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Tabela skeleton */}
            <div>
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
                      <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Gráfico skeleton */}
            <div>
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                <Skeleton className="h-52 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum dado disponível</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Selecione os filtros e clique em "Gerar Relatório" ou "Prévia" para visualizar os dados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-lg shadow">
      <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-800">{reportTitle}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            className="flex items-center"
          >
            <Printer className="mr-1 h-4 w-4" /> Imprimir
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center"
          >
            <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center"
          >
            <FileText className="mr-1 h-4 w-4" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Sales Overview */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-3">Visão Geral</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Vendas</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(data.overview.totalSales)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantidade de Pedidos</p>
                  <p className="text-xl font-bold text-gray-800">
                    {data.overview.orderCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(data.overview.averageTicket)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Produtos Vendidos</p>
                  <p className="text-xl font-bold text-gray-800">
                    {data.overview.productsSold}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart: Sales by Period */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-3">Vendas por Período</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-64">
              <ChartComponent
                type="line"
                data={{
                  labels: data.salesByPeriod.map(item => item.date),
                  datasets: [
                    {
                      label: 'Vendas',
                      data: data.salesByPeriod.map(item => typeof item.total === 'string' ? parseFloat(item.total) : item.total),
                      borderColor: 'rgb(29, 78, 216)',
                      backgroundColor: 'rgba(29, 78, 216, 0.1)',
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Products */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-3">Produtos Mais Vendidos</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.total)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart: Sales by Category */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-3">Vendas por Categoria</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-64">
              <ChartComponent
                type="pie"
                data={{
                  labels: data.salesByCategory.map(item => {
                    const categoryMap: Record<string, string> = {
                      electronics: "Eletrônicos",
                      computers: "Informática",
                      peripherals: "Periféricos",
                      accessories: "Acessórios",
                    };
                    return categoryMap[item.category] || item.category;
                  }),
                  datasets: [
                    {
                      data: data.salesByCategory.map(item => typeof item.total === 'string' ? parseFloat(item.total) : item.total),
                      backgroundColor: [
                        'rgba(29, 78, 216, 0.7)',
                        'rgba(5, 150, 105, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                      ],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>

        {/* Sales Details */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">Detalhes das Vendas</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.salesDetails.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.orderNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sale.date}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.customerName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.products}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(sale.total)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={getStatusClass(sale.status)}>
                        {getStatusText(sale.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{data.salesDetails.length}</span> de <span className="font-medium">{data.salesDetails.length}</span> resultados
            </div>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600">1</Button>
              <Button variant="outline" size="sm" disabled>Próximo</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
