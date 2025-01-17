import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebar();

  return (
    <aside className="fixed md:relative z-20">
      <div
        className={cn(
          "h-screen bg-forest-light/50 backdrop-blur-xl transition-all duration-300 fixed md:relative pt-16",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {children}
      </div>
      {/* Overlay that only appears on mobile and only blocks the main content */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 md:hidden transition-opacity z-[-1]",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )} 
        onClick={() => useSidebar().setCollapsed(true)}
      />
    </aside>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col h-full">{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-2">{children}</div>;
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <nav className="space-y-1">{children}</nav>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarTrigger() {
  const { collapsed, setCollapsed } = useSidebar();
  
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="fixed top-1/2 -translate-y-1/2 mt-8 -right-3 p-1.5 rounded-full bg-sky-900 text-gray-100 dark:bg-mint/10 dark:hover:bg-mint/20 dark:text-mint transition-colors duration-200 z-30"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </button>
  );
}