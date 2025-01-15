import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FantraxLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (username: string) => void;
}

export const FantraxLoginDialog = ({
  open,
  onOpenChange,
  onLoginSuccess,
}: FantraxLoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin === "https://fantrax-api.onrender.com") {
        if (event.data.type === "FANTRAX_LOGIN_SUCCESS") {
          try {
            // Store auth data in platform_users table
            const { error } = await supabase
              .from('platform_users')
              .upsert({
                profile_id: (await supabase.auth.getUser()).data.user?.id,
                platform_id: 2, // Assuming Fantrax platform_id is 2
                username: event.data.username,
                auth_data: event.data.authData,
                sport: 'football',
                season: '2024'
              }, {
                onConflict: 'profile_id',
              });

            if (error) throw error;

            onLoginSuccess(event.data.username);
            onOpenChange(false);
            
            toast({
              title: "Success!",
              description: "Successfully connected to Fantrax",
            });
          } catch (error: any) {
            console.error('Error storing Fantrax auth data:', error);
            toast({
              title: "Error",
              description: "Failed to store Fantrax authentication data",
              variant: "destructive",
            });
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLoginSuccess, onOpenChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] bg-forest-light/95 border-mint/20">
        <DialogHeader>
          <DialogTitle className="text-mint">Fantrax Login</DialogTitle>
        </DialogHeader>
        <div className="relative h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-forest-light/50">
              <Loader2 className="h-8 w-8 animate-spin text-mint" />
            </div>
          )}
          <iframe
            src="https://fantrax-api.onrender.com"
            className="w-full h-full border-0 rounded-md"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};