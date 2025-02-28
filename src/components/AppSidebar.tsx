import { LayoutGrid, Users, Trophy, History, LogOut, Store, Globe } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

const getMenuItems = (role: UserRole) => [
  {
    title: "Dashboard",
    icon: LayoutGrid,
    path: "/dashboard",
  },
  {
    title: "Players",
    icon: Users,
    path: "/players",
    subItems: [
      {
        title: "My Players",
        path: "/players/my-players",
      },
      {
        title: "Player Updates",
        path: "/players/updates",
      },
    ],
  },
  {
    title: role === "commissioner" ? "My Leagues" : "My Teams",
    icon: Trophy,
    path: "/leagues",
  },
  {
    title: "Marketplace",
    icon: Store,
    path: "/marketplace",
  },
  {
    title: "Transactions",
    icon: History,
    path: "/transactions",
    dynamicPath: true,
  },
  {
    title: "Community",
    icon: Globe,
    path: "/community",
  }
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { leagueId } = useParams();
  const currentPath = location.pathname;
  const { collapsed } = useSidebar();
  const [userRole, setUserRole] = useState<UserRole>("regular_user");

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
  
      if (userError) {
        console.error("Error fetching user ID:", userError);
        return;
      }
  
      if (user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
  
        if (error) {
          console.error('Error fetching user role:', error);
          return;
        }
  
        if (profile?.role) {
          setUserRole(profile.role);
        } else {
          console.log("User role not found, defaulting to regular_user");
        }
      }
    };
  
    fetchUserRole();
  }, []);

  const menuItems = getMenuItems(userRole);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const getPath = (item: typeof menuItems[0]) => {
    if (item.dynamicPath && leagueId) {
      return item.path.replace(":leagueId", leagueId);
    }
    return item.path;
  };

  const isActive = (path: string) => {
    if (path.includes(":leagueId") && leagueId) {
      path = path.replace(":leagueId", leagueId);
    }
    return currentPath === path || currentPath.startsWith(path);
  };

  return (
    <Sidebar className="bg-gray-50 dark:bg-forest border-r border-gray-200 dark:border-mint/10">
      <SidebarContent>
        <div className={`px-6 mb-6 relative ${collapsed ? "px-2" : ""}`}>
          {/* <h1 className={`text-xl font-bold text-sky-900 dark:text-mint ${collapsed ? "hidden" : ""}`}>League Lynx</h1> */}
          <SidebarTrigger />
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <Button 
                      onClick={() => navigate(getPath(item))}
                      className={`flex justify-start gap-3 w-full ${
                        isActive(item.path)
                          ? 'bg-sky-100 text-sky-900 dark:bg-mint/10 dark:text-mint'
                          : 'text-gray-600 hover:text-sky-900 hover:bg-sky-50 dark:text-white/70 dark:hover:text-mint dark:hover:bg-forest-light/50'
                      } ${collapsed ? "justify-center px-2" : ""}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={collapsed ? "hidden" : ""}>{item.title}</span>
                    </Button>
                  </SidebarMenuItem>
                  
                  {!collapsed && isActive(item.path) && item.subItems && (
                    <div className="ml-9 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Button
                          key={subItem.title}
                          onClick={() => navigate(subItem.path)}
                          className={`w-full justify-start text-sm ${
                            currentPath === subItem.path
                              ? 'text-sky-900 dark:text-mint'
                              : 'text-gray-500 hover:text-sky-900 dark:text-white/50 dark:hover:text-mint'
                          }`}
                          variant="ghost"
                        >
                          {subItem.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className={`absolute bottom-8 left-0 right-0 ${collapsed ? "px-2" : "px-4"}`}>
          <Button 
            onClick={handleLogout}
            className={`w-full gap-3 flex justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="h-5 w-4" />
            <span className={collapsed ? "hidden" : ""}>Logout</span>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
