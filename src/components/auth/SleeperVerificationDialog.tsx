import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SleeperUser } from "@/types/sleeper/user";
import { LoadingSpinner } from "./verification/LoadingSpinner";
import { UserAvatar } from "./verification/UserAvatar";
import { useSleeperVerification } from "@/hooks/useSleeperVerification";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface SleeperVerificationDialogProps {
  username: string;
  onConfirm: (user: SleeperUser, preferences: { role: "regular_user" | "commissioner"; season: string }) => void;
  onCancel: () => void;
}

export const SleeperVerificationDialog = memo(({ 
  username, 
  onConfirm, 
  onCancel 
}: SleeperVerificationDialogProps) => {
  const { isLoading, sleeperUser, error } = useSleeperVerification(username);
  const [role, setRole] = useState<"regular_user" | "commissioner">("regular_user");
  const [season, setSeason] = useState("2024");

  const seasons = ["2024", "2023", "2022", "2021"];

  const handleConfirm = () => {
    if (sleeperUser) {
      onConfirm(sleeperUser, { role, season });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="bg-forest/95 backdrop-blur-xl border border-mint/10 shadow-2xl shadow-mint/10 max-w-sm mx-auto rounded-xl p-6 sm:p-8 m-4">
        <DialogHeader className="space-y-3 text-center">
          <DialogTitle className="text-2xl font-bold text-mint">
            Account Setup
          </DialogTitle>
          <DialogDescription className="text-mint/80 text-base">
            Verify your Sleeper account and complete your setup
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-md">
              Failed to load Sleeper account information
            </div>
          ) : sleeperUser ? (
            <>
              <UserAvatar user={sleeperUser} />
              
              <div className="w-full space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-mint">Select Your Role</Label>
                  <RadioGroup value={role} onValueChange={(value: "regular_user" | "commissioner") => setRole(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular_user" id="regular_user" />
                      <Label htmlFor="regular_user" className="text-mint/80">Regular User</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="commissioner" id="commissioner" />
                      <Label htmlFor="commissioner" className="text-mint/80">Commissioner</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-mint">Select Season to Display</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger className="w-full bg-forest border-mint/20 text-mint">
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year} Season
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex justify-center space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-mint/20 text-mint hover:bg-mint/10 hover:text-mint/90 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!sleeperUser}
            className="bg-mint text-forest hover:bg-mint/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Setup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

SleeperVerificationDialog.displayName = 'SleeperVerificationDialog';

export default SleeperVerificationDialog;