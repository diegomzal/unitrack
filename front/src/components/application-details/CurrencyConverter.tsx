import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Autocomplete,
    IconButton,
    Tooltip,
    CircularProgress,
    Collapse,
    Alert,
} from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useCurrencyRates } from '../../hooks/useCurrencyRates';
import {
    COUNTRY_CURRENCY_MAP,
    getCurrencyName,
    getCurrencySymbol,
} from '../../data/countryCurrencies';

/** Subset of currencies supported by Frankfurter API (ECB rates) */
const SUPPORTED_CURRENCIES = [
    'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK',
    'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK',
    'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN',
    'RON', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR',
];

interface CurrencyOption {
    code: string;
    label: string;
    symbol: string;
}

const currencyOptions: CurrencyOption[] = SUPPORTED_CURRENCIES.map((code) => ({
    code,
    label: `${code} – ${getCurrencyName(code)}`,
    symbol: getCurrencySymbol(code),
}));

interface CurrencyConverterProps {
    /** ISO country code of the program / university */
    countryCode: string;
    /** Total annual cost in USD to display as reference */
    totalAnnualUsd: number;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
    countryCode,
    totalAnnualUsd,
}) => {
    const [expanded, setExpanded] = useState(false);

    // Auto-detect currency from country
    const detectedCurrency = countryCode ? COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] : undefined;
    const defaultCurrency = detectedCurrency && SUPPORTED_CURRENCIES.includes(detectedCurrency)
        ? detectedCurrency
        : 'EUR';

    const fallbackOption = currencyOptions.find((o) => o.code === 'EUR')!;

    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(
        currencyOptions.find((o) => o.code === defaultCurrency) ?? fallbackOption
    );

    // Sync when country changes
    useEffect(() => {
        if (detectedCurrency && SUPPORTED_CURRENCIES.includes(detectedCurrency)) {
            const option = currencyOptions.find((o) => o.code === detectedCurrency);
            if (option) setSelectedCurrency(option);
        }
    }, [detectedCurrency]);

    const currencyCode = selectedCurrency.code;
    const { rate, loading, error, lastUpdated, refresh } = useCurrencyRates(currencyCode);

    // Inverse rate: how many units of foreign currency per 1 USD
    const inverseRate = rate != null && rate > 0 ? 1 / rate : null;

    const [localAmount, setLocalAmount] = useState<string>('');
    const [usdAmount, setUsdAmount] = useState<string>('');
    const [activeField, setActiveField] = useState<'local' | 'usd' | null>(null);

    // Convert local → USD
    useEffect(() => {
        if (activeField !== 'local' || rate == null) return;
        if (localAmount === '') {
            setUsdAmount('');
            return;
        }
        const num = parseFloat(localAmount);
        if (!isNaN(num)) {
            setUsdAmount((num * rate).toFixed(2));
        }
    }, [localAmount, rate, activeField]);

    // Convert USD → local
    useEffect(() => {
        if (activeField !== 'usd' || inverseRate == null) return;
        if (usdAmount === '') {
            setLocalAmount('');
            return;
        }
        const num = parseFloat(usdAmount);
        if (!isNaN(num)) {
            setLocalAmount((num * inverseRate).toFixed(2));
        }
    }, [usdAmount, inverseRate, activeField]);

    // Also convert the total annual cost to the selected currency for reference
    const totalInLocal = useMemo(() => {
        if (inverseRate == null || totalAnnualUsd === 0) return null;
        return totalAnnualUsd * inverseRate;
    }, [inverseRate, totalAnnualUsd]);

    const formatLocal = (value: number): string => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        } catch {
            return `${getCurrencySymbol(currencyCode)}${value.toFixed(0)}`;
        }
    };

    return (
        <Box
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
            }}
        >
            {/* Header toggle */}
            <Box
                onClick={() => setExpanded((prev) => !prev)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                }}
            >
                <CurrencyExchangeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
                    Currency Converter
                </Typography>
                {totalInLocal != null && !expanded && (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        ≈ {formatLocal(totalInLocal)}/yr
                    </Typography>
                )}
                {expanded ? (
                    <ExpandLessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                ) : (
                    <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                )}
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Currency selector */}
                    <Autocomplete
                        size="small"
                        value={selectedCurrency}
                        onChange={(_e, newVal) => {
                            if (newVal) {
                                setSelectedCurrency(newVal);
                                setLocalAmount('');
                                setUsdAmount('');
                                setActiveField(null);
                            }
                        }}
                        options={currencyOptions}
                        getOptionLabel={(o) => o.label}
                        isOptionEqualToValue={(a, b) => a.code === b.code}
                        disableClearable
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Currency"
                                placeholder="Select currency"
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...rest } = props;
                            return (
                                <li key={key} {...rest}>
                                    <Typography variant="body2">
                                        <strong>{option.code}</strong>{' '}
                                        <Typography component="span" variant="body2" color="text.secondary">
                                            – {getCurrencyName(option.code)}
                                        </Typography>
                                    </Typography>
                                </li>
                            );
                        }}
                    />

                    {/* Exchange rate display */}
                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="caption" color="text.secondary">
                                Fetching exchange rate…
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.75rem' }}>
                            {error}
                        </Alert>
                    )}

                    {rate != null && !loading && (
                        <>
                            {/* Rate info */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    1 {currencyCode} = <strong>{rate.toFixed(4)}</strong> USD
                                </Typography>
                                <Tooltip title="Refresh rate">
                                    <IconButton size="small" onClick={refresh}>
                                        <RefreshIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {lastUpdated && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: -1, px: 0.5 }}>
                                    Source: ECB via Frankfurter · Rates from {lastUpdated}
                                </Typography>
                            )}

                            {/* Conversion inputs */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    size="small"
                                    label={`Amount in ${currencyCode}`}
                                    type="number"
                                    value={localAmount}
                                    onChange={(e) => {
                                        setActiveField('local');
                                        setLocalAmount(e.target.value);
                                    }}
                                    onFocus={() => setActiveField('local')}
                                    placeholder="0"
                                    fullWidth
                                    slotProps={{
                                        htmlInput: { min: 0, step: 100 },
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    {getCurrencySymbol(currencyCode)}
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />

                                <SwapHorizIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />

                                <TextField
                                    size="small"
                                    label="Amount in USD"
                                    type="number"
                                    value={usdAmount}
                                    onChange={(e) => {
                                        setActiveField('usd');
                                        setUsdAmount(e.target.value);
                                    }}
                                    onFocus={() => setActiveField('usd')}
                                    placeholder="0"
                                    fullWidth
                                    slotProps={{
                                        htmlInput: { min: 0, step: 100 },
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">$</InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            {/* Quick reference: total annual in local currency */}
                            {totalInLocal != null && totalAnnualUsd > 0 && (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
                                        border: '1px solid',
                                        borderColor: 'rgba(16, 185, 129, 0.15)',
                                    }}
                                >
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Total Annual Cost in {currencyCode}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', lineHeight: 1.3 }}>
                                        ≈ {formatLocal(totalInLocal)}
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                            / year
                                        </Typography>
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

export default CurrencyConverter;
