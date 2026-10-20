export const FRIENDSHIP_STATUSES = ['pending', 'accepted', 'blocked'] as const;

export type FriendshipStatus = (typeof FRIENDSHIP_STATUSES)[number];
