import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@shared/schema";

// Schema para validação de formulário
const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  code: z.string().min(2, {
    message: "O código deve ter pelo menos 2 caracteres",
  }),
  category: z.enum(["electronics", "computers", "peripherals", "accessories"], {
    required_error: "Por favor selecione uma categoria",
  }),
  price: z.coerce.number().min(0.01, {
    message: "O preço deve ser maior que zero",
  }),
  quantity: z.coerce.number().min(0, {
    message: "A quantidade não pode ser negativa",
  }),
  minimumStock: z.coerce.number().min(0, {
    message: "O estoque mínimo não pode ser negativo",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
}

export default function ProductForm({ open, onOpenChange, editingProduct }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Definir formulário
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "electronics",
      price: 0,
      quantity: 0,
      minimumStock: 10,
    },
  });
  
  // Atualizar valores do formulário quando o produto para edição muda
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        code: editingProduct.code,
        category: editingProduct.category,
        price: Number(editingProduct.price),
        quantity: editingProduct.quantity,
        minimumStock: editingProduct.minimumStock,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        category: "electronics",
        price: 0,
        quantity: 0,
        minimumStock: 10,
      });
    }
  }, [editingProduct, form]);
  
  // Mutação para adicionar/editar produto
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}` 
        : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";
      
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: editingProduct ? "Produto atualizado" : "Produto adicionado",
        description: editingProduct 
          ? "O produto foi atualizado com sucesso!" 
          : "O produto foi adicionado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível ${editingProduct ? "atualizar" : "adicionar"} o produto: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Manipular submissão do formulário
  function onSubmit(data: FormData) {
    mutation.mutate(data);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Produto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electronics">Eletrônicos</SelectItem>
                      <SelectItem value="computers">Informática</SelectItem>
                      <SelectItem value="peripherals">Periféricos</SelectItem>
                      <SelectItem value="accessories">Acessórios</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span>
                      <Input type="number" step="0.01" min="0" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade em Estoque</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
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
                    <Input type="number" min="0" {...field} />
                  </FormControl>
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
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Salvando..." : editingProduct ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
