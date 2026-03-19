import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { Save, Share2, X } from "lucide-react";
import LZString from "lz-string";
import { AnimatePresence, motion } from "motion/react";
import type { LeaseInput } from "../types";
import { defaultLeaseInputValues } from "../const";

export default function Share({
  leases,
  setLeases,
}: {
  leases: LeaseInput[];
  setLeases: Dispatch<SetStateAction<LeaseInput[]>>;
}) {
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
      setLeases(
        sharedLeases.map((l) => ({ ...defaultLeaseInputValues, ...l })),
      ); // This will trigger your existing useEffect to save to localStorage
      setSharedLeases(null);
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={leases.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
      >
        <Share2 size={16} className="text-indigo-500" />
        Share Leases
      </button>

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
    </>
  );
}
