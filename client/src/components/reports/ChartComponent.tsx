import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    [key: string]: any;
  }[];
}

interface ChartComponentProps {
  type: "line" | "bar" | "pie" | "doughnut";
  data: ChartData;
  options?: any;
}

export default function ChartComponent({ type, data, options = {} }: ChartComponentProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<any> | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // Destruir instância anterior do gráfico se existir
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Criar nova instância do gráfico
      const ctx = chartRef.current.getContext("2d");
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type,
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top" as const,
              },
            },
            ...options,
          },
        });
      }
    }
    
    // Limpeza da instância do gráfico quando o componente é desmontado
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);
  
  return <canvas ref={chartRef} />;
}
