import { useState, useEffect, useCallback } from 'react';

interface ExchangeRateCache {
    base: string;
    rates: Record<string, number>;
    fetchedAt: number; // timestamp ms
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const rateCache = new Map<string, ExchangeRateCache>();

interface UseCurrencyRatesResult {
    /** Exchange rate from `fromCurrency` to USD. null while loading or on error. */
    rate: number | null;
    /** Whether the rate is currently being fetched */
    loading: boolean;
    /** Error message if the fetch failed */
    error: string | null;
    /** ISO date string of when the rate was last updated (from the API) */
    lastUpdated: string | null;
    /** Manually refresh the rate (bypasses cache) */
    refresh: () => void;
}

/**
 * Fetches the exchange rate from a given currency to USD using the Frankfurter API.
 * Results are cached in-memory for 1 hour.
 *
 * @param fromCurrency ISO 4217 currency code (e.g., "EUR", "GBP"). Pass "USD" or empty to skip fetching.
 */
export const useCurrencyRates = (fromCurrency: string): UseCurrencyRatesResult => {
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [forceRefreshCounter, setForceRefreshCounter] = useState(0);

    const normalizedCurrency = fromCurrency.toUpperCase().trim();
    const isUsd = normalizedCurrency === 'USD' || normalizedCurrency === '';

    const refresh = useCallback(() => {
        if (!isUsd) {
            rateCache.delete(normalizedCurrency);
            setForceRefreshCounter((c) => c + 1);
        }
    }, [isUsd, normalizedCurrency]);

    useEffect(() => {
        if (isUsd) {
            setRate(1);
            setLoading(false);
            setError(null);
            setLastUpdated(null);
            return;
        }

        // Check cache
        const cached = rateCache.get(normalizedCurrency);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            const usdRate = cached.rates['USD'];
            if (usdRate != null) {
                setRate(usdRate);
                setLoading(false);
                setError(null);
                setLastUpdated(new Date(cached.fetchedAt).toISOString());
                return;
            }
        }

        let cancelled = false;
        const fetchRate = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://api.frankfurter.app/latest?from=${normalizedCurrency}&to=USD`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Currency "${normalizedCurrency}" is not supported`);
                    }
                    throw new Error(`Failed to fetch exchange rate (${response.status})`);
                }

                const data = await response.json();
                const usdRate = data.rates?.USD;

                if (usdRate == null) {
                    throw new Error(`No USD rate found for ${normalizedCurrency}`);
                }

                // Cache the result
                rateCache.set(normalizedCurrency, {
                    base: normalizedCurrency,
                    rates: data.rates,
                    fetchedAt: Date.now(),
                });

                if (!cancelled) {
                    setRate(usdRate);
                    setLastUpdated(data.date ?? new Date().toISOString());
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch exchange rate');
                    setRate(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchRate();

        return () => {
            cancelled = true;
        };
    }, [normalizedCurrency, isUsd, forceRefreshCounter]);

    return { rate, loading, error, lastUpdated, refresh };
};
