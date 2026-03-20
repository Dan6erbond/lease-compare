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
      className="group relative bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col"
    >
      {lease.imageUrl && (
        <div className="h-36 md:h-48 w-full overflow-hidden relative">
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
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 transition-all group-hover:text-indigo-600 hyphens-auto wrap-anywhere">
              {lease.name}
            </h3>
            {lease.listingUrl && (
              <a
                href={lease.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] md:text-xs text-indigo-500 hover:underline flex items-center gap-1"
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

        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2">
          <div className="relative group/monthly inline-block">
            <span
              className={`text-2xl md:text-3xl font-black cursor-help transition-colors ${
                lease.isBestMonthly ? "text-emerald-600" : "text-slate-900"
              }`}
            >
              {formatCurrency(lease.effectiveMonthlyPayment)}
            </span>

            <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/monthly:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/monthly:scale-100 uppercase tracking-wider">
              {lease.monthlyAsPercentOfPrice.toFixed(2)}% of List Price / mo
              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">/ month</span>
            <span className="md:hidden text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
              {lease.monthlyAsPercentOfPrice.toFixed(2)}% MSRP
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5 md:space-y-6 grow">
        <div className="flex flex-wrap gap-2">
          {lease.monthlyAsPercentOfPrice <= 1 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100 uppercase">
              <TrendingDown size={12} /> &lt; 1% MSRP/mo
            </div>
          )}
          {lease.residualPercent < 50 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
              <Info size={12} /> Low Residual (&lt;50%)
            </div>
          )}
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="space-y-1 relative group/interest">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
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
              <p className="md:hidden text-[8px] text-indigo-500 font-bold uppercase italic">
                Est.
              </p>
            )}
            <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/interest:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/interest:scale-100 uppercase">
              {lease.interestRate === null
                ? "Estimated based on payment"
                : "Fixed Rate"}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>

          <div className="space-y-1 relative group/residual">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Residual
            </p>
            <p
              className={`text-base md:text-lg font-bold ${lease.isBestResidual ? "text-emerald-600" : "text-slate-700"}`}
            >
              {formatPercent(lease.residualPercent / 100)}
            </p>
            <p className="md:hidden text-[8px] text-slate-400 font-bold uppercase">
              {formatCurrency(lease.residualValue)}
            </p>
            <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/residual:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/residual:scale-100 uppercase">
              Buyout: {formatCurrency(lease.residualValue)}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>

          {/* Down Payment Data Point */}
          <div className="space-y-1 relative group/down">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Down Pay.
            </p>
            <p
              className={`text-base md:text-lg font-bold ${
                lease.downPaymentPercent > 10
                  ? "text-red-600"
                  : lease.downPaymentPercent > 5
                    ? "text-amber-600"
                    : "text-slate-700"
              }`}
            >
              {lease.downPaymentPercent.toFixed(1)}%
            </p>
            <p className="md:hidden text-[8px] text-slate-400 font-bold uppercase">
              {formatCurrency(lease.downPayment || 0)}
            </p>
            <div className="hidden md:block absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/down:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800 scale-95 group-hover/down:scale-100 uppercase">
              Cash: {formatCurrency(lease.downPayment || 0)}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {lease.downPaymentPercent > 5 && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-3 ${
                lease.downPaymentPercent > 10
                  ? "bg-red-50 border-red-100 text-red-700"
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}
            >
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold leading-tight">
                  High Down Payment Warning
                </p>
                <p className="text-[10px] opacity-80 leading-tight">
                  Total loss risk: you could lose the full{" "}
                  {formatCurrency(lease.downPayment || 0)}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative group/dist">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cost / {selectedCountry.distanceUnit}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-slate-400" />
                  <span className="text-sm font-bold">
                    {formatCurrency(lease.costPerDistance)}
                  </span>
                </div>
                {lease.additionalDistanceCost && (
                  <span
                    className={`text-[10px] font-bold ${lease.isExcessiveDistanceCost ? "text-red-500" : "text-emerald-500"}`}
                  >
                    +{formatCurrency(lease.additionalDistanceCost)}
                  </span>
                )}
              </div>
              {lease.isExcessiveDistanceCost && (
                <div className="hidden md:block absolute top-full left-0 mt-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/dist:opacity-100 transition-opacity z-50 shadow-xl pointer-events-none">
                  Penalty is higher than base usage.{" "}
                  <strong>Negotiate higher limit.</strong>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Depreciation
              </p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">
                  {formatCurrency(lease.monthlyDepreciation)}
                </span>
                <span className="text-[10px] text-slate-400">/mo</span>
              </div>
              <div className="w-full bg-slate-200 h-1 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full"
                  style={{
                    width: `${Math.min(lease.depreciationPercentOfPayment, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
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
              With Buyout
            </span>
            <span
              className={`text-sm font-bold ${lease.isBestTotalWithBuyout ? "text-emerald-600" : "text-indigo-700"}`}
            >
              {formatCurrency(lease.totalWithBuyout)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {lease.isBestInterest && <Badge color="emerald">Best Rate</Badge>}
          {lease.isBestMonthly && <Badge color="blue">Lowest Monthly</Badge>}
          {lease.isBestTotalWithBuyout && (
            <Badge color="indigo">Best Overall</Badge>
          )}
          {lease.isBestResidual && <Badge color="amber">Cheapest Buyout</Badge>}

          {lease.monthlyAsPercentOfPrice > 1 &&
            lease.monthlyAsPercentOfPrice <= 2 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                <Info size={10} /> Standard Deal
              </div>
            )}
          {lease.monthlyAsPercentOfPrice >= 4 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100">
              <AlertTriangle size={10} /> Poor Value ({">"}4%)
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 bg-slate-50/50 border-t border-slate-50 mt-auto">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1">
            {lease.termMonths}M •{" "}
            {(lease.annualDistance || 10000).toLocaleString()}{" "}
            {selectedCountry.distanceUnit}/YR
          </span>
          <span className="text-slate-500">
            {formatCurrency(lease.price)}{" "}
            <span className="text-slate-300 ml-1">MSRP</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "emerald" | "blue" | "indigo" | "amber";
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-2 py-1 ${colors[color]} text-[10px] font-bold uppercase tracking-wider rounded-md`}
    >
      {children}
    </span>
  );
}
