import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getStatusBadgeClass, formatCurrency } from "@/lib/utils";
import { Product } from "@shared/schema";

export default function StockAlerts() {
  const { data: lowStockItems, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/low-stock"],
  });

  function getStockStatus(quantity: number, minimumStock: number) {
    if (quantity <= 0) return "critical";
    if (quantity < minimumStock) return "low";
    return "instock";
  }

  return (
    <Card className="bg-white rounded-lg shadow">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-800">Alertas de Estoque</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Mínimo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                    Carregando alertas de estoque...
                  </td>
                </tr>
              ) : lowStockItems && lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.code}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.minimumStock}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={getStatusBadgeClass(getStockStatus(item.quantity, item.minimumStock))}>
                        {item.quantity <= 0 ? "Crítico" : "Baixo"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                    Nenhum produto com estoque baixo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
