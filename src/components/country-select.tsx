import { COUNTRIES, CURRENCY_STORAGE_KEY } from "../const";

import { Globe } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

export default function CountrySelect() {
  const [countryCode, setCountryCode] = useLocalStorage<string>(
    CURRENCY_STORAGE_KEY,
    "CH",
  );

  return (
    <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-2xl shadow-sm border border-slate-200">
      <Globe className="text-slate-400" size={16} />
      <select
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
        className="bg-transparent border-none text-sm font-semibold text-slate-600 focus:ring-0 cursor-pointer outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name} ({c.currency})
          </option>
        ))}
      </select>
    </div>
  );
}
