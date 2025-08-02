"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import SmartSuggestions from "@/components/SmartSuggestions";
import { Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  const [options, setOptions] = useState({
    removeEmptyRows: false,
    removeDuplicates: false,
    removeNullColumns: false,
    replaceMissing: false,
    normalize: false,
    encodeCategorical: false,
    analyze: false,
    exportTrash: false,
    exportFormat: "xlsx",
    generateGraph: false,
    suggestColumns: false,
    addNewdataHeader: true,
  });

  const [subOptions, setSubOptions] = useState({
    removeEmptyRowsStrict: false,
    replaceMissingWith: "mean",
    normalizeMethod: "zscore",
    graphType: "bar",
    exportStats: false,
    exportStatsFormat: "xlsx",
  });

  const toggleOption = (key: string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof options],
    }));
  };

  const handleSubOptionChange = (
    key: string,
    value: string | boolean
  ): void => {
    setSubOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setResultUrl("");

    const formData = new FormData();
    formData.append("file", file);

    Object.entries(options).forEach(([key, value]) =>
      formData.append(key, String(value))
    );
    Object.entries(subOptions).forEach(([key, value]) =>
      formData.append(key, String(value))
    );

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const blob = await res.blob();

      if (res.ok) {
        const url = window.URL.createObjectURL(blob);
        setResultUrl(url);
        setMessage("Processing complete. Click to download.");
      } else {
        setMessage("Error processing file.");
      }
    } catch (err) {
      setMessage("Failed to process the file.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Upload & Analyze</h1>
        <div className="flex items-center gap-3">
          {session?.user?.email && (
            <span className="text-sm text-gray-500">
              Logged in as {session.user.email}
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-xl shadow-md bg-white">
        <div>
          <h2 className="font-semibold mb-2">🧹 Cleaning</h2>
          <Checkbox
            label="Remove Empty Rows"
            checked={options.removeEmptyRows}
            onChange={() => toggleOption("removeEmptyRows")}
          />
          {options.removeEmptyRows && (
            <Checkbox
              label="Strict Mode"
              checked={subOptions.removeEmptyRowsStrict}
              onChange={() =>
                handleSubOptionChange(
                  "removeEmptyRowsStrict",
                  !subOptions.removeEmptyRowsStrict
                )
              }
              className="ml-6"
            />
          )}

          <Checkbox
            label="Remove Duplicates"
            checked={options.removeDuplicates}
            onChange={() => toggleOption("removeDuplicates")}
          />

          <Checkbox
            label="Remove Null Columns"
            checked={options.removeNullColumns}
            onChange={() => toggleOption("removeNullColumns")}
          />

          <Checkbox
            label="Replace Missing Values"
            checked={options.replaceMissing}
            onChange={() => toggleOption("replaceMissing")}
          />
          {options.replaceMissing && (
            <select
              value={subOptions.replaceMissingWith}
              onChange={(e) =>
                handleSubOptionChange("replaceMissingWith", e.target.value)
              }
              className="ml-6 mt-1 border rounded px-2 py-1 text-sm"
            >
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="mode">Mode</option>
            </select>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">📊 Analysis & Export</h2>

          <Checkbox
            label="Analyze statistics"
            checked={options.analyze}
            onChange={() => toggleOption("analyze")}
          />
          {options.analyze && (
            <>
              <Checkbox
                label="Export results"
                checked={subOptions.exportStats}
                onChange={() =>
                  handleSubOptionChange(
                    "exportStats",
                    !subOptions.exportStats
                  )
                }
                className="ml-6"
              />
              {subOptions.exportStats && (
                <select
                  value={subOptions.exportStatsFormat}
                  onChange={(e) =>
                    handleSubOptionChange(
                      "exportStatsFormat",
                      e.target.value
                    )
                  }
                  className="ml-10 mt-1 border rounded px-2 py-1 text-sm"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              )}
            </>
          )}

          <Checkbox
            label="Download Trash"
            checked={options.exportTrash}
            onChange={() => toggleOption("exportTrash")}
          />

          <Checkbox
            label="Add 'NewData' header to exports"
            checked={options.addNewdataHeader}
            onChange={() => toggleOption("addNewdataHeader")}
          />
        </div>

        <div>
          <h2 className="font-semibold mb-2">📈 Visualization</h2>
          <Checkbox
            label="Generate Graph"
            checked={options.generateGraph}
            onChange={() => toggleOption("generateGraph")}
          />
          {options.generateGraph && (
            <select
              value={subOptions.graphType}
              onChange={(e) =>
                handleSubOptionChange("graphType", e.target.value)
              }
              className="ml-6 mt-1 border rounded px-2 py-1 text-sm"
            >
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="scatter">Scatter</option>
              <option value="histogram">Histogram</option>
            </select>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">🧪 Transform</h2>
          <Checkbox
            label="Normalize Data"
            checked={options.normalize}
            onChange={() => toggleOption("normalize")}
          />
          {options.normalize && (
            <select
              value={subOptions.normalizeMethod}
              onChange={(e) =>
                handleSubOptionChange("normalizeMethod", e.target.value)
              }
              className="ml-6 mt-1 border rounded px-2 py-1 text-sm"
            >
              <option value="zscore">Z-score</option>
              <option value="minmax">Min-Max</option>
            </select>
          )}

          <Checkbox
            label="Encode Categorical Data"
            checked={options.encodeCategorical}
            onChange={() => toggleOption("encodeCategorical")}
          />
        </div>
      </div>

      <SmartSuggestions
        file={file}
        onSuggestionsChange={(sugs) => setSuggestions(sugs)}
      />

      <div className="mt-6">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Processing..." : "Submit"}
        </Button>
        {resultUrl && (
          <a
            href={resultUrl}
            download="result.zip"
            className="ml-4 text-blue-600 underline inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Download result
          </a>
        )}
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
