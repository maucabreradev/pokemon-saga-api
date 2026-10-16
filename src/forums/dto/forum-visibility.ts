export const FORUM_VISIBILITIES = ['public', 'registered', 'characters_only'] as const;

export type ForumVisibility = (typeof FORUM_VISIBILITIES)[number];
