import { Button } from "@/components/ui/button";

interface AuthFormSubmitProps {
  isLoading: boolean;
  isSignUp: boolean;
  isDisabled: boolean;
}

export const AuthFormSubmit = ({ isLoading, isSignUp, isDisabled }: AuthFormSubmitProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-mint text-forest hover:bg-mint/90 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] hover:shadow-[0_0_15px_rgba(100,255,218,0.5)]"
      disabled={isDisabled || isLoading}
    >
      {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
    </Button>
  );
};