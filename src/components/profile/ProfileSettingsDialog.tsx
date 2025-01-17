import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const [role, setRole] = useState<UserRole>("regular_user");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentRole = async () => {
      try {
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
            .from("profiles")
            .select("role")
            .eq("id", user.id) // Fetch only for the authenticated user
            .single(); // Expect a single result

          if (error) {
            console.error("Error fetching role:", error);
            return;
          }

          if (profile?.role) {
            setRole(profile.role); // Set role to the current value
            console.log("Fetched User Role:", profile.role); // Debug log
          } else {
            console.warn("User role not found, defaulting to regular_user");
          }
        }
      } catch (error) {
        console.error("Error in fetchCurrentRole:", error);
      }
    };

    if (open) {
      fetchCurrentRole();
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        toast.error("Error getting authenticated user");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user?.id); // Update role based on authenticated user ID

      if (error) throw error;

      toast.success("Profile updated successfully!");
      onOpenChange(false);
      window.location.reload(); // Refresh to reflect sidebar changes
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-100 dark:bg-forest-light/30 backdrop-blur-xl border dark:border-mint/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sky-900 dark:text-mint text-center">
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900 dark:text-mint/80">Your Role</label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger className="w-full bg-gray-50 text-sky-900 dark:bg-forest-dark/50 dark:border-mint/20 dark:text-mint">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent
                className="bg-gray-50 dark:bg-forest-light/100 dark:text-mint border dark:border-mint/10 rounded-md"
                position="popper"
                sideOffset={5}
                align="start"
                side="top"
              >
                <SelectItem value="regular_user" className="text-sky-900 hover:bg-gray-100 dark:text-mint dark:hover:bg-mint/10 dark:focus:bg-mint/20 cursor-pointer">
                  Regular User (Fantasy Football Participant)
                </SelectItem>
                <SelectItem value="commissioner" className="text-sky-900 hover:bg-gray-100 dark:text-mint dark:hover:bg-mint/10 dark:focus:bg-mint/20 cursor-pointer">
                  Commissioner (Manages Leagues)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-sky-900 text-gray-100 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
