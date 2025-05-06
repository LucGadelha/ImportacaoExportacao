import * as React from "react";

// Breakpoints para diferentes tamanhos de tela
export const breakpoints = {
  xs: 480,    // Extra pequeno (celulares pequenos)
  sm: 640,    // Pequeno (smartphones)
  md: 768,    // Médio (tablets)
  lg: 1024,   // Grande (desktops)
  xl: 1280,   // Extra grande (desktops maiores)
  xxl: 1536   // 2x Extra grande (telas grandes)
};

// Hook básico para verificar se é dispositivo móvel (< 768px)
export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoints.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoints.md);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < breakpoints.md);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// Hook para verificar se é tablet (entre 768px e 1024px)
export function useTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
    );
    const onChange = () => {
      setIsTablet(
        window.innerWidth >= breakpoints.md && 
        window.innerWidth < breakpoints.lg
      );
    };
    mql.addEventListener("change", onChange);
    setIsTablet(
      window.innerWidth >= breakpoints.md && 
      window.innerWidth < breakpoints.lg
    );
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTablet;
}

// Hook mais flexível para verificar breakpoints específicos
export function useBreakpoint(breakpoint: keyof typeof breakpoints) {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const breakpointValue = breakpoints[breakpoint];
    const mql = window.matchMedia(`(max-width: ${breakpointValue - 1}px)`);
    const onChange = () => {
      setIsBelow(window.innerWidth < breakpointValue);
    };
    mql.addEventListener("change", onChange);
    setIsBelow(window.innerWidth < breakpointValue);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!isBelow;
}

// Hook para detectar orientação do dispositivo
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)");
    
    const onChange = () => {
      setOrientation(mql.matches ? 'landscape' : 'portrait');
    };
    
    mql.addEventListener("change", onChange);
    setOrientation(mql.matches ? 'landscape' : 'portrait');
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return orientation;
}
