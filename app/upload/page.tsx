'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
);

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [removeIncomplete, setRemoveIncomplete] = useState(true);
  const [downloadTrash, setDownloadTrash] = useState(false);
  const [includeStats, setIncludeStats] = useState(false);
  const [includeBarChart, setIncludeBarChart] = useState(false);
  const [includePieChart, setIncludePieChart] = useState(false);
  const [includeScatterPlot, setIncludeScatterPlot] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const cleanAndExport = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        let data = results.data as any[];
        const trash: any[] = [];

        // Trash copy before any filtering
        let originalData = [...data];

        // Remove empty rows
        if (removeEmpty) {
          data = data.filter(row =>
            Object.values(row).some(val => val !== null && val !== '')
          );
        }

        // Remove duplicates
        if (removeDuplicates) {
          const unique = new Set();
          data = data.filter(row => {
            const serialized = JSON.stringify(row);
            if (unique.has(serialized)) {
              trash.push(row);
              return false;
            }
            unique.add(serialized);
            return true;
          });
        }

        // Remove incomplete rows
        if (removeIncomplete) {
          data = data.filter(row => {
            const hasAll = Object.values(row).every(val => val !== '');
            if (!hasAll) trash.push(row);
            return hasAll;
          });
        }

        // Save Trash if requested
        if (downloadTrash && trash.length > 0) {
          const trashSheet = XLSX.utils.json_to_sheet(trash);
          const trashWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(trashWorkbook, trashSheet, 'Trash');
          const trashBlob = XLSX.write(trashWorkbook, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([trashBlob]), 'trash_data.xlsx');
        }

        // Compute statistics
        const stats: any = {};
        const numericKeys = Object.keys(data[0]).filter(key =>
          !isNaN(Number(data[0][key]))
        );

        if (includeStats && numericKeys.length > 0) {
          numericKeys.forEach(key => {
            const values = data.map(row => Number(row[key])).filter(v => !isNaN(v));
            stats[key] = {
              mean: values.reduce((a, b) => a + b, 0) / values.length,
              median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
              min: Math.min(...values),
              max: Math.max(...values),
              stdDev: Math.sqrt(values.reduce((a, b) => a + Math.pow(b - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length),
              unique: new Set(values).size
            };
          });
        }

        // Export Excel
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Cleaned Data');

        if (includeStats) {
          const statsSheet = XLSX.utils.json_to_sheet(
            Object.entries(stats).map(([k, v]) => ({ column: k, ...v }))
          );
          XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistics');
        }

        const excelBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBlob]), 'cleaned_data.xlsx');
      }
    });
  };

  return (
    <div className="p-10 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        📊 Upload & Clean your Data
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="space-y-2 mb-6">
        <label><input type="checkbox" checked={removeEmpty} onChange={e => setRemoveEmpty(e.target.checked)} /> Remove Empty Rows</label><br />
        <label><input type="checkbox" checked={removeDuplicates} onChange={e => setRemoveDuplicates(e.target.checked)} /> Remove Duplicate Rows</label><br />
        <label><input type="checkbox" checked={removeIncomplete} onChange={e => setRemoveIncomplete(e.target.checked)} /> Remove Incomplete Rows</label><br />
        <label><input type="checkbox" checked={downloadTrash} onChange={e => setDownloadTrash(e.target.checked)} /> Download Trash (Deleted Rows)</label><br />
        <label><input type="checkbox" checked={includeStats} onChange={e => setIncludeStats(e.target.checked)} /> Include Statistical Analysis</label><br />
        <label><input type="checkbox" checked={includeBarChart} onChange={e => setIncludeBarChart(e.target.checked)} /> Generate Bar Chart</label><br />
        <label><input type="checkbox" checked={includePieChart} onChange={e => setIncludePieChart(e.target.checked)} /> Generate Pie Chart</label><br />
        <label><input type="checkbox" checked={includeScatterPlot} onChange={e => setIncludeScatterPlot(e.target.checked)} /> Generate Scatter Plot</label>
      </div>

      <button
        onClick={cleanAndExport}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Upload & Clean
      </button>
    </div>
  );
}
