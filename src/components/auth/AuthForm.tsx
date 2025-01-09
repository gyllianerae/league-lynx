import { useAuthForm } from "@/hooks/useAuthForm";
import { usePasswordValidation } from "./usePasswordValidation";
import { PlatformSelect } from "./PlatformSelect";
import { PasswordInput } from "./PasswordInput";
import { UserInfoFields } from "./UserInfoFields";
import { SleeperIntegration } from "./SleeperIntegration";
import { AuthFormSubmit } from "./AuthFormSubmit";
import { SleeperVerificationDialog } from "./SleeperVerificationDialog";
import { EmailField } from "./EmailField";

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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={setSelectedPlatform}
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

        <AuthFormSubmit
          isLoading={isLoading}
          isSignUp={isSignUp}
          isDisabled={!!passwordError}
        />
      </form>

      {showVerification && (
        <SleeperVerificationDialog
          username={sleeperUsername}
          onConfirm={handleVerificationConfirm}
          onCancel={handleVerificationCancel}
        />
      )}
    </>
  );
};