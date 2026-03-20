import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Gauge,
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
import React, { useMemo } from "react";

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

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode],
  );

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) return;

    // Validation: At least one of interestRate or monthlyPayment must be provided
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
  };

  return (
    <section
      className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8"
      ref={ref}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Car size={14} /> Offer Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Tesla Model 3 Performance"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <DollarSign size={14} /> List Price
          </label>
          <input
            type="number"
            required
            placeholder="0.00"
            value={form.price || ""}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <TrendingDown size={14} /> Down Payment
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={form.downPayment || ""}
            onChange={(e) =>
              setForm({ ...form, downPayment: Number(e.target.value) })
            }
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={14} /> Term (Months)
          </label>
          <input
            type="number"
            required
            placeholder="36"
            value={form.termMonths || ""}
            onChange={(e) =>
              setForm({ ...form, termMonths: Number(e.target.value) })
            }
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Gauge size={14} className="text-indigo-500" /> Annual Distance
            </span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">
              {selectedCountry.distanceUnit}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder={
                selectedCountry.distanceUnit === "km" ? "10000" : "6000"
              }
              value={form.annualDistance || ""}
              onChange={(e) =>
                setForm({ ...form, annualDistance: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold pointer-events-none uppercase">
              {selectedCountry.distanceUnit}/yr
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <DollarSign size={14} /> Extra Distance Cost
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              placeholder="0.25"
              value={
                form.additionalDistanceCost === null
                  ? ""
                  : form.additionalDistanceCost
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  additionalDistanceCost:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
              /{selectedCountry.distanceUnit}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Percent size={14} /> Residual Value
          </label>
          <input
            type="number"
            required
            placeholder="0.00"
            value={form.residualValue || ""}
            onChange={(e) =>
              setForm({ ...form, residualValue: Number(e.target.value) })
            }
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Percent size={14} /> Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Calculated if empty"
            value={form.interestRate === null ? "" : form.interestRate}
            onChange={(e) =>
              setForm({
                ...form,
                interestRate:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <DollarSign size={14} /> Monthly Payment
          </label>
          <input
            type="number"
            placeholder="Calculated if empty"
            value={form.monthlyPayment === null ? "" : form.monthlyPayment}
            onChange={(e) =>
              setForm({
                ...form,
                monthlyPayment:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ExternalLink size={14} /> Listing URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={form.listingUrl || ""}
            onChange={(e) => setForm({ ...form, listingUrl: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ImageIcon size={14} /> Photo URL
          </label>
          <input
            type="url"
            placeholder="https://.../image.jpg"
            value={form.imageUrl || ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-end lg:col-span-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            data-umami-event={editingId ? "update_offer" : "add_offer"}
            data-umami-event-id={editingId || undefined}
          >
            {editingId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
            {editingId ? "Update Offer" : "Add Offer"}
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl text-indigo-700 text-sm">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p>
          Provide either the <strong>Interest Rate</strong> or the{" "}
          <strong>Monthly Payment</strong>. The app will automatically calculate
          the missing value. You can also add a photo and listing link for
          better tracking.
        </p>
      </div>
    </section>
  );
});

export default LeaseForm;
