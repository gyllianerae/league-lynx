import { useTheme } from "next-themes";
import { Moon, Sun, User, Settings, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSettingsDialog } from "./profile/ProfileSettingsDialog";
import { useState } from "react";

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed top-0 right-0 left-0 h-16 z-50 glass-nav">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div /> {/* Empty div to maintain flex spacing */}
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-foreground hover:text-sky-600 dark:text-white dark:hover:text-mint hover:bg-sky-100/50 dark:hover:bg-forest-light/50"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:text-sky-600 dark:text-white dark:hover:text-mint hover:bg-sky-100/50 dark:hover:bg-forest-light/50"
                  >
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="User avatar" 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/90 dark:bg-forest-light/90 backdrop-blur-xl border-sky-600/10 dark:border-mint/10">
                  <DropdownMenuItem
                    className="text-sky-600 hover:bg-sky-100/50 dark:text-mint dark:hover:bg-forest-light/50 cursor-pointer"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="ghost"
              className="text-foreground hover:text-sky-600 dark:text-white dark:hover:text-mint hover:bg-sky-100/50 dark:hover:bg-forest-light/50"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      <ProfileSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}