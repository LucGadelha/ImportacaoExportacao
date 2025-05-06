import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, ArrowRight, AlertTriangle, InfoIcon, BarChart3 } from "lucide-react";
import { useMobile, useBreakpoint } from "@/hooks/use-mobile";
import { formatCurrency, cn } from "@/lib/utils";

// Tipos de interfaces para os dados da API
interface ExchangeRateResponse {
  rates: Record<string, number>;
  timestamp: number;
  cached: boolean;
}

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  date: string;
}

// Lista de moedas disponíveis
const currencies = [
  { code: "USD", name: "Dólar Americano" },
  { code: "EUR", name: "Euro" },
  { code: "BRL", name: "Real Brasileiro" },
  { code: "GBP", name: "Libra Esterlina" },
  { code: "JPY", name: "Iene Japonês" },
  { code: "CAD", name: "Dólar Canadense" },
  { code: "AUD", name: "Dólar Australiano" },
  { code: "CNY", name: "Yuan Chinês" },
  { code: "CHF", name: "Franco Suíço" },
  { code: "MXN", name: "Peso Mexicano" }
];

export default function ExchangeRates() {
  const isMobile = useMobile();
  const isSmall = useBreakpoint("sm");
  
  // Estado para a consulta de taxas
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Estado para a conversão
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BRL");
  const [amount, setAmount] = useState("100");
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  
  // Formatador para datas
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Consulta de taxas de câmbio
  const { 
    data: ratesData, 
    isLoading: isLoadingRates,
    isError: isRatesError,
    refetch: refetchRates
  } = useQuery<ExchangeRateResponse>({
    queryKey: ['/api/exchange-rates', baseCurrency, selectedDate],
    queryFn: async () => {
      return await apiRequest<ExchangeRateResponse>("GET", `/api/exchange-rates?base=${baseCurrency}&date=${selectedDate}`);
    }
  });
  
  // Função para realizar a conversão
  const handleConvert = async () => {
    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        return;
      }
      
      const payload = {
        amount: numericAmount,
        from: fromCurrency,
        to: toCurrency,
        date: selectedDate
      };
      
      const result = await apiRequest<ConversionResult>(
        "POST", 
        '/api/exchange-rates/convert', 
        payload
      );
      
      setConversionResult(result);
    } catch (error) {
      console.error("Erro na conversão:", error);
    }
  };
  
  // Renderiza a tabela de taxas de câmbio
  const renderRatesTable = () => {
    if (isLoadingRates) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      );
    }
    
    if (isRatesError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar taxas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as taxas de câmbio. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!ratesData) {
      return (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Nenhum dado disponível</AlertTitle>
          <AlertDescription>
            Selecione uma moeda base e uma data para ver as taxas de câmbio.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {ratesData.cached ? 
              "Dados em cache" : 
              "Dados atualizados"
            }
          </span>
          <span>•</span>
          <span>
            {dateFormatter.format(new Date(ratesData.timestamp))}
          </span>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Moeda</TableHead>
              <TableHead className="text-right">Taxa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(ratesData.rates).map(([currency, rate]) => {
              const currencyInfo = currencies.find(c => c.code === currency);
              return (
                <TableRow key={currency}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{currency}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {currencyInfo ? currencyInfo.name : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {rate.toFixed(6)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Renderiza o conversor de moedas
  const renderConverter = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Digite o valor"
              className="dark:bg-gray-800"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fromCurrency">De</Label>
            <Select
              value={fromCurrency}
              onValueChange={setFromCurrency}
            >
              <SelectTrigger id="fromCurrency">
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toCurrency">Para</Label>
            <Select
              value={toCurrency}
              onValueChange={setToCurrency}
            >
              <SelectTrigger id="toCurrency">
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conversionDate">Data</Label>
            <Input
              id="conversionDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="dark:bg-gray-800"
            />
          </div>
        </div>
        
        <div className="flex justify-center pt-2">
          <Button onClick={handleConvert} className="w-full sm:w-auto">
            Converter <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {conversionResult && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">
                  {conversionResult.amount.toFixed(2)} {conversionResult.from} = {conversionResult.convertedAmount.toFixed(2)} {conversionResult.to}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  1 {conversionResult.from} = {conversionResult.rate.toFixed(6)} {conversionResult.to}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Taxa de {conversionResult.date}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  return (
    <section className="mb-8">
      <div className={cn(
        "mb-6",
        isMobile ? "flex flex-col space-y-2" : "flex justify-between items-center"
      )}>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Taxas de Câmbio</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Consulte taxas de câmbio atualizadas e faça conversões entre moedas
          </p>
        </div>
        
        <Button variant="outline" onClick={() => refetchRates()} disabled={isLoadingRates}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoadingRates && "animate-spin")} />
          Atualizar Taxas
        </Button>
      </div>
      
      <Tabs defaultValue="rates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rates">Consultar Taxas</TabsTrigger>
          <TabsTrigger value="converter">Conversor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxas de Câmbio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseCurrency">Moeda Base</Label>
                  <Select
                    value={baseCurrency}
                    onValueChange={setBaseCurrency}
                  >
                    <SelectTrigger id="baseCurrency">
                      <SelectValue placeholder="Selecione a moeda base" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="rateDate">Data</Label>
                  <Input
                    id="rateDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="dark:bg-gray-800"
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {renderRatesTable()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  As taxas de câmbio são obtidas em tempo real e armazenadas em cache para otimizar a performance.
                  Os dados são atualizados automaticamente a cada hora.
                </p>
                
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <Button variant="outline" className="flex items-center" disabled>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gráfico Histórico
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="converter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversor de Moedas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderConverter()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}