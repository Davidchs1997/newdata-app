'use client';
import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [cleanedData, setCleanedData] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const cleanData = (data: any[][]): any[][] => {
    return data.filter((row) =>
      row.some((cell) => cell !== null && cell !== undefined && cell !== "")
    );
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const fileData = e.target?.result;
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv") {
        const parsed = Papa.parse(fileData as string, { skipEmptyLines: true });
        const cleaned = cleanData(parsed.data as any[][]);
        setCleanedData(cleaned);
      } else if (["xlsx", "xls"].includes(fileExtension || "")) {
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const cleaned = cleanData(parsed as any[][]);
        setCleanedData(cleaned);
      } else if (fileExtension === "json") {
        const json = JSON.parse(fileData as string);
        if (Array.isArray(json)) {
          const cleaned = cleanData(json);
          setCleanedData(cleaned);
        }
      } else {
        alert("Unsupported file type");
      }
    };

    if (["xlsx", "xls"].includes(file.name.split(".").pop() || "")) {
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
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload & Clean your File</h1>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {cleanedData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Preview (First 10 rows)
          </h2>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <tbody>
                {cleanedData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-2 border-r">
                        {typeof cell === "object"
                          ? JSON.stringify(cell)
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mt-4" onClick={downloadCleanedFile}>
            Download Cleaned File
          </Button>
        </div>
      )}
    </div>
  );
}
