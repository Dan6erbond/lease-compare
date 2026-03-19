import type { CountryConfig, LeaseInput } from "./types";

export const STORAGE_KEY = "car_leases_v2";
export const CURRENCY_STORAGE_KEY = "car_leases_currency";

export const COUNTRIES: CountryConfig[] = [
  {
    code: "CH",
    name: "Switzerland",
    currency: "CHF",
    locale: "de-CH",
    flag: "🇨🇭",
    distanceUnit: "km",
  },
  {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    locale: "de-DE",
    flag: "🇩🇪",
    distanceUnit: "km",
  },
  {
    code: "US",
    name: "USA",
    currency: "USD",
    locale: "en-US",
    flag: "🇺🇸",
    distanceUnit: "mi",
  },
  {
    code: "GB",
    name: "UK",
    currency: "GBP",
    locale: "en-GB",
    flag: "🇬🇧",
    distanceUnit: "mi",
  },
  {
    code: "FR",
    name: "France",
    currency: "EUR",
    locale: "fr-FR",
    flag: "🇫🇷",
    distanceUnit: "km",
  },
  {
    code: "IT",
    name: "Italy",
    currency: "EUR",
    locale: "it-IT",
    flag: "🇮🇹",
    distanceUnit: "km",
  },
  {
    code: "AT",
    name: "Austria",
    currency: "EUR",
    locale: "de-AT",
    flag: "🇦🇹",
    distanceUnit: "km",
  },
];

export const defaultLeaseInputValues: Omit<LeaseInput, "id"> = {
  name: "",
  price: 0,
  downPayment: 0,
  monthlyPayment: null,
  termMonths: 36,
  residualValue: 0,
  interestRate: null,
  listingUrl: "",
  imageUrl: "",
  annualDistance: 10000,
};
