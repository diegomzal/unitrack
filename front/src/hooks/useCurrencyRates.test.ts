import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useCurrencyRates } from './useCurrencyRates';

describe('useCurrencyRates hook', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns rate 1 immediately when currency is USD', async () => {
        const { result } = renderHook(() => useCurrencyRates('USD'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.rate).toBe(1);
            expect(result.current.error).toBeNull();
        });
    });

    it('returns rate 1 when currency is empty', async () => {
        const { result } = renderHook(() => useCurrencyRates(''));
        
        await waitFor(() => {
            expect(result.current.rate).toBe(1);
        });
    });

    it('fetches and returns the rate for a valid currency', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                rates: { USD: 1.1 },
                date: '2026-03-19',
            }),
        });

        const { result } = renderHook(() => useCurrencyRates('EUR'));

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.rate).toBe(1.1);
        expect(result.current.lastUpdated).toBe('2026-03-19');
    });

    it('handles fetch errors properly', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        const { result } = renderHook(() => useCurrencyRates('INVALID'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toMatch(/is not supported/);
        expect(result.current.rate).toBeNull();
    });
});
