import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SleeperVerificationDialog } from "@/components/auth/SleeperVerificationDialog";
import { useToast } from "@/components/ui/use-toast";
import { handleSleeperIntegration } from "@/utils/sleeperIntegration";
import { SleeperUser } from "@/types/sleeper/user";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sleeperUsername, setSleeperUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_status, sleeper_username')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        navigate('/auth');
        return;
      }

      if (profile.onboarding_status === 'completed') {
        navigate('/');
        return;
      }

      if (profile.sleeper_username) {
        setSleeperUsername(profile.sleeper_username);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleVerificationConfirm = async (sleeperUser: SleeperUser) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      await handleSleeperIntegration(session.user.id, sleeperUser.username);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_status: 'completed' })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: "Your Sleeper account has been connected successfully.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVerificationCancel = () => {
    toast({
      title: "Verification Cancelled",
      description: "Please try again with the correct Sleeper username.",
      variant: "destructive",
    });
    navigate('/auth');
  };

  if (!sleeperUsername) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center">
        <div className="text-mint text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest">
      <SleeperVerificationDialog
        username={sleeperUsername}
        onConfirm={handleVerificationConfirm}
        onCancel={handleVerificationCancel}
      />
    </div>
  );
};

export default OnboardingPage;