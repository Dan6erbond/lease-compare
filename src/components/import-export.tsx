import { Download, Upload } from "lucide-react";

import React, { type Dispatch, type SetStateAction } from "react";
import type { LeaseInput } from "../types";

export default function ImportExport({
  leases,
  setLeases,
}: {
  leases: LeaseInput[];
  setLeases: Dispatch<SetStateAction<LeaseInput[]>>;
}) {
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

  return (
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
  );
}
