import { useState, useEffect } from "react";
import { useMobile, useBreakpoint, useOrientation } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useMobile();
  const isSmall = useBreakpoint("sm");
  const orientation = useOrientation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fechar sidebar em mobile quando a orientação muda
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [orientation, isMobile]);
  
  // Fechar sidebar quando mudar para desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar para desktop */}
      {!isMobile && <Sidebar />}
      
      {/* Overlay para mobile quando sidebar está aberta */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" 
             onClick={toggleSidebar} 
             aria-hidden="true" />
      )}
      
      {/* Sidebar mobile com animação */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
          isMobile && !isSidebarOpen && "-translate-x-full",
          isMobile && isSidebarOpen && "translate-x-0",
          !isMobile && "hidden"
        )}
      >
        <Sidebar onClose={toggleSidebar} />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main 
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-all",
            isMobile ? "pt-4" : "pt-6",
            isSmall ? "px-2 py-3" : "px-4 py-6 md:px-6"
          )}
        >
          <div className={cn(
            "mx-auto w-full",
            isSmall ? "max-w-full" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
