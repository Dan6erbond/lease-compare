import { COUNTRIES, CURRENCY_STORAGE_KEY } from "../const";
import { ChevronDown, Globe } from "lucide-react";

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
        className={`
          /* 1. Trigger the customizable behavior */
          [appearance:base-select]

          /* 2. Style the dropdown (the 'popover') */
          [&::picker(select)]:p-2
          [&::picker(select)]:rounded-xl
          [&::picker(select)]:border
          [&::picker(select)]:border-slate-200
          [&::picker(select)]:shadow-xl
          [&::picker(select)]:bg-white

          /* 3. Basic select styles */
          bg-transparent border-none text-sm font-semibold text-slate-600 focus:ring-0 cursor-pointer outline-none
        `}
      >
        {COUNTRIES.map((c) => (
          <option
            key={c.code}
            value={c.code}
            className="p-2 rounded-lg hover:bg-slate-100 checked:bg-blue-50 checked:text-blue-600"
          >
            <div className="flex items-center justify-between min-w-45 gap-4">
              <div className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </div>
              <span className="text-[10px] font-mono opacity-50 uppercase bg-slate-100 px-1 rounded">
                {c.currency}
              </span>
            </div>
          </option>
        ))}
      </select>

      <ChevronDown className="text-slate-400" size={14} />
    </div>
  );
}
