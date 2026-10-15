import {
  generateReadableId,
  generateUniqueReadableId,
  isValidReadableId,
} from './readable-id-generator';
import { ConflictError } from '../exceptions/app-errors';

describe('generateReadableId', () => {
  it('should produce CapitalizedWords followed by a number', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateReadableId();

      expect(id).toMatch(/^[A-Z][a-z]+([A-Z][a-z]+){2}\d{1,4}$/);
    }
  });

  it('should suffix a number between 1 and 9999', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateReadableId();
      const number = parseInt(id.match(/\d+$/)?.[0] ?? '0', 10);

      expect(number).toBeGreaterThanOrEqual(1);
      expect(number).toBeLessThanOrEqual(9999);
    }
  });
});

describe('generateUniqueReadableId', () => {
  it('should return the first candidate when it is free', async () => {
    const exists = jest.fn().mockResolvedValue(false);

    const id = await generateUniqueReadableId(exists);

    expect(id).toMatch(/^[A-Z][a-z]+([A-Z][a-z]+){2}\d{1,4}$/);
    expect(exists).toHaveBeenCalledTimes(1);
  });

  it('should retry on collision and return the free candidate', async () => {
    const exists = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    const id = await generateUniqueReadableId(exists);

    expect(typeof id).toBe('string');
    expect(exists).toHaveBeenCalledTimes(3);
  });

  it('should throw ConflictError after exhausting retries', async () => {
    const exists = jest.fn().mockResolvedValue(true);

    await expect(generateUniqueReadableId(exists)).rejects.toBeInstanceOf(ConflictError);
    expect(exists).toHaveBeenCalledTimes(5);
  });
});

describe('isValidReadableId', () => {
  it.each(['GreenAppleHunter123', 'Ab1', 'ab_cd', 'A'.repeat(32)])('should accept %s', (id) => {
    expect(isValidReadableId(id)).toBe(true);
  });

  it.each(['', 'ab', '1abc', '_abc', 'ab-cd', 'ab cd', 'ab$cd', 'A'.repeat(33)])(
    'should reject %s',
    (id) => {
      expect(isValidReadableId(id)).toBe(false);
    },
  );
});
