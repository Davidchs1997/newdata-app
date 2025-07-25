'use client';
import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function UploadPage() {
  const [rawData, setRawData] = useState<any[][] | null>(null);
  const [cleanedData, setCleanedData] = useState<any[][] | null>(null);
  const [trashData, setTrashData] = useState<any[][]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [options, setOptions] = useState({
    removeEmptyRows: true,
    removeDuplicates: true,
    removeIncomplete: false,
    downloadTrash: false,
    analyzeStats: true,
    generateGraphs: true,
  });

  const handleOptionChange = (option: string, checked: boolean) => {
    setOptions((prev) => ({ ...prev, [option]: checked }));
  };

  const cleanData = (data: any[][]): any[][] => {
    const trash: any[][] = [];
    let result = [...data];

    if (options.removeEmptyRows) {
      result = result.filter(row => {
        const keep = row.some(cell => cell !== "" && cell !== null && cell !== undefined);
        if (!keep) trash.push(row);
        return keep;
      });
    }

    if (options.removeDuplicates) {
      const seen = new Set();
      result = result.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) {
          trash.push(row);
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    if (options.removeIncomplete) {
      result = result.filter(row => {
        const isComplete = row.every(cell => cell !== "" && cell !== null && cell !== undefined);
        if (!isComplete) trash.push(row);
        return isComplete;
      });
    }

    setTrashData(trash);
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target?.result;
      const extension = file.name.split(".").pop()?.toLowerCase();

      let data: any[][] = [];

      if (extension === "csv") {
        const parsed = Papa.parse(fileData as string, { skipEmptyLines: false });
        data = parsed.data as any[][];
      } else if (["xlsx", "xls"].includes(extension || "")) {
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      } else if (extension === "json") {
        const json = JSON.parse(fileData as string);
        if (Array.isArray(json)) data = json;
      }

      setRawData(data);
      const cleaned = cleanData(data);
      setCleanedData(cleaned);
    };

    if (["xlsx", "xls"].includes(file.name.split(".").pop() || "")) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const downloadFile = (data: any[][], filename: string) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  };

  const calculateStats = (data: any[][]) => {
    const headers = data[0];
    const stats: Record<string, any> = {};

    for (let col = 0; col < headers.length; col++) {
      const values = data.slice(1).map((row) => parseFloat(row[col])).filter(val => !isNaN(val));
      if (values.length === 0) continue;

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length);
      const unique = [...new Set(values)].length;

      stats[headers[col]] = { avg, min, max, std, unique };
    }

    return stats;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Upload & Analyze Your Data</h1>
      <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileUpload} className="mb-4" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(options).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2">
            <Checkbox checked={value} onCheckedChange={(val) => handleOptionChange(key, Boolean(val))} />
            <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
          </label>
        ))}
      </div>

      {cleanedData && (
        <>
          <div className="mb-4">
            <Button onClick={() => downloadFile(cleanedData, `cleaned_${fileName}`)}>Download Cleaned File</Button>
            {options.downloadTrash && trashData.length > 0 && (
              <Button className="ml-4" onClick={() => downloadFile(trashData, `trash_${fileName}`)}>Download Trash</Button>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-2">Preview (First 10 rows)</h2>
          <div className="overflow-x-auto border rounded mb-6">
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

          {options.analyzeStats && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Statistical Summary</h2>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(calculateStats(cleanedData), null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
