import { Input } from "@/components/ui/input";

interface UserInfoFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export const UserInfoFields = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: UserInfoFieldsProps) => {
  return (
    <>
      <div className="text-left">
        <label htmlFor="firstName" className="block text-sm font-medium text-mint/80 text-left">
          First Name
        </label>
        <Input
          id="firstName"
          type="text"
          required
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className="mt-1 bg-forest-light/50 backdrop-blur-md border border-mint/10 focus:border-mint/20 text-white placeholder-mint/30 focus:ring-mint/20"
        />
      </div>

      <div className="text-left">
        <label htmlFor="lastName" className="block text-sm font-medium text-mint/80 text-left">
          Last Name
        </label>
        <Input
          id="lastName"
          type="text"
          required
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className="mt-1 bg-forest-light/50 backdrop-blur-md border border-mint/10 focus:border-mint/20 text-white placeholder-mint/30 focus:ring-mint/20"
        />
      </div>
    </>
  );
};