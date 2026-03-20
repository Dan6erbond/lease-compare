import {
  AlertTriangle,
  Edit2,
  ExternalLink,
  Gauge,
  Info,
  Trash2,
  TrendingDown,
} from "lucide-react";

import { LeaseResult, type LeaseInput } from "../types";
import { motion } from "motion/react";
import { COUNTRIES, CURRENCY_STORAGE_KEY } from "../const";
import { useLocalStorage } from "usehooks-ts";
import { useMemo } from "react";

export default function LeaseCard({
  lease,
  onEdit,
  onDelete,
}: {
  lease: LeaseResult;
  onEdit(lease: LeaseInput): void;
  onDelete(leaseId: string): void;
}) {
  const [countryCode] = useLocalStorage<string>(CURRENCY_STORAGE_KEY, "CH");

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode],
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(selectedCountry.locale, {
      style: "currency",
      currency: selectedCountry.currency,
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return (val * 100).toFixed(2) + "%";
  };

  return (
    <motion.div
      key={lease.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden flex flex-col"
    >
      {lease.imageUrl && (
        <div className="h-32 md:h-48 w-full overflow-hidden relative">
          <img
            src={lease.imageUrl}
            alt={lease.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-4 md:p-6 border-b border-slate-50">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-0.5">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 transition-all group-hover:text-indigo-600 hyphens-auto wrap-anywhere leading-tight">
              {lease.name}
            </h3>
            {lease.listingUrl && (
              <a
                href={lease.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink size={10} /> View Listing
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(lease)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(lease.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="relative group/monthly inline-block">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl md:text-3xl font-black ${
                lease.isBestMonthly ? "text-emerald-600" : "text-slate-900"
              }`}
            >
              {formatCurrency(lease.effectiveMonthlyPayment)}
            </span>
            <span className="text-slate-400 text-xs font-medium">/ month</span>
          </div>

          <span className="block md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {lease.monthlyAsPercentOfPrice.toFixed(2)}% of MSRP
          </span>

          <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/monthly:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/monthly:scale-100 uppercase tracking-wider">
            {lease.monthlyAsPercentOfPrice.toFixed(2)}% of List Price / mo
            <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 grow">
        <div className="flex flex-wrap gap-2">
          {lease.monthlyAsPercentOfPrice <= 1 ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100 uppercase">
              <TrendingDown size={12} /> 1% MSRP/mo
            </div>
          ) : lease.monthlyAsPercentOfPrice >= 4 ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-bold border border-red-100 uppercase">
              <AlertTriangle size={12} /> Poor Value
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 uppercase">
              <Info size={12} /> Standard Deal
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-0.5 relative group/interest">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              Interest
              {lease.interestRate === null && (
                <Info size={10} className="text-indigo-400" />
              )}
            </p>
            <p
              className={`text-base md:text-lg font-bold ${lease.isBestInterest ? "text-emerald-600" : "text-slate-700"}`}
            >
              {formatPercent(lease.effectiveInterestRate)}
            </p>
            {lease.interestRate === null && (
              <p className="md:hidden text-[8px] text-indigo-500 font-bold uppercase tracking-tighter italic">
                Estimated
              </p>
            )}
            <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/interest:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/interest:scale-100 uppercase">
              {lease.interestRate === null
                ? "Estimated based on payment"
                : "Fixed Rate"}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>

          <div className="space-y-0.5 relative group/residual">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Residual
            </p>
            <p
              className={`text-base md:text-lg font-bold ${lease.isBestResidual ? "text-emerald-600" : "text-slate-700"}`}
            >
              {formatPercent(lease.residualPercent / 100)}
            </p>
            <p className="md:hidden text-[8px] text-slate-400 font-bold tracking-tighter uppercase">
              {formatCurrency(lease.residualValue)}
            </p>
            <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/residual:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/residual:scale-100">
              Buyout: {formatCurrency(lease.residualValue)}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {lease.downPaymentPercent > 5 && (
            <div
              className={`p-2 rounded-xl border flex items-center gap-2 ${
                lease.downPaymentPercent > 10
                  ? "bg-red-50 border-red-100 text-red-700"
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}
            >
              <AlertTriangle size={12} className="shrink-0" />
              <p className="text-[10px] font-bold leading-tight">
                High Down: {lease.downPaymentPercent.toFixed(1)}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 relative group/dist">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cost / {selectedCountry.distanceUnit}
              </p>
              <span className="text-sm font-bold block">
                {formatCurrency(lease.costPerDistance)}
              </span>
              {lease.isExcessiveDistanceCost && (
                <span className="md:hidden text-[8px] font-black text-red-500 uppercase">
                  High Penalty
                </span>
              )}
              <div className="hidden md:block absolute top-full left-0 mt-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/dist:opacity-100 transition-opacity z-50 shadow-xl pointer-events-none">
                {lease.isExcessiveDistanceCost
                  ? "Negotiate higher limit; penalty is high."
                  : "Standard distance cost."}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Depreciation
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold">
                  {formatCurrency(lease.monthlyDepreciation)}
                </span>
                <span className="text-[8px] text-slate-400 font-bold">/mo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-2 py-1.5 bg-slate-50 rounded-lg">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              Total Paid
            </span>
            <span
              className={`text-xs font-bold ${lease.isBestTotalPaid ? "text-emerald-600" : "text-slate-700"}`}
            >
              {formatCurrency(lease.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center px-2 py-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100/30">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
              With Buyout
            </span>
            <span
              className={`text-xs font-bold ${lease.isBestTotalWithBuyout ? "text-emerald-600" : "text-indigo-700"}`}
            >
              {formatCurrency(lease.totalWithBuyout)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-50 mt-auto">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <span>
            {lease.termMonths}M •{" "}
            {(lease.annualDistance || 10000).toLocaleString()}{" "}
            {selectedCountry.distanceUnit}/YR
          </span>
          <span>
            {formatCurrency(lease.price)}{" "}
            <span className="text-slate-300">LIST</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
