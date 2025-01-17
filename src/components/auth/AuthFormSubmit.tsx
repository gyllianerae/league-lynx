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
      className="w-full bg-sky-900 text-gray-100 dark:bg-mint dark:text-forest dark:hover:bg-mint/90  hover:bg-sky-800"
      disabled={isDisabled || isLoading}
    >
      {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
    </Button>
  );
};