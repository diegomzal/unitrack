import { describe, it, expect } from 'vitest';
import { generateId } from './generateId';

describe('generateId utility', () => {
    it('should generate a string ID', () => {
        const id = generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });
});
