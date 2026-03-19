import {
  AlertCircle,
  Calculator,
  Calendar,
  Car,
  CheckCircle2,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Loader2,
  Percent,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2,
  TrendingDown,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { LeaseInput, LeaseResult } from "./types";
import React, { useEffect, useMemo, useState } from "react";
import { calculateIRR, calculateMonthlyPayment } from "./utils/calculations";

import { GoogleGenAI } from "@google/genai";
import LZString from "lz-string";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STORAGE_KEY = "car_leases_v2";
const CURRENCY_STORAGE_KEY = "car_leases_currency";

interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  locale: string;
  flag: string;
}

const COUNTRIES: CountryConfig[] = [
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

export default function App() {
  const [leases, setLeases] = useState<LeaseInput[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [countryCode, setCountryCode] = useState<string>(() => {
    return localStorage.getItem(CURRENCY_STORAGE_KEY) || "CH";
  });

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode],
  );

  useEffect(() => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, countryCode);
  }, [countryCode]);

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
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    setForm({
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
  };

  const handleEdit = (lease: LeaseInput) => {
    setForm({ ...lease });
    setEditingId(lease.id);
  };

  const handleDelete = (id: string) => {
    setLeases((prev) => prev.filter((l) => l.id !== id));
  };

  const generateAiSummary = async () => {
    if (computedResults.length === 0) return;
    setIsGeneratingAi(true);
    setAiSummary(null);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Compare these car lease options in ${selectedCountry.name} (Currency: ${selectedCountry.currency}) and provide a professional summary.
        Highlight which one is the best financial value, which has the lowest monthly cost, and any potential red flags (like high effective interest rates).

        Crucially, perform a "Value for Money" analysis by looking at the Offer Name. If a car has a higher price or payment but the name suggests it is a premium trim or has many options (e.g., "Sport", "Sky", "Sabelt", "Speciale", "BEV", "Performance", "Luxury"), acknowledge that the user is getting "more car" for their money. Don't just penalize higher costs if the trim justifies it.

        Keep it concise but insightful.

        Data: ${JSON.stringify(
          computedResults.map((r) => ({
            name: r.name,
            monthly: r.effectiveMonthlyPayment,
            interest: r.effectiveInterestRate * 100,
            totalWithBuyout: r.totalWithBuyout,
            residualPercent: r.residualPercent,
            term: r.termMonths,
          })),
        )}`,
      });

      const response = await model;
      setAiSummary(response.text);
    } catch (error) {
      console.error("AI Generation Error:", error);
      setAiSummary("Failed to generate AI summary. Please check your API key.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(leases, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `lease-compare-export-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Basic validation: ensure imported items have an id or name
          const validLeases = json.filter((item) => item.name && item.price);
          setLeases((prev) => [...prev, ...validLeases]);
          alert(`Successfully imported ${validLeases.length} offers!`);
        }
      } catch (error) {
        alert(
          "Failed to parse the JSON file. Please ensure it's a valid export.",
        );
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(selectedCountry.locale, {
      style: "currency",
      currency: selectedCountry.currency,
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return (val * 100).toFixed(2) + "%";
  };

  // 1. Check for shared data on mount
  const [sharedLeases, setSharedLeases] = useState<LeaseInput[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");

    if (dataParam) {
      try {
        const decompressed =
          LZString.decompressFromEncodedURIComponent(dataParam);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          if (Array.isArray(parsed)) setSharedLeases(parsed);
        }
      } catch (e) {
        console.error("Failed to parse shared data", e);
      }
    }
  }, []);

  // 2. Generate Share Link
  const handleShare = async () => {
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(leases),
    );
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${compressed}`;

    const shareData = {
      title: "My Car Lease Comparisons",
      text: `Check out these ${leases.length} car lease offers I've analyzed!`,
      url: shareUrl,
    };

    try {
      // Check if the browser supports the Web Share API
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for Desktop/Unsupported browsers
        await navigator.clipboard.writeText(shareUrl);
        alert("Share link copied to clipboard!");
      }
    } catch (error) {
      // Handle cases where user cancels the share sheet or it fails
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
        // Final fallback to clipboard if share sheet fails
        navigator.clipboard.writeText(shareUrl);
      }
    }
  };

  // 3. Import shared data to LocalStorage
  const acceptSharedData = () => {
    if (sharedLeases) {
      setLeases(sharedLeases); // This will trigger your existing useEffect to save to localStorage
      setSharedLeases(null);
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* 4. Shared Data Banner */}
      <AnimatePresence>
        {sharedLeases && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 bg-indigo-600 text-white shadow-2xl"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 size={20} />
                <p className="font-medium text-sm md:text-base">
                  Someone shared {sharedLeases.length} lease offers with you!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={acceptSharedData}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                >
                  <Save size={16} /> Import & Sync
                </button>
                <button
                  onClick={() => {
                    setSharedLeases(null);
                    window.history.replaceState(
                      {},
                      document.title,
                      window.location.pathname,
                    );
                  }}
                  className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* 3. Add the New Buttons here */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              <button
                onClick={handleExport}
                title="Export to JSON"
                className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className="w-px h-4 bg-slate-200" />
              <label className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer">
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleShare}
              disabled={leases.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <Share2 size={16} className="text-indigo-500" />
              Share Leases
            </button>

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
            <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-2xl shadow-sm border border-slate-200">
              <Calculator className="text-indigo-600" size={16} />
              <span className="text-sm font-medium text-slate-600">
                {leases.length} Offers
              </span>
            </div>
          </div>
        </header>

        {/* Input Form */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
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
                onChange={(e) =>
                  setForm({ ...form, listingUrl: e.target.value })
                }
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
              <strong>Monthly Payment</strong>. The app will automatically
              calculate the missing value. You can also add a photo and listing
              link for better tracking.
            </p>
          </div>
        </section>

        {/* AI Summary Section */}
        {computedResults.length > 1 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-indigo-500" /> AI Insights
              </h2>
              <button
                onClick={generateAiSummary}
                disabled={isGeneratingAi}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                {aiSummary
                  ? "Regenerate Summary"
                  : "Generate Comparison Summary"}
              </button>
            </div>

            <AnimatePresence>
              {aiSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-indigo-900 text-indigo-50 p-6 rounded-3xl shadow-xl shadow-indigo-200/20 relative overflow-hidden"
                >
                  <div className="relative z-10 prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-indigo-200 prose-table:text-sm prose-th:text-indigo-200 prose-td:text-indigo-50/80">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiSummary}
                    </ReactMarkdown>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles size={120} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Results Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {computedResults.map((lease) => (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 border-b border-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800 transition-all group-hover:text-indigo-600 break-all">
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
                        onClick={() => handleEdit(lease)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lease.id)}
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
                    <span className="text-slate-400 text-sm font-medium">
                      / month
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6 flex-grow">
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
