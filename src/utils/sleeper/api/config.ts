export const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

export const getAvatarUrl = (avatarId: string | null, thumbnail: boolean = false): string => {
  if (!avatarId) return '/placeholder.svg';
  const path = thumbnail ? 'thumbs/' : '';
  return `https://sleepercdn.com/avatars/${path}${avatarId}`;
};