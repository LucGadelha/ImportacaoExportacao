import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatusBadgeClass, formatCurrency, formatDate } from "@/lib/utils";
import { Search, PlusCircle, Eye, Edit } from "lucide-react";
import OrderForm from "./OrderForm";
import { Order } from "@shared/schema";

export default function OrderList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para controle de busca e filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  
  // Estado para controle do modal de formulário
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // Consulta de pedidos
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Funções para lidar com ações
  const handleView = (order: Order) => {
    toast({
      title: `Pedido ${order.orderNumber}`,
      description: `Status: ${getStatusLabel(order.status)}`,
    });
    // Aqui você poderia abrir um modal ou redirecionar para uma página de detalhes
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleAddNew = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  // Função para renderizar o status
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      processing: "Em processamento",
      shipped: "Enviado",
      delivered: "Entregue",
      canceled: "Cancelado",
    };
    
    return statusMap[status] || status;
  };

  // Filtro de pedidos
  const filteredOrders = orders
    ? orders.filter((order) => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all_statuses" || 
                             order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Pedidos</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="mr-1 h-4 w-4" /> Novo Pedido
        </Button>
      </div>

      <Card className="bg-white rounded-lg shadow mb-8">
        <CardHeader className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">Lista de Pedidos</CardTitle>
          <div className="flex space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">Todos status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Em processamento</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">
                      Carregando pedidos...
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.orderNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Cliente #{order.customerId}</div>
                        {/* Aqui você exibiria o nome/email do cliente que viria da consulta com relacionamentos */}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(order.total)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={getStatusBadgeClass(order.status)}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(order)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {orders && orders.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredOrders.length}</span> de <span className="font-medium">{orders.length}</span> resultados
              </div>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" disabled>Anterior</Button>
                <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600">1</Button>
                <Button variant="outline" size="sm" disabled>Próximo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulário de pedido */}
      <OrderForm
        open={showOrderForm}
        onOpenChange={setShowOrderForm}
        editingOrder={editingOrder}
      />
    </>
  );
}
