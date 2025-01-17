import { memo } from 'react';
import { SleeperUser } from "@/types/sleeper/user";

interface UserAvatarProps {
  user: SleeperUser;
}

export const UserAvatar = memo(({ user }: UserAvatarProps) => (
  <div className="text-left space-y-2">
    <h5 className="text-sm font-semibold text-sky-900/90 dark:text-mint">
      {user.display_name || user.username}
    </h5>
  </div>
));

UserAvatar.displayName = 'UserAvatar';