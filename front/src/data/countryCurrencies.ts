/**
 * Maps ISO 3166-1 alpha-2 country codes to their primary ISO 4217 currency code.
 * Covers the countries in the app's COUNTRIES list.
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    AF: 'AFN', AL: 'ALL', DZ: 'DZD', AD: 'EUR', AO: 'AOA',
    AG: 'XCD', AR: 'ARS', AM: 'AMD', AU: 'AUD', AT: 'EUR',
    AZ: 'AZN', BS: 'BSD', BH: 'BHD', BD: 'BDT', BB: 'BBD',
    BY: 'BYN', BE: 'EUR', BZ: 'BZD', BJ: 'XOF', BT: 'BTN',
    BO: 'BOB', BA: 'BAM', BW: 'BWP', BR: 'BRL', BN: 'BND',
    BG: 'BGN', BF: 'XOF', BI: 'BIF', CV: 'CVE', KH: 'KHR',
    CM: 'XAF', CA: 'CAD', CF: 'XAF', TD: 'XAF', CL: 'CLP',
    CN: 'CNY', CO: 'COP', KM: 'KMF', CG: 'XAF', CD: 'CDF',
    CR: 'CRC', CI: 'XOF', HR: 'EUR', CU: 'CUP', CY: 'EUR',
    CZ: 'CZK', DK: 'DKK', DJ: 'DJF', DM: 'XCD', DO: 'DOP',
    EC: 'USD', EG: 'EGP', SV: 'USD', GQ: 'XAF', ER: 'ERN',
    EE: 'EUR', SZ: 'SZL', ET: 'ETB', FJ: 'FJD', FI: 'EUR',
    FR: 'EUR', GA: 'XAF', GM: 'GMD', GE: 'GEL', DE: 'EUR',
    GH: 'GHS', GR: 'EUR', GD: 'XCD', GT: 'GTQ', GN: 'GNF',
    GW: 'XOF', GY: 'GYD', HT: 'HTG', HN: 'HNL', HU: 'HUF',
    IS: 'ISK', IN: 'INR', ID: 'IDR', IR: 'IRR', IQ: 'IQD',
    IE: 'EUR', IL: 'ILS', IT: 'EUR', JM: 'JMD', JP: 'JPY',
    JO: 'JOD', KZ: 'KZT', KE: 'KES', KI: 'AUD', KP: 'KPW',
    KR: 'KRW', KW: 'KWD', KG: 'KGS', LA: 'LAK', LV: 'EUR',
    LB: 'LBP', LS: 'LSL', LR: 'LRD', LY: 'LYD', LI: 'CHF',
    LT: 'EUR', LU: 'EUR', MG: 'MGA', MW: 'MWK', MY: 'MYR',
    MV: 'MVR', ML: 'XOF', MT: 'EUR', MH: 'USD', MR: 'MRU',
    MU: 'MUR', MX: 'MXN', FM: 'USD', MD: 'MDL', MC: 'EUR',
    MN: 'MNT', ME: 'EUR', MA: 'MAD', MZ: 'MZN', MM: 'MMK',
    NA: 'NAD', NR: 'AUD', NP: 'NPR', NL: 'EUR', NZ: 'NZD',
    NI: 'NIO', NE: 'XOF', NG: 'NGN', MK: 'MKD', NO: 'NOK',
    OM: 'OMR', PK: 'PKR', PW: 'USD', PS: 'ILS', PA: 'PAB',
    PG: 'PGK', PY: 'PYG', PE: 'PEN', PH: 'PHP', PL: 'PLN',
    PT: 'EUR', QA: 'QAR', RO: 'RON', RU: 'RUB', RW: 'RWF',
    KN: 'XCD', LC: 'XCD', VC: 'XCD', WS: 'WST', SM: 'EUR',
    ST: 'STN', SA: 'SAR', SN: 'XOF', RS: 'RSD', SC: 'SCR',
    SL: 'SLL', SG: 'SGD', SK: 'EUR', SI: 'EUR', SB: 'SBD',
    SO: 'SOS', ZA: 'ZAR', SS: 'SSP', ES: 'EUR', LK: 'LKR',
    SD: 'SDG', SR: 'SRD', SE: 'SEK', CH: 'CHF', SY: 'SYP',
    TW: 'TWD', TJ: 'TJS', TZ: 'TZS', TH: 'THB', TL: 'USD',
    TG: 'XOF', TO: 'TOP', TT: 'TTD', TN: 'TND', TR: 'TRY',
    TM: 'TMT', TV: 'AUD', UG: 'UGX', UA: 'UAH', AE: 'AED',
    GB: 'GBP', US: 'USD', UY: 'UYU', UZ: 'UZS', VU: 'VUV',
    VA: 'EUR', VE: 'VES', VN: 'VND', YE: 'YER', ZM: 'ZMW',
    ZW: 'ZWL',
};

/** Common currency display names */
export const CURRENCY_NAMES: Record<string, string> = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
    CNY: 'Chinese Yuan', KRW: 'South Korean Won', CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar', CHF: 'Swiss Franc', SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone', DKK: 'Danish Krone', NZD: 'New Zealand Dollar',
    SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar', MXN: 'Mexican Peso',
    BRL: 'Brazilian Real', INR: 'Indian Rupee', RUB: 'Russian Ruble',
    ZAR: 'South African Rand', TRY: 'Turkish Lira', PLN: 'Polish Zloty',
    CZK: 'Czech Koruna', HUF: 'Hungarian Forint', RON: 'Romanian Leu',
    BGN: 'Bulgarian Lev', ISK: 'Icelandic Króna', THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit', PHP: 'Philippine Peso', IDR: 'Indonesian Rupiah',
    ILS: 'Israeli Shekel', CLP: 'Chilean Peso', COP: 'Colombian Peso',
    PEN: 'Peruvian Sol', ARS: 'Argentine Peso', CRC: 'Costa Rican Colón',
    UYU: 'Uruguayan Peso', AED: 'UAE Dirham', SAR: 'Saudi Riyal',
    EGP: 'Egyptian Pound', NGN: 'Nigerian Naira', KES: 'Kenyan Shilling',
    GHS: 'Ghanaian Cedi', TWD: 'New Taiwan Dollar', VND: 'Vietnamese Dong',
};

/**
 * Returns a human-readable currency name, falling back to the code itself.
 */
export const getCurrencyName = (code: string): string =>
    CURRENCY_NAMES[code] ?? code;

/**
 * Returns the currency symbol for common currencies, or the code for others.
 */
export const getCurrencySymbol = (code: string): string => {
    try {
        // Use Intl to get the narrowSymbol (e.g., "$", "€", "£")
        const parts = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            currencyDisplay: 'narrowSymbol',
        }).formatToParts(0);
        const symbolPart = parts.find((p) => p.type === 'currency');
        return symbolPart?.value ?? code;
    } catch {
        return code;
    }
};
