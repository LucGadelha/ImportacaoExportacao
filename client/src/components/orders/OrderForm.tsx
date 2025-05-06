import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import { Product, Order } from "@shared/schema";

// Schema para validação do formulário
const formSchema = z.object({
  customerName: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  customerEmail: z.string().email({
    message: "Email inválido",
  }),
  productId: z.string().min(1, {
    message: "Selecione um produto",
  }),
  quantity: z.coerce.number().min(1, {
    message: "A quantidade deve ser pelo menos 1",
  }),
  status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"], {
    required_error: "Selecione um status",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder: Order | null;
}

export default function OrderForm({ open, onOpenChange, editingOrder }: OrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totalPrice, setTotalPrice] = useState<number>(0);
  
  // Buscar produtos para o select
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Configuração do formulário
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      productId: "",
      quantity: 1,
      status: "pending",
    },
  });
  
  // Atualizar valores do formulário quando o pedido para edição muda
  useEffect(() => {
    if (editingOrder) {
      // Normalmente, precisaríamos buscar os detalhes completos do pedido
      // incluindo os itens do pedido, informações do cliente, etc.
      // Aqui estamos simplificando para fins de demonstração
      form.reset({
        customerName: "Cliente", // Precisaria vir da API
        customerEmail: "email@exemplo.com", // Precisaria vir da API
        productId: "1", // Precisaria vir da API
        quantity: 1, // Precisaria vir da API
        status: editingOrder.status,
      });
    } else {
      form.reset({
        customerName: "",
        customerEmail: "",
        productId: "",
        quantity: 1,
        status: "pending",
      });
    }
  }, [editingOrder, form]);
  
  // Atualizar preço total quando o produto ou quantidade mudar
  useEffect(() => {
    const productId = form.watch("productId");
    const quantity = form.watch("quantity");
    
    if (productId && products) {
      const selectedProduct = products.find(p => p.id.toString() === productId);
      if (selectedProduct) {
        const price = typeof selectedProduct.price === "string" 
          ? parseFloat(selectedProduct.price) 
          : selectedProduct.price;
        setTotalPrice(price * quantity);
      }
    } else {
      setTotalPrice(0);
    }
  }, [form.watch("productId"), form.watch("quantity"), products]);
  
  // Mutação para adicionar/editar pedido
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const selectedProduct = products?.find(p => p.id.toString() === data.productId);
      
      if (!selectedProduct) {
        throw new Error("Produto não encontrado");
      }
      
      const orderData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        orderNumber: editingOrder?.orderNumber || generateOrderNumber(),
        status: data.status,
        items: [
          {
            productId: parseInt(data.productId),
            quantity: data.quantity,
            price: selectedProduct.price,
          },
        ],
      };
      
      const url = editingOrder 
        ? `/api/orders/${editingOrder.id}` 
        : "/api/orders";
      const method = editingOrder ? "PATCH" : "POST";
      
      return apiRequest(method, url, orderData);
    },
    onSuccess: () => {
      toast({
        title: editingOrder ? "Pedido atualizado" : "Pedido criado",
        description: editingOrder 
          ? "O pedido foi atualizado com sucesso!" 
          : "O pedido foi criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] }); // Atualizar estoque
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível ${editingOrder ? "atualizar" : "criar"} o pedido: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Manipular submissão do formulário
  function onSubmit(data: FormData) {
    mutation.mutate(data);
  }
  
  // Verificar se há estoque disponível
  function isStockAvailable(productId: string, requestedQty: number): boolean {
    if (!products) return false;
    
    const product = products.find(p => p.id.toString() === productId);
    if (!product) return false;
    
    return product.quantity >= requestedQty;
  }
  
  const watchProductId = form.watch("productId");
  const watchQuantity = form.watch("quantity");
  const hasInsufficientStock = watchProductId && 
    !isStockAvailable(watchProductId, watchQuantity);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingOrder ? "Editar Pedido" : "Registrar Pedido"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Cliente</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products ? (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - {formatCurrency(product.price)} - {product.quantity > 0 ? `${product.quantity} em estoque` : "Sem estoque"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading">Carregando produtos...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value === "" ? "1" : e.target.value;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {hasInsufficientStock && (
                    <p className="text-xs text-red-500">
                      Quantidade solicitada não disponível em estoque
                    </p>
                  )}
                </FormItem>
              )}
            />
            
            {totalPrice > 0 && (
              <div className="py-2">
                <p className="text-sm text-gray-600">Total do pedido:</p>
                <p className="text-lg font-semibold">{formatCurrency(totalPrice)}</p>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Pedido</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="processing">Em processamento</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending || hasInsufficientStock}
                className="bg-green-600 hover:bg-green-700"
              >
                {mutation.isPending ? "Salvando..." : editingOrder ? "Atualizar" : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
