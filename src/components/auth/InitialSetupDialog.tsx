import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface InitialSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitialSetupDialog({ open, onOpenChange }: InitialSetupDialogProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("regular_user");
  const [season, setSeason] = useState("2024");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role,
          selected_season: season,
          onboarding_status: "completed"
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success("Setup completed successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Setup error:", error);
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
            Initial Setup
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-mint/80">Choose Your Role</label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger className="w-full bg-forest-dark/50 border-mint/20 text-mint">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-forest-dark/90 border-mint/20">
                <SelectItem value="regular_user" className="text-mint hover:bg-mint/10">
                  Regular User (Fantasy Football Participant)
                </SelectItem>
                <SelectItem value="commissioner" className="text-mint hover:bg-mint/10">
                  Commissioner (Manages Leagues)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-mint/60">
              Note: Commissioners will have additional features enabled
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-mint/80">Select Season</label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-full bg-forest-dark/50 border-mint/20 text-mint">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-forest-dark/90 border-mint/20">
                <SelectItem value="2024" className="text-mint hover:bg-mint/10">2024</SelectItem>
                <SelectItem value="2025" className="text-mint hover:bg-mint/10">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-mint hover:bg-mint/90 text-forest"
          >
            {isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}