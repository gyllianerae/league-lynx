import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SleeperUser } from "@/types/sleeper/user";
import { LoadingSpinner } from "./verification/LoadingSpinner";
import { UserAvatar } from "./verification/UserAvatar";
import { useSleeperVerification } from "@/hooks/useSleeperVerification";

interface SleeperVerificationDialogProps {
  username: string;
  onConfirm: (user: SleeperUser) => void;
  onCancel: () => void;
}

export const SleeperVerificationDialog = memo(({ 
  username, 
  onConfirm, 
  onCancel 
}: SleeperVerificationDialogProps) => {
  const { isLoading, sleeperUser, error } = useSleeperVerification(username);

  return (
    <Dialog open={true}>
      <DialogContent className="bg-forest/95 backdrop-blur-xl border border-mint/10 shadow-2xl shadow-mint/10 max-w-sm mx-auto rounded-xl p-6 sm:p-8 m-4">
        <DialogHeader className="space-y-3 text-center">
          <DialogTitle className="text-2xl font-bold text-mint">
            Verification
          </DialogTitle>
          <DialogDescription className="text-mint/80 text-base">
            Please confirm this is your Sleeper account
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-md">
              Failed to load Sleeper account information
            </div>
          ) : sleeperUser ? (
            <UserAvatar user={sleeperUser} />
          ) : null}
        </div>

        <div className="flex justify-center space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-mint/20 text-mint hover:bg-mint/10 hover:text-mint/90 transition-colors"
          >
            That's Not Me
          </Button>
          <Button
            onClick={() => sleeperUser && onConfirm(sleeperUser)}
            disabled={!sleeperUser}
            className="bg-mint text-forest hover:bg-mint/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yes, That's Me
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

SleeperVerificationDialog.displayName = 'SleeperVerificationDialog';

export default SleeperVerificationDialog;