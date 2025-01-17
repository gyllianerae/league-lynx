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
        <label htmlFor="firstName" className="block text-sm font-medium text-sky-900 dark:text-mint/80 text-left">
          First Name
        </label>
        <Input
          id="firstName"
          type="text"
          required
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className="mt-1 bg-gray-100 dark:bg-forest-light/50 backdrop-blur-md border dark:border-mint/10 dark:focus:border-mint/20 text-sky-900 dark:text-white dark:placeholder-mint/30 dark:focus:ring-mint/20"
        />
      </div>

      <div className="text-left">
        <label htmlFor="lastName" className="block text-sm font-medium text-sky-900 dark:text-mint/80 text-left">
          Last Name
        </label>
        <Input
          id="lastName"
          type="text"
          required
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className="mt-1 bg-gray-100 dark:bg-forest-light/50 backdrop-blur-md border dark:border-mint/10 dark:focus:border-mint/20 text-sky-900 dark:text-white dark:placeholder-mint/30 dark:focus:ring-mint/20"
        />
      </div>
    </>
  );
};