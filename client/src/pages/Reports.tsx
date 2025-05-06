import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReportFilters, { ReportFilters as Filters } from "@/components/reports/ReportFilters";
import ReportOutput from "@/components/reports/ReportOutput";
import { cn } from "@/lib/utils";
import { useMobile, useBreakpoint } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FileDown, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface ReportAction {
  type: "preview" | "generate";
  filters: Filters;
}

export default function Reports() {
  const isMobile = useMobile();
  const isSmall = useBreakpoint("sm");
  const [activeFilters, setActiveFilters] = useState<Filters | null>(null);
  const [mode, setMode] = useState<"preview" | "generate" | null>(null);
  const [reportType, setReportType] = useState<string>("sales");
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Estado da query de relatório
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [`/api/reports/${reportType}`, activeFilters],
    enabled: !!activeFilters,
  });
  
  // Manipulador para alterações no tipo de relatório
  const handleReportTypeChange = (type: string) => {
    setReportType(type);
  };
  
  // Manipulador principal para geração de relatórios
  const handleGenerateReport = (filters: Filters, actionMode: "preview" | "generate") => {
    setActiveFilters(filters);
    setMode(actionMode);
    
    // Abrir modal de prévia se for modo de prévia
    if (actionMode === "preview") {
      setPreviewOpen(true);
    }
  };
  
  // Gerar relatório completo a partir da prévia
  const handleGenerateFromPreview = () => {
    if (activeFilters) {
      setMode("generate");
      setPreviewOpen(false);
    }
  };
  
  // Manipulador para download de relatório
  const handleDownload = (format: string) => {
    if (!activeFilters) return;
    
    const url = `/api/reports/${activeFilters.type}/export/${format}?startDate=${activeFilters.startDate}&endDate=${activeFilters.endDate}`;
    window.open(url, "_blank");
  };

  return (
    <section className="mb-8">
      <div className={cn(
        "mb-6",
        isMobile ? "flex flex-col space-y-2" : "flex justify-between items-center"
      )}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Relatórios</h2>
        
        {activeFilters && mode === "generate" && !isMobile && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownload("excel")}
              className="flex items-center"
            >
              <FileDown className="mr-1 h-4 w-4" /> Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownload("pdf")}
              className="flex items-center"
            >
              <FileDown className="mr-1 h-4 w-4" /> PDF
            </Button>
          </div>
        )}
      </div>

      <ReportFilters 
        onGenerateReport={handleGenerateReport} 
        isLoading={isLoading}
        onReportTypeChange={handleReportTypeChange}
      />
      
      {/* Status de erro ao carregar relatório */}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao gerar relatório</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao processar os dados do relatório. Tente novamente mais tarde ou contate o suporte.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Relatório principal (modo de geração) */}
      {activeFilters && mode === "generate" && (
        <>
          <ReportOutput filters={activeFilters} />
          
          {/* Ações flutuantes para mobile */}
          {isMobile && (
            <div className="fixed bottom-4 right-4 left-4 z-10 flex justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-2 flex space-x-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload("excel")}
                  >
                    <Download className="h-4 w-4 mr-1" /> Excel
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload("pdf")}
                  >
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => window.print()}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Imprimir
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
      
      {/* Modal de prévia do relatório */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévia do Relatório</DialogTitle>
            <DialogDescription>
              Esta é uma prévia do relatório. Revise os dados antes de gerar o relatório completo.
            </DialogDescription>
          </DialogHeader>
          
          {activeFilters && mode === "preview" && (
            <div className="mt-4">
              <ReportOutput filters={activeFilters} />
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleGenerateFromPreview}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Gerar Relatório Completo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
