import { useState } from "react";
import { Home, TrendingUp, BarChart3, BookOpen, User, Moon, Sun } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Predictions", url: "/predictions", icon: TrendingUp },
  { title: "Backtesting", url: "/backtesting", icon: BarChart3 },
  { title: "Saved Results", url: "/saved", icon: BookOpen },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isDark, setIsDark] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const isExpanded = navigation.some((item) => isActive(item.url));
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary-hover" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Sidebar
      className={`${state === "collapsed" ? "w-14" : "w-60"} border-r border-border bg-card`}
      collapsible="icon"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        {state !== "collapsed" && (
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">StockVision</span>
          </div>
        )}
        {state === "collapsed" && (
          <TrendingUp className="h-6 w-6 text-primary mx-auto" />
        )}
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Theme Toggle */}
        <div className="mt-auto p-2">
          <Button
            variant="ghost"
            size={state === "collapsed" ? "icon" : "sm"}
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {state !== "collapsed" && <span className="ml-2">{isDark ? 'Light' : 'Dark'} Mode</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}