import { randomInt } from 'crypto';
import { ConflictError } from '../exceptions/app-errors';

export const READABLE_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]{2,31}$/;
const MAX_ATTEMPTS = 5;

const ADJECTIVES = [
  'Green',
  'Shadow',
  'Crimson',
  'Azure',
  'Golden',
  'Silver',
  'Silent',
  'Brave',
  'Swift',
  'Mystic',
  'Ember',
  'Frost',
  'Thunder',
  'Iron',
  'Velvet',
  'Solar',
  'Lunar',
  'Storm',
  'Wild',
  'Noble',
  'Clever',
  'Fierce',
  'Gentle',
  'Radiant',
];

const NOUNS = [
  'Apple',
  'Wolf',
  'Dragon',
  'Phoenix',
  'Tiger',
  'Falcon',
  'River',
  'Mountain',
  'Ocean',
  'Blade',
  'Arrow',
  'Shield',
  'Crown',
  'Flame',
  'Stone',
  'Cloud',
  'Star',
  'Moon',
  'Fox',
  'Bear',
  'Hawk',
  'Viper',
  'Lotus',
  'Comet',
];

const VERBS = [
  'Running',
  'Flying',
  'Striking',
  'Roaring',
  'Dancing',
  'Gliding',
  'Dashing',
  'Soaring',
  'Chasing',
  'Leaping',
  'Racing',
  'Wandering',
  'Seeking',
  'Guarding',
  'Blazing',
  'Howling',
  'Diving',
  'Climbing',
  'Dreaming',
  'Sparking',
  'Rushing',
  'Glowing',
  'Prowling',
  'Sailing',
];

function pick(words: string[]): string {
  return words[randomInt(words.length)];
}

export function generateReadableId(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${pick(VERBS)}${randomInt(1, 10000)}`;
}

export async function generateUniqueReadableId(
  exists: (id: string) => Promise<boolean>,
  maxAttempts: number = MAX_ATTEMPTS,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateReadableId();

    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  throw new ConflictError('Could not generate a unique readable ID, please try again');
}

export function isValidReadableId(id: string): boolean {
  return READABLE_ID_PATTERN.test(id);
}
