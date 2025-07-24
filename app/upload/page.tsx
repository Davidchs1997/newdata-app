'use client';
import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [cleanedData, setCleanedData] = useState<any[][] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const cleanData = (data: any[][]): any[][] => {
    return data.filter((row) =>
      row.some((cell) => cell !== null && cell !== undefined && cell !== "")
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = () => {
    if (!file) return;
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
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1950&q=80")',
      }}
    >
      <div className="bg-white bg-opacity-90 shadow-xl rounded-lg p-8 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          NewData – Data Cleaning Simplified
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Sube tu archivo CSV, Excel o JSON y obtén una versión limpia y depurada en segundos.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <input
            id="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileSelect}
            className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <Button
            onClick={handleUpload}
            disabled={!file}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Upload & Process
          </Button>
        </div>

        {cleanedData && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Preview (First 10 rows)
            </h2>
            <div className="overflow-x-auto rounded border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-700">
                <tbody>
                  {cleanedData.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="p-3 border-r whitespace-nowrap"
                        >
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

            <div className="flex justify-center mt-6">
              <Button
                onClick={downloadCleanedFile}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Download Cleaned File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
