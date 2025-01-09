import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSleeperUserByUsername } from "@/utils/sleeper/api";
import { syncSleeperData } from "@/utils/sleeper/sync/userDataSync";
import { SleeperUser } from "@/types/sleeper/user";

interface AuthFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  sleeperUsername?: string;
}

interface UseAuthFormProps {
  isSignUp: boolean;
  onSubmit: (formData: AuthFormData) => Promise<{ user: { id: string } } | undefined>;
}

export const useAuthForm = ({ isSignUp, onSubmit }: UseAuthFormProps) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [sleeperUsername, setSleeperUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState<AuthFormData | null>(null);
  const { toast } = useToast();

  const handleVerificationConfirm = async (sleeperUser: SleeperUser) => {
    if (!formData) {
      console.error("No form data found");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Proceeding with signup after verification...");
      const result = await onSubmit(formData);
      
      if (!result?.user) {
        throw new Error("Failed to create user account");
      }

      // Wait for the profile to be created by the database trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Starting Sleeper data sync for user:", result.user.id);
      await syncSleeperData(result.user.id, sleeperUser);
      
      toast({
        title: "Success!",
        description: "Your account has been created and connected to Sleeper.",
      });
      setShowVerification(false);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Verification/signup error:", error);
      // Only show error toast if it's not related to unique constraint or sleeper connection
      if (!error.message?.includes('unique constraint') && !error.message?.includes('connect your sleeper account')) {
        toast({
          title: "Error",
          description: error.message || "Failed to complete signup process",
          variant: "destructive",
        });
        // Sign out the user if there was an error during the Sleeper integration
        await supabase.auth.signOut();
      } else {
        // If it's a unique constraint error or sleeper connection message, just continue to dashboard
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
    setFormData(null);
    toast({
      title: "Verification Cancelled",
      description: "Please try again with the correct Sleeper username.",
      variant: "destructive",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const passwordInput = form.password as HTMLInputElement;
    
    if (isSignUp && selectedPlatform === "Sleeper" && sleeperUsername) {
      try {
        // Verify Sleeper username exists before proceeding
        const sleeperUser = await getSleeperUserByUsername(sleeperUsername);
        if (!sleeperUser) {
          toast({
            title: "Error",
            description: "Invalid Sleeper username",
            variant: "destructive",
          });
          return;
        }

        const data: AuthFormData = {
          firstName,
          lastName,
          email,
          password: passwordInput.value,
          sleeperUsername,
        };
        
        console.log("Showing verification dialog before signup");
        setFormData(data);
        setShowVerification(true);
        return;
      } catch (error: any) {
        console.error("Error verifying Sleeper username:", error);
        toast({
          title: "Error",
          description: "Failed to verify Sleeper username",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const data: AuthFormData = {
        ...(isSignUp && { firstName, lastName }),
        email,
        password: passwordInput.value,
      };
      
      const result = await onSubmit(data);

      if (result?.user) {
        if (!isSignUp) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('sleeper_username')
            .eq('id', result.user.id)
            .maybeSingle();

          if (profile?.sleeper_username) {
            const sleeperUser = await getSleeperUserByUsername(profile.sleeper_username);
            if (sleeperUser) {
              await syncSleeperData(result.user.id, sleeperUser);
            }
          }
        }
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      // Only show error toast if it's not related to unique constraint or sleeper connection
      if (!error.message?.includes('unique constraint') && !error.message?.includes('connect your sleeper account')) {
        toast({
          title: "Error",
          description: error.message || "An error occurred during submission",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    selectedPlatform,
    setSelectedPlatform,
    sleeperUsername,
    setSleeperUsername,
    isLoading,
    showVerification,
    handleVerificationConfirm,
    handleVerificationCancel,
    handleSubmit,
  };
};