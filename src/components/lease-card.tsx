import { Edit2, ExternalLink, Trash2 } from "lucide-react";

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
      className="group relative bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col"
    >
      {/* Image Preview */}
      {lease.imageUrl && (
        <div className="h-48 w-full overflow-hidden relative">
          <img
            src={lease.imageUrl}
            alt={lease.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Card Header */}
      <div className="p-6 border-b border-slate-50">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800 transition-all group-hover:text-indigo-600 wrap-break-word hyphens-auto">
              {lease.name}
            </h3>
            {lease.listingUrl && (
              <a
                href={lease.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
              >
                <ExternalLink size={10} /> View Listing
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(lease)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(lease.id)}
              className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-black ${lease.isBestMonthly ? "text-emerald-600" : "text-slate-900"}`}
          >
            {formatCurrency(lease.effectiveMonthlyPayment)}
          </span>
          <span className="text-slate-400 text-sm font-medium">/ month</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-6 grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Effective Interest
            </p>
            <p
              className={`text-lg font-bold ${lease.isBestInterest ? "text-emerald-600" : "text-slate-700"}`}
            >
              {formatPercent(lease.effectiveInterestRate)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Residual Value
            </p>
            <div className="relative group/residual inline-block">
              <p
                className={`text-lg font-bold cursor-help ${lease.isBestResidual ? "text-emerald-600" : "text-slate-700"}`}
              >
                {formatPercent(lease.residualPercent / 100)}
              </p>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover/residual:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/residual:scale-100">
                {formatCurrency(lease.residualValue)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <span className="text-sm font-medium text-slate-500">
              Total Payments
            </span>
            <span
              className={`text-sm font-bold ${lease.isBestTotalPaid ? "text-emerald-600" : "text-slate-700"}`}
            >
              {formatCurrency(lease.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
            <span className="text-sm font-medium text-indigo-600">
              Total with Buyout
            </span>
            <span
              className={`text-sm font-bold ${lease.isBestTotalWithBuyout ? "text-emerald-600" : "text-indigo-700"}`}
            >
              {formatCurrency(lease.totalWithBuyout)}
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2">
          {lease.isBestInterest && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Best Rate
            </span>
          )}
          {lease.isBestMonthly && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Lowest Monthly
            </span>
          )}
          {lease.isBestTotalWithBuyout && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Best Overall
            </span>
          )}
          {lease.isBestResidual && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Cheapest Buyout
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 mt-auto">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>{lease.termMonths} Months</span>
          <span>{formatCurrency(lease.price)} List</span>
        </div>
      </div>
    </motion.div>
  );
}
