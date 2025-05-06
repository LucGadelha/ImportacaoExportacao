import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  percentageChange?: number;
  changeText?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  percentageChange,
  changeText = "desde o último mês",
}: StatsCardProps) {
  const isPositive = percentageChange ? percentageChange > 0 : null;
  
  return (
    <Card className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      
      {percentageChange !== undefined && (
        <div className="mt-2 flex items-center">
          <span className={cn("text-sm flex items-center", 
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-2">{changeText}</span>
        </div>
      )}
    </Card>
  );
}
