import { Input } from "@/components/ui/input";

interface EmailFieldProps {
  email: string;
  onEmailChange: (value: string) => void;
}

export const EmailField = ({ email, onEmailChange }: EmailFieldProps) => {
  return (
    <div className="text-left">
      <label htmlFor="email" className="block text-sm font-medium text-sky-900 dark:text-mint/80">
        Email
      </label>
      <Input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="mt-1 bg-gray-100 dark:bg-forest-light/50 backdrop-blur-md border dark:border-mint/10 dark:focus:border-mint/20 text-sky-900 dark:text-white dark:placeholder-mint/30 dark:focus:ring-mint/20"
      />
    </div>
  );
};