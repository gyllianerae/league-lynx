import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthForm } from "@/components/auth/AuthForm";
import { InitialSetupDialog } from "@/components/auth/InitialSetupDialog";
import { LogIn, UserPlus } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Auth Session:", session); // Log session data
        if (session) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("onboarding_status")
            .eq("id", session.user.id)
            .single();
          if (error) {
            console.error("Error fetching profile:", error);
            throw error;
          }
          console.log("Fetched Profile:", profile); // Log profile to check onboarding_status

          if (profile?.onboarding_status === "pending") {
            console.log("Showing Initial Setup Dialog");
            setShowSetup(true);
          } else {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        toast.error("Error checking authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log("Auth state changed:", event, session?.user?.id);
      if (event === "SIGNED_IN" && session) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_status")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile after sign-in:", error);
          return;
        }

        console.log("Profile after sign-in:", profile);
        if (profile?.onboarding_status === "pending") {
          setShowSetup(true);
        } else {
          navigate("/dashboard");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (formData: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    sleeperUsername?: string;
  }) => {
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });

        if (error) throw error;

        // Insert or update profile with onboarding status
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user?.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            onboarding_status: "pending",
          });

        if (profileError) throw profileError;

        console.log("Profile successfully created/updated");
        toast.success("Account created successfully.");
        setShowSetup(true); // Manually open initial setup after sign-up
        return { user: data.user! };
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        return { user: data.user };
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication.");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-mint"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-forest-light/30 backdrop-blur-xl p-8 rounded-lg shadow-xl border border-mint/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint/10 mb-4">
              {isSignUp ? (
                <UserPlus className="h-8 w-8 text-mint" />
              ) : (
                <LogIn className="h-8 w-8 text-mint" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-mint">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-mint/60">
              {isSignUp
                ? "Sign up to start managing your fantasy leagues"
                : "Sign in to access your dashboard"}
            </p>
          </div>

          <AuthForm isSignUp={isSignUp} onSubmit={handleSubmit} />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-mint/80 hover:text-mint hover:underline transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>

      <InitialSetupDialog
        open={showSetup}
        onOpenChange={(open) => {
          console.log("InitialSetupDialog open state:", open); // Log open state
          if (!open) {
            navigate("/dashboard");
          }
          setShowSetup(open);
        }}
      />
    </div>
  );
};

export default AuthPage;
