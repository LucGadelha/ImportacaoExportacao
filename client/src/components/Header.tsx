import { useMobile, useBreakpoint } from "@/hooks/use-mobile";
import { Menu, Search, Bell, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const isMobile = useMobile();
  const isSmall = useBreakpoint("sm");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Detectar scroll para adicionar sombra ao header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Detectar preferência de tema escuro
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode") === "true" || 
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    setIsDarkMode(darkModePreference);
    
    if (darkModePreference) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem("darkMode", String(newValue));
    
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  return (
    <header className={cn(
      "bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-full z-30 transition-all",
      isScrolled && "shadow-md"
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        {isMobile && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Abrir menu"
              className="mr-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">ImportExport</h1>
          </div>
        )}
        
        {!isMobile && (
          <div className="flex items-center">
            <h1 className="text-lg font-bold">Painel de Controle</h1>
          </div>
        )}
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {!isSmall && (
            <div className="relative mr-2">
              <input
                type="search"
                placeholder="Buscar..."
                className="pl-9 pr-4 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-40 md:w-60"
              />
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Alternar tema"
            onClick={toggleDarkMode}
            className="text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificações"
            className="text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Perfil"
            className="text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
