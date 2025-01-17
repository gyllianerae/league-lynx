import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditLeagueDialog } from "./EditLeagueDialog";
import { MarketplaceListing } from "@/types/database/marketplace-league";

interface CommissionerActionsProps {
  league: MarketplaceListing;
  onDelete: () => void;
}

export const CommissionerActions = ({ league, onDelete }: CommissionerActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-sky-900 dark:text-white/60 dark:hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className=" dark:bg-forest-light dark:border-mint/10">
          <DropdownMenuItem 
            className="hover:bg-gray-200 dark:hover:bg-forest-light text-sky-900 dark:text-mint cursor-pointer"
            onClick={() => setIsEditOpen(true)}
          >
            Edit League
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="hover:bg-gray-200 dark:hover:bg-forest-light text-red-400 cursor-pointer"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete League
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditLeagueDialog
        league={league}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-forest-light border-mint/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-mint">Delete League</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete this league? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-forest-light text-mint hover:bg-forest-light/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
              onClick={() => {
                onDelete();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};