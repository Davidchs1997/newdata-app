'use client';
import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function UploadPage() {
  const [cleanedData, setCleanedData] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [rawData, setRawData] = useState<any[][] | null>(null);
  const [options, setOptions] = useState({
    removeEmptyRows: true,
    removeDuplicates: true,
    removeMissingDocs: false,
  });

  const handleCheckboxChange = (option: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const cleanData = (data: any[][]): any[][] => {
    let cleaned = [...data];

    if (options.removeEmptyRows) {
      cleaned = cleaned.filter(row =>
        row.some(cell => cell !== null && cell !== undefined && cell !== "")
      );
    }

    if (options.removeDuplicates) {
      const seen = new Set();
      cleaned = cleaned.filter(row => {
        const key = JSON.stringify(row);
        return seen.has(key) ? false : seen.add(key);
      });
    }

    if (options.removeMissingDocs) {
      const header = cleaned[0];
      const docIndex = header.findIndex(h => typeof h === "string" && h.toLowerCase().includes("doc"));
      if (docIndex !== -1) {
        cleaned = [header, ...cleaned.slice(1).filter(row => row[docIndex])];
      }
    }

    return cleaned;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target?.result;
      const extension = file.name.split(".").pop()?.toLowerCase();

      let parsed: any[][] = [];

      if (extension === "csv") {
        const result = Papa.parse(fileData as string, { skipEmptyLines: false });
        parsed = result.data as any[][];
      } else if (["xlsx", "xls"].includes(extension || "")) {
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsed = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      }

      setRawData(parsed);
    };

    if (["xlsx", "xls"].includes(file.name.split(".").pop() || "")) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleUpload = () => {
    if (rawData) {
      const cleaned = cleanData(rawData);
      setCleanedData(cleaned);
    }
  };

  const downloadCleanedFile = () => {
    if (!cleanedData) return;

    const worksheet = XLSX.utils.aoa_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned Data");
    XLSX.writeFile(workbook, `cleaned_${fileName}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload & Clean Your File</h1>

      <div className="mb-4 space-y-2">
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <label className="flex items-center gap-2">
            <Checkbox checked={options.removeEmptyRows} onCheckedChange={() => handleCheckboxChange("removeEmptyRows")} />
            Remove empty rows
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={options.removeDuplicates} onCheckedChange={() => handleCheckboxChange("removeDuplicates")} />
            Remove duplicate rows
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={options.removeMissingDocs} onCheckedChange={() => handleCheckboxChange("removeMissingDocs")} />
            Remove rows with missing documentation
          </label>
        </div>
      </div>

      <Button onClick={handleUpload} className="mt-4 mb-6">Upload and Clean</Button>

      {cleanedData && (
        <>
          <div className="overflow-x-auto border rounded mb-4">
            <table className="min-w-full text-sm">
              <tbody>
                {cleanedData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-2 border-r">
                        {typeof cell === "object" ? JSON.stringify(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={downloadCleanedFile}>Download Cleaned File</Button>
        </>
      )}
    </div>
  );
}
