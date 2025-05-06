import { useMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const isMobile = useMobile();
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className="bg-gray-800 text-white w-full">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">ImportExport</h1>
        <button 
          onClick={toggleSidebar}
          className="text-white"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
