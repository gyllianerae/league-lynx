export interface SleeperUser {
  username: string;
  user_id: string;
  display_name: string | null;
  avatar: string | null;
  is_owner?: boolean;
}