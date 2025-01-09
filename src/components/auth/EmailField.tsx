import { Input } from "@/components/ui/input";

interface EmailFieldProps {
  email: string;
  onEmailChange: (value: string) => void;
}

export const EmailField = ({ email, onEmailChange }: EmailFieldProps) => {
  return (
    <div className="text-left">
      <label htmlFor="email" className="block text-sm font-medium text-mint/80">
        Email
      </label>
      <Input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="mt-1 bg-forest-light/50 backdrop-blur-md border border-mint/10 focus:border-mint/20 text-white placeholder-mint/30 focus:ring-mint/20"
      />
    </div>
  );
};