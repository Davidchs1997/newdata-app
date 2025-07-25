'use client';
import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [cleanedData, setCleanedData] = useState<any[][] | null>(null);
  const [options, setOptions] = useState({
    removeEmpty: true,
    removeDuplicates: true,
    removeIncompleteRows: true,
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions((prev) => ({ ...prev, [name]: checked }));
  };

  const cleanData = (data: any[][]): any[][] => {
    let cleaned = [...data];

    if (options.removeEmpty) {
      cleaned = cleaned.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== "")
      );
    }

    if (options.removeDuplicates) {
      const seen = new Set();
      cleaned = cleaned.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    if (options.removeIncompleteRows) {
      const headers = cleaned[0];
      cleaned = cleaned.filter(
        (row, i) =>
          i === 0 || (row.length === headers.length && !row.includes(""))
      );
    }

    return cleaned;
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setCleanedData(null);
  };

  const handleUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split(".").pop()?.toLowerCase();

    reader.onload = (e) => {
      const result = e.target?.result;
      let data: any[][] = [];

      if (extension === "csv") {
        const parsed = Papa.parse(result as string, { skipEmptyLines: true });
        data = parsed.data as any[][];
      } else if (["xlsx", "xls"].includes(extension || "")) {
        const workbook = XLSX.read(result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      } else if (extension === "json") {
        const json = JSON.parse(result as string);
        if (Array.isArray(json)) data = json;
      }

      const cleaned = cleanData(data);
      setCleanedData(cleaned);
    };

    if (["xlsx", "xls"].includes(extension || "")) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">📊 Upload & Clean your Data</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row md:space-x-6 mb-4">
          <label className="flex items-center mb-2 md:mb-0">
            <input
              type="checkbox"
              name="removeEmpty"
              checked={options.removeEmpty}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Remove Empty Rows
          </label>

          <label className="flex items-center mb-2 md:mb-0">
            <input
              type="checkbox"
              name="removeDuplicates"
              checked={options.removeDuplicates}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Remove Duplicate Rows
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="removeIncompleteRows"
              checked={options.removeIncompleteRows}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Remove Incomplete Rows
          </label>
        </div>

        <Button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Upload & Clean
        </Button>
      </div>

      {cleanedData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">🔍 Preview (First 10 Rows)</h2>
          <div className="overflow-x-auto border rounded">
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
          <Button
            className="mt-4 bg-green-600 hover:bg-green-700 text-white"
            onClick={downloadCleanedFile}
          >
            Download Cleaned File
          </Button>
        </div>
      )}
    </div>
  );
}
