import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatusBadgeClass, formatCurrency, getStockStatus } from "@/lib/utils";
import { Search, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProductForm from "./ProductForm";
import { Product } from "@shared/schema";

export default function ProductList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para controle de busca e filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");
  
  // Estado para controle do modal de formulário
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Estado para controle do diálogo de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Consulta de produtos
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Mutação para excluir produto
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível excluir o produto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Funções para lidar com ações
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowProductForm(true);
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
        
        return matchesSearch && matchesCategory;
      })
    : [];

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Cadastro de Produtos</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-1 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Card className="bg-white rounded-lg shadow mb-8">
        <CardHeader className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">Lista de Produtos</CardTitle>
          <div className="flex space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
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
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-sm text-gray-500">
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
                        <span className={getStatusBadgeClass(getStockStatus(product.quantity, product.minimumStock))}>
                          {product.quantity <= 0 
                            ? "Sem estoque" 
                            : product.quantity < product.minimumStock 
                            ? "Baixo estoque" 
                            : "Em estoque"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-sm text-gray-500">
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

      {/* Modal de formulário de produto */}
      <ProductForm
        open={showProductForm}
        onOpenChange={setShowProductForm}
        editingProduct={editingProduct}
      />

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto
              "{productToDelete?.name}" do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
