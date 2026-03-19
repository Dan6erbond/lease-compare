import { Calculator, Car } from "lucide-react";
import { LeaseInput, LeaseResult } from "./types";
import { calculateIRR, calculateMonthlyPayment } from "./utils/calculations";
import { useEffect, useMemo, useState } from "react";

import AISummary from "./components/ai-summary";
import { AnimatePresence } from "motion/react";
import CountrySelect from "./components/country-select";
import ImportExport from "./components/import-export";
import LeaseCard from "./components/lease-card";
import LeaseForm from "./components/lease-form";
import { STORAGE_KEY } from "./const";
import Share from "./components/share";

export default function App() {
  const [leases, setLeases] = useState<LeaseInput[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState<Omit<LeaseInput, "id">>({
    name: "",
    price: 0,
    downPayment: 0,
    monthlyPayment: null,
    termMonths: 36,
    residualValue: 0,
    interestRate: null,
    listingUrl: "",
    imageUrl: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leases));
  }, [leases]);

  const computedResults = useMemo(() => {
    const results: LeaseResult[] = leases.map((lease) => {
      let effectiveMonthly = lease.monthlyPayment || 0;
      let effectiveInterest = (lease.interestRate || 0) / 100;

      // If interest rate is provided but monthly is not, calculate monthly
      if (lease.interestRate !== null && lease.monthlyPayment === null) {
        const monthlyRate = lease.interestRate / 100 / 12;
        effectiveMonthly = calculateMonthlyPayment({
          price: lease.price,
          downPayment: lease.downPayment,
          residualValue: lease.residualValue,
          termMonths: lease.termMonths,
          monthlyRate,
        });
      }

      // Calculate IRR (Interest Rate) if monthly is provided (or was just calculated)
      const netPrice = lease.price - lease.downPayment;
      const irrCashflows = [netPrice];
      for (let i = 0; i < lease.termMonths; i++) {
        irrCashflows.push(-effectiveMonthly);
      }
      irrCashflows[irrCashflows.length - 1] -= lease.residualValue;

      const irr = calculateIRR(irrCashflows);
      const calculatedAnnual =
        irr !== null ? Math.pow(1 + irr, 12) - 1 : effectiveInterest;

      effectiveInterest = calculatedAnnual;

      const totalPaid = lease.downPayment + effectiveMonthly * lease.termMonths;
      const totalWithBuyout = totalPaid + lease.residualValue;
      const residualPercent =
        lease.price > 0 ? (lease.residualValue / lease.price) * 100 : 0;

      return {
        ...lease,
        effectiveMonthlyPayment: effectiveMonthly,
        effectiveInterestRate: effectiveInterest,
        totalPaid,
        totalWithBuyout,
        residualPercent,
        isBestMonthly: false,
        isBestInterest: false,
        isBestTotalPaid: false,
        isBestTotalWithBuyout: false,
        isBestResidual: false,
      };
    });

    // Find bests
    if (results.length > 0) {
      const minMonthly = Math.min(
        ...results.map((r) => r.effectiveMonthlyPayment),
      );
      const minInterest = Math.min(
        ...results.map((r) => r.effectiveInterestRate),
      );
      const minTotalPaid = Math.min(...results.map((r) => r.totalPaid));
      const minTotalWithBuyout = Math.min(
        ...results.map((r) => r.totalWithBuyout),
      );
      const minResidual = Math.min(...results.map((r) => r.residualPercent));

      results.forEach((r) => {
        r.isBestMonthly = r.effectiveMonthlyPayment === minMonthly;
        r.isBestInterest = r.effectiveInterestRate === minInterest;
        r.isBestTotalPaid = r.totalPaid === minTotalPaid;
        r.isBestTotalWithBuyout = r.totalWithBuyout === minTotalWithBuyout;
        r.isBestResidual = r.residualPercent === minResidual;
      });
    }

    return results;
  }, [leases]);

  const handleEdit = (lease: LeaseInput) => {
    setForm({ ...lease });
    setEditingId(lease.id);
  };

  const handleDelete = (id: string) => {
    setLeases((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              LeaseCompare
            </h1>
            <p className="text-slate-500">
              Analyze and compare car leasing offers side-by-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ImportExport leases={leases} setLeases={setLeases} />

            <Share leases={leases} setLeases={setLeases} />

            <CountrySelect />

            <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-2xl shadow-sm border border-slate-200">
              <Calculator className="text-indigo-600" size={16} />
              <span className="text-sm font-medium text-slate-600">
                {leases.length} Offers
              </span>
            </div>
          </div>
        </header>

        <LeaseForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          setEditingId={setEditingId}
          setLeases={setLeases}
        />

        {/* AI Summary Section */}
        <AISummary computedResults={computedResults} />

        {/* Results Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {computedResults.map((lease) => (
              <LeaseCard
                key={lease.id}
                lease={lease}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </section>

        {leases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 space-y-4">
            <Car size={64} strokeWidth={1} />
            <p className="text-lg font-medium">No lease offers added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
