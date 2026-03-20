import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Image as ImageIcon,
  Percent,
  Plus,
  TrendingDown,
} from "lucide-react";
import {
  COUNTRIES,
  CURRENCY_STORAGE_KEY,
  defaultLeaseInputValues,
} from "../const";
import React, { useEffect, useMemo, useState } from "react";

import { LeaseInput } from "../types";
import { useLocalStorage } from "usehooks-ts";

const LeaseForm = React.forwardRef<
  HTMLElement,
  {
    form: Omit<LeaseInput, "id">;
    setForm: React.Dispatch<React.SetStateAction<Omit<LeaseInput, "id">>>;
    setLeases: React.Dispatch<React.SetStateAction<LeaseInput[]>>;
    editingId: string | null;
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  }
>(({ form, setForm, setLeases, editingId, setEditingId }, ref) => {
  const [countryCode] = useLocalStorage<string>(CURRENCY_STORAGE_KEY, "CH");
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if we start editing
  useEffect(() => {
    if (editingId) setIsExpanded(true);
  }, [editingId, setIsExpanded]);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode],
  );

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) return;

    if (form.interestRate === null && form.monthlyPayment === null) {
      alert("Please provide either an Interest Rate or a Monthly Payment.");
      return;
    }

    if (editingId) {
      setLeases((prev) =>
        prev.map((l) => (l.id === editingId ? { ...form, id: editingId } : l)),
      );
      setEditingId(null);
    } else {
      setLeases((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
    }

    setForm(defaultLeaseInputValues);
    setIsExpanded(false); // Collapse after adding
  };

  return (
    <section
      className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300"
      ref={ref}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            {editingId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
          </div>
          <div className="text-left">
            <h2 className="text-sm md:text-base font-bold text-slate-800">
              {editingId ? "Update Lease Offer" : "Add New Lease Offer"}
            </h2>
            {!isExpanded && (
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                Click to expand and enter details
              </p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {/* Form Content */}
      <div
        className={`${isExpanded ? "block" : "hidden"} p-4 md:p-8 pt-0 border-t border-slate-50`}
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-4"
        >
          {/* Offer Name - Span 2 on mobile to make it readable */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Car size={12} /> Offer Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tesla Model 3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <DollarSign size={12} /> List Price
            </label>
            <input
              type="number"
              required
              placeholder="0"
              value={form.price || ""}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingDown size={12} /> Down Payment
            </label>
            <input
              type="number"
              placeholder="0"
              value={form.downPayment || ""}
              onChange={(e) =>
                setForm({ ...form, downPayment: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar size={12} /> Term
            </label>
            <input
              type="number"
              required
              placeholder="36"
              value={form.termMonths || ""}
              onChange={(e) =>
                setForm({ ...form, termMonths: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 leading-none h-3">
              Distance ({selectedCountry.distanceUnit})
            </label>
            <input
              type="number"
              value={form.annualDistance || ""}
              onChange={(e) =>
                setForm({ ...form, annualDistance: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Percent size={12} /> Residual
            </label>
            <input
              type="number"
              required
              value={form.residualValue || ""}
              onChange={(e) =>
                setForm({ ...form, residualValue: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Percent size={12} /> Interest (%)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Auto"
              value={form.interestRate === null ? "" : form.interestRate}
              onChange={(e) =>
                setForm({
                  ...form,
                  interestRate:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <DollarSign size={12} /> Monthly
            </label>
            <input
              type="number"
              placeholder="Auto"
              value={form.monthlyPayment === null ? "" : form.monthlyPayment}
              onChange={(e) =>
                setForm({
                  ...form,
                  monthlyPayment:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* URLs - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon size={12} /> Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={form.imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
            >
              {editingId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
              {editingId ? "Update" : "Add Offer"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-start gap-2 p-3 bg-indigo-50 rounded-xl text-indigo-700 text-[11px]">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p>
            Enter <strong>Interest</strong> OR <strong>Monthly</strong> to
            calculate the other.
          </p>
        </div>
      </div>
    </section>
  );
});

export default LeaseForm;
