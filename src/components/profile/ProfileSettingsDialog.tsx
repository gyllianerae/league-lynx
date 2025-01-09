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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single();
      
      if (profile?.role) {
        setRole(profile.role);
      }
    };

    if (open) {
      fetchCurrentRole();
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      onOpenChange(false);
      window.location.reload(); // Refresh to update sidebar text
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-forest-light/30 backdrop-blur-xl border border-mint/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-mint text-center">
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-mint/80">Your Role</label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger className="w-full bg-forest-dark/50 border-mint/20 text-mint">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent 
                className="bg-forest-light/100 text-mint border border-mint/10 rounded-md"
                position="popper"
                sideOffset={5}
                align="start"
                side="top"
              >
                <SelectItem value="regular_user" className="text-mint hover:bg-mint/10 focus:bg-mint/20 cursor-pointer">
                  Regular User (Fantasy Football Participant)
                </SelectItem>
                <SelectItem value="commissioner" className="text-mint hover:bg-mint/10 focus:bg-mint/20 cursor-pointer">
                  Commissioner (Manages Leagues)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-mint hover:bg-mint/90 text-forest"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}