import { Input } from "@/components/ui/input";

interface SleeperIntegrationProps {
  sleeperUsername: string;
  onSleeperUsernameChange: (value: string) => void;
}

export const SleeperIntegration = ({
  sleeperUsername,
  onSleeperUsernameChange,
}: SleeperIntegrationProps) => {
  return (
    <div className="text-left">
      <label htmlFor="sleeperUsername" className="block text-sm font-medium text-sky-900 dark:text-mint/80">
        Sleeper Username
      </label>
      <Input
        id="sleeperUsername"
        type="text"
        value={sleeperUsername}
        onChange={(e) => onSleeperUsernameChange(e.target.value)}
        className="mt-1 bg-gray-100 dark:bg-forest-light/50 backdrop-blur-md border dark:border-mint/10 dark:focus:border-mint/20 text-sky-900 dark:text-white dark:placeholder-mint/30 dark:focus:ring-mint/20"
      />
    </div>
  );
};