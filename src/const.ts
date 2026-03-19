import type { CountryConfig } from "./types";

export const STORAGE_KEY = "car_leases_v2";
export const CURRENCY_STORAGE_KEY = "car_leases_currency";

export const COUNTRIES: CountryConfig[] = [
  {
    code: "CH",
    name: "Switzerland",
    currency: "CHF",
    locale: "de-CH",
    flag: "🇨🇭",
  },
  { code: "DE", name: "Germany", currency: "EUR", locale: "de-DE", flag: "🇩🇪" },
  { code: "US", name: "USA", currency: "USD", locale: "en-US", flag: "🇺🇸" },
  { code: "GB", name: "UK", currency: "GBP", locale: "en-GB", flag: "🇬🇧" },
  { code: "FR", name: "France", currency: "EUR", locale: "fr-FR", flag: "🇫🇷" },
  { code: "IT", name: "Italy", currency: "EUR", locale: "it-IT", flag: "🇮🇹" },
  { code: "AT", name: "Austria", currency: "EUR", locale: "de-AT", flag: "🇦🇹" },
];
