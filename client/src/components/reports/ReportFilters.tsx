import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, FileDown, RotateCw } from "lucide-react";
import { useMobile, useBreakpoint } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportFiltersProps {
  onGenerateReport: (filters: ReportFilters, mode: "preview" | "generate") => void;
  isLoading?: boolean;
  onReportTypeChange?: (type: string) => void;
}

export interface ReportFilters {
  type: string;
  startDate: string;
  endDate: string;
  format?: string;
}

export default function ReportFilters({ 
  onGenerateReport, 
  isLoading = false,
  onReportTypeChange 
}: ReportFiltersProps) {
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const isSmall = useBreakpoint("sm");
  
  // Conseguir a data atual e de 30 dias atrás no formato YYYY-MM-DD
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const [activeTab, setActiveTab] = useState("basic");
  const [filters, setFilters] = useState<ReportFilters>({
    type: "sales",
    startDate: formatDateForInput(thirtyDaysAgo),
    endDate: formatDateForInput(today),
    format: "detailed"
  });
  
  const handleChange = (name: keyof ReportFilters, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    if (name === "type" && onReportTypeChange) {
      onReportTypeChange(value);
    }
  };
  
  const handlePreviewReport = () => {
    onGenerateReport(filters, "preview");
    
    // Invalidar consultas relacionadas para buscar novos dados
    queryClient.invalidateQueries({ queryKey: [`/api/reports/${filters.type}`] });
  };
  
  const handleGenerateReport = () => {
    onGenerateReport(filters, "generate");
    
    // Invalidar consultas relacionadas para buscar novos dados
    queryClient.invalidateQueries({ queryKey: [`/api/reports/${filters.type}`] });
  };
  
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <CardContent className="p-4">
        {isMobile ? (
          <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Inicial:
                  </Label>
                  <Input
                    type="date"
                    id="startDate"
                    value={filters.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Final:
                  </Label>
                  <Input
                    type="date"
                    id="endDate"
                    value={filters.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Formato do Relatório:
                  </Label>
                  <Select
                    value={filters.format}
                    onValueChange={(value) => handleChange("format", value)}
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Resumido</SelectItem>
                      <SelectItem value="detailed">Detalhado</SelectItem>
                      <SelectItem value="charts">Apenas Gráficos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <div className="flex flex-col space-y-2 mt-4">
              <Button
                onClick={handlePreviewReport}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                disabled={isLoading}
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" /> 
                Prévia do Relatório
              </Button>
              
              <Button
                onClick={handleGenerateReport}
                className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Gerar Relatório Completo
              </Button>
            </div>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Inicial:
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={filters.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Final:
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={filters.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
              </div>
              
              <div>
                <Label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Formato:
                </Label>
                <Select
                  value={filters.format}
                  onValueChange={(value) => handleChange("format", value)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Resumido</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                    <SelectItem value="charts">Apenas Gráficos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className={cn(
                "flex items-end",
                isSmall ? "md:flex-col" : "md:flex-row md:space-x-2"
              )}>
                <Button
                  onClick={handlePreviewReport}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
                    isSmall ? "w-full mb-2" : "flex-1"
                  )}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" /> 
                  Prévia
                </Button>
                
                <Button
                  onClick={handleGenerateReport}
                  className={cn(
                    "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600",
                    isSmall ? "w-full" : "flex-1"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
