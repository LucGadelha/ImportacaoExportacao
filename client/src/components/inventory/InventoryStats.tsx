import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Layers, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InventoryStatsResponse {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
}

export default function InventoryStats() {
  const { data, isLoading, refetch } = useQuery<InventoryStatsResponse>({
    queryKey: ["/api/inventory/stats"],
  });

  const handleExport = () => {
    // Esta função seria implementada para exportar os dados do estoque
    // Por exemplo, como CSV ou PDF
    window.open("/api/inventory/export", "_blank");
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="bg-gray-600 hover:bg-gray-700 text-white border-none"
          >
            <Download className="mr-1 h-4 w-4" /> Exportar
          </Button>
          <Button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total em Estoque</p>
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? "..." : `${data?.totalItems || 0} itens`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos com Estoque Baixo</p>
              <p className="text-2xl font-bold text-amber-500">
                {isLoading ? "..." : `${data?.lowStockItems || 0} itens`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total em Estoque</p>
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? "..." : formatCurrency(data?.totalValue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
