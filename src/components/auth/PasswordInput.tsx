import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PasswordInput = ({ value, onChange, error }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*)";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    onChange(newPassword);
  };

  return (
    <div className="text-left">
      <label htmlFor="password" className="block text-sm font-medium text-sky-900 dark:text-mint/80">
        Password
      </label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          required
          value={value}
          onChange={handleChange}
          className="mt-1 bg-gray-100 dark:bg-forest-light/50 backdrop-blur-md border dark:border-mint/10 dark:focus:border-mint/20 text-sky-900 dark:text-white dark:placeholder-mint/30 dark:focus:ring-mint/20 pr-10"
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
          title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-900 dark:text-mint/60 dark:hover:text-mint focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};