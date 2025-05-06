import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatusBadgeClass, formatCurrency, getStockStatus } from "@/lib/utils";
import { Search, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product } from "@shared/schema";

// Schema para o formulário de atualização de estoque
const stockUpdateSchema = z.object({
  id: z.number(),
  quantity: z.coerce.number().min(0, {
    message: "A quantidade não pode ser negativa",
  }),
  minimumStock: z.coerce.number().min(0, {
    message: "O estoque mínimo não pode ser negativo",
  }),
});

type StockUpdateData = z.infer<typeof stockUpdateSchema>;

export default function InventoryList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para controle de busca e filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  
  // Estado para o modal de atualização de estoque
  const [updateStockDialogOpen, setUpdateStockDialogOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  
  // Configuração do formulário
  const form = useForm<StockUpdateData>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      id: 0,
      quantity: 0,
      minimumStock: 10,
    },
  });
  
  // Consulta de produtos
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Mutação para atualizar estoque
  const updateStockMutation = useMutation({
    mutationFn: async (data: StockUpdateData) => {
      return apiRequest("PATCH", `/api/products/${data.id}/stock`, {
        quantity: data.quantity,
        minimumStock: data.minimumStock,
      });
    },
    onSuccess: () => {
      toast({
        title: "Estoque atualizado",
        description: "O estoque foi atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      setUpdateStockDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o estoque: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Abrir modal de atualização de estoque
  const handleUpdateStock = (product: Product) => {
    setProductToUpdate(product);
    form.reset({
      id: product.id,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
    });
    setUpdateStockDialogOpen(true);
  };

  // Função para aplicar filtros
  const applyFilters = () => {
    // Na prática, isso poderia enviar uma consulta com filtros para o backend
    // ou apenas filtrar os dados localmente como estamos fazendo aqui
  };

  // Função para renderizar a interface de categoria
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      electronics: "Eletrônicos",
      computers: "Informática",
      peripherals: "Periféricos",
      accessories: "Acessórios",
    };
    
    return categoryMap[category] || category;
  };

  // Filtro de produtos
  const filteredProducts = products
    ? products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.code.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === "all_categories" || 
                               product.category === categoryFilter;
        
        const status = getStockStatus(product.quantity, product.minimumStock);
        const matchesStatus = statusFilter === "all_statuses" || 
                             (statusFilter === "instock" && status === "instock") ||
                             (statusFilter === "lowstock" && status === "low") ||
                             (statusFilter === "outofstock" && status === "critical");
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
    : [];

  // Calcular valor total do produto
  const calculateTotalValue = (price: number | string, quantity: number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice * quantity;
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">Todas categorias</SelectItem>
                <SelectItem value="electronics">Eletrônicos</SelectItem>
                <SelectItem value="computers">Informática</SelectItem>
                <SelectItem value="accessories">Acessórios</SelectItem>
                <SelectItem value="peripherals">Periféricos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">Todos os status</SelectItem>
                <SelectItem value="instock">Em estoque</SelectItem>
                <SelectItem value="lowstock">Estoque baixo</SelectItem>
                <SelectItem value="outofstock">Sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button 
              onClick={applyFilters}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Filtrar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-white rounded-lg shadow">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unitário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Mínimo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-3 text-center text-sm text-gray-500">
                      Carregando produtos...
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.code}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getCategoryLabel(product.category)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.minimumStock}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(calculateTotalValue(product.price, product.quantity))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={getStatusBadgeClass(getStockStatus(product.quantity, product.minimumStock))}>
                          {product.quantity <= 0 
                            ? "Crítico" 
                            : product.quantity < product.minimumStock 
                              ? "Estoque baixo" 
                              : "Em estoque"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStock(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-3 text-center text-sm text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {products && products.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredProducts.length}</span> de <span className="font-medium">{products.length}</span> resultados
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

      {/* Modal de atualização de estoque */}
      <Dialog open={updateStockDialogOpen} onOpenChange={setUpdateStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
          </DialogHeader>
          
          {productToUpdate && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateStockMutation.mutate(data))}>
                <div className="space-y-4 py-2">
                  <div className="mb-4">
                    <p className="text-sm font-medium">Produto: {productToUpdate.name}</p>
                    <p className="text-sm text-gray-500">Código: {productToUpdate.code}</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade em Estoque</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minimumStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Mínimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUpdateStockDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateStockMutation.isPending}
                  >
                    {updateStockMutation.isPending ? "Atualizando..." : "Atualizar Estoque"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
