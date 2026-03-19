import { AnimatePresence, motion } from "motion/react";
import { COUNTRIES, CURRENCY_STORAGE_KEY } from "../const";
import { Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { GoogleGenAI } from "@google/genai";
import { LeaseResult } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocalStorage } from "usehooks-ts";

export default function AISummary({
  computedResults,
}: {
  computedResults: LeaseResult[];
}) {
  const [countryCode] = useLocalStorage<string>(CURRENCY_STORAGE_KEY, "CH");

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode],
  );

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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

  return (
    computedResults.length > 1 && (
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
            {aiSummary ? "Regenerate Summary" : "Generate Comparison Summary"}
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
    )
  );
}
