import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { ShoppingBasket, Layers, AlertCircle, User } from "lucide-react";
import { Activity } from "@shared/schema";

export default function ActivityList() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  function getActivityIcon(type: string) {
    switch (type) {
      case "order":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
            <ShoppingBasket className="h-4 w-4" />
          </div>
        );
      case "product":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
            <User className="h-4 w-4" />
          </div>
        );
      case "inventory":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
            <Layers className="h-4 w-4" />
          </div>
        );
      case "alert":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
            <AlertCircle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
            <User className="h-4 w-4" />
          </div>
        );
    }
  }

  function getTimeAgo(date: Date | string) {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMilliseconds = now.getTime() - activityDate.getTime();
    
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
    } else {
      return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
    }
  }
  
  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-800">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-2 text-center text-sm text-gray-500">Carregando atividades...</div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-2 text-center text-sm text-gray-500">Nenhuma atividade recente encontrada</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
