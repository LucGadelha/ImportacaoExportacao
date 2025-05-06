import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  Layers, 
  BarChart3, 
  User,
  DollarSign
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Produtos", href: "/products", icon: ShoppingBag },
    { name: "Pedidos", href: "/orders", icon: FileText },
    { name: "Estoque", href: "/inventory", icon: Layers },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Taxas de Câmbio", href: "/exchange-rates", icon: DollarSign },
  ];
  
  return (
    <aside className="bg-sidebar bg-gray-800 text-white w-64 flex-shrink-0 h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">ImportExport</h1>
        <p className="text-sm text-gray-400">Sistema de Gestão</p>
      </div>
      
      <nav className="mt-4 flex-1">
        <ul>
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center py-3 px-4 transition duration-150",
                    isActive 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white mr-2">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
      </div>
      
      {onClose && (
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="text-white p-2"
            aria-label="Fechar menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
