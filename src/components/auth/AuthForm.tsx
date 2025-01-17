import { useAuthForm } from "@/hooks/useAuthForm";
import { usePasswordValidation } from "./usePasswordValidation";
import { PlatformSelect } from "./PlatformSelect";
import { PasswordInput } from "./PasswordInput";
import { UserInfoFields } from "./UserInfoFields";
import { SleeperIntegration } from "./SleeperIntegration";
import { AuthFormSubmit } from "./AuthFormSubmit";
import { SleeperVerificationDialog } from "./SleeperVerificationDialog";
import { FantraxLoginDialog } from "./FantraxLoginDialog";
import { EmailField } from "./EmailField";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface AuthFormProps {
  isSignUp: boolean;
  onSubmit: (formData: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    sleeperUsername?: string;
  }) => Promise<{ user: { id: string } } | undefined>;
}

export const AuthForm = ({ isSignUp, onSubmit }: AuthFormProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showFantraxLogin, setShowFantraxLogin] = useState(false);
  const {
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
  } = useAuthForm({ isSignUp, onSubmit });

  const { password, passwordError, handlePasswordChange } = usePasswordValidation();

  const onSubmitWrapper = (e: React.FormEvent) => {
    if (isSignUp && !acceptedTerms) {
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    if (platform === "Fantrax") {
      setShowFantraxLogin(true);
    }
  };

  const handleFantraxLoginSuccess = (username: string) => {
    console.log("Fantrax login successful:", username);
    // Handle the successful login here
  };

  return (
    <>
      <form onSubmit={onSubmitWrapper} className="space-y-6">
        {isSignUp && (
          <>
            <UserInfoFields
              firstName={firstName}
              lastName={lastName}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
            />

            <PlatformSelect
              value={selectedPlatform}
              onChange={handlePlatformChange}
            />

            {selectedPlatform === "Sleeper" && (
              <SleeperIntegration
                sleeperUsername={sleeperUsername}
                onSleeperUsernameChange={setSleeperUsername}
              />
            )}
          </>
        )}

        <EmailField email={email} onEmailChange={setEmail} />

        <PasswordInput
          value={password}
          onChange={handlePasswordChange}
          error={passwordError}
        />

        {isSignUp && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="dark:border-mint/20 dark:data-[state=checked]:bg-mint data-[state=checked]:text-forest"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-500 dark:text-mint/80 cursor-pointer"
            >
              I agree to the Terms and Conditions
            </label>
          </div>
        )}

        <AuthFormSubmit
          isLoading={isLoading}
          isSignUp={isSignUp}
          isDisabled={isSignUp ? (!!passwordError || !acceptedTerms) : !!passwordError}
        />
      </form>

      {showVerification && (
        <SleeperVerificationDialog
          username={sleeperUsername}
          onConfirm={handleVerificationConfirm}
          onCancel={handleVerificationCancel}
        />
      )}

      <FantraxLoginDialog
        open={showFantraxLogin}
        onOpenChange={setShowFantraxLogin}
        onLoginSuccess={handleFantraxLoginSuccess}
      />
    </>
  );
};