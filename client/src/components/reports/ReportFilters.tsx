import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

interface ReportFiltersProps {
  onGenerateReport: (filters: ReportFilters) => void;
}

export interface ReportFilters {
  type: string;
  startDate: string;
  endDate: string;
}

export default function ReportFilters({ onGenerateReport }: ReportFiltersProps) {
  const queryClient = useQueryClient();
  
  // Conseguir a data atual e de 30 dias atrás no formato YYYY-MM-DD
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const [filters, setFilters] = useState<ReportFilters>({
    type: "sales",
    startDate: formatDateForInput(thirtyDaysAgo),
    endDate: formatDateForInput(today),
  });
  
  const handleChange = (name: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateReport = () => {
    onGenerateReport(filters);
    
    // Invalidar consultas relacionadas para buscar novos dados
    queryClient.invalidateQueries({ queryKey: [`/api/reports/${filters.type}`] });
  };
  
  return (
    <Card className="bg-white rounded-lg shadow mb-6 p-4">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Relatório:
            </Label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="inventory">Estoque</SelectItem>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="customers">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial:
            </Label>
            <Input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final:
            </Label>
            <Input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleGenerateReport}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Gerar Relatório
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
