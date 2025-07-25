'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  const [data, setData] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState('');
  const [options, setOptions] = useState({
    removeDuplicates: false,
    removeEmptyRows: false,
    analyzeStatistics: false,
    downloadTrash: false,
  });

  const [trash, setTrash] = useState<any[][]>([]);
  const [statisticsOptions, setStatisticsOptions] = useState({
    countRowsCols: false,
    uniqueValues: false,
    basicStats: false,
    detectNullsOutliers: false,
    summaryVisualization: false,
    exportAnalysis: false,
  });

  const toggleOption = (key: string) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const toggleStatOption = (key: string) => {
    setStatisticsOptions((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    const ext = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (e) => {
      const content = e.target?.result;
      let rawData: any[][] = [];

      if (ext === 'csv') {
        const parsed = Papa.parse(content as string, { skipEmptyLines: false });
        rawData = parsed.data as any[][];
      } else if (ext === 'xlsx' || ext === 'xls') {
        const workbook = XLSX.read(content, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      } else {
        alert('Unsupported file type');
        return;
      }

      let cleaned = [...rawData];
      const trashRows: any[][] = [];

      if (options.removeEmptyRows) {
        cleaned = cleaned.filter((row) => {
          const isEmpty = row.every((cell) => !cell || cell === '');
          if (isEmpty) trashRows.push(row);
          return !isEmpty;
        });
      }

      if (options.removeDuplicates) {
        const seen = new Set();
        cleaned = cleaned.filter((row) => {
          const key = JSON.stringify(row);
          if (seen.has(key)) {
            trashRows.push(row);
            return false;
          }
          seen.add(key);
          return true;
        });
      }

      setData(cleaned);
      setTrash(trashRows);
    };

    if (ext === 'xlsx' || ext === 'xls') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const downloadFile = (content: any[][], name: string) => {
    const worksheet = XLSX.utils.aoa_to_sheet(content);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, name);
  };

  const handleDownload = () => {
    if (data) downloadFile(data, `cleaned_${fileName}`);
  };

  const handleDownloadTrash = () => {
    if (trash.length > 0) {
      downloadFile(trash, `trash_${fileName}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload & Process Your File</h1>

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="mb-4"
      />

      <div className="space-y-4 mb-6">
        <Checkbox
          label="Remove Empty Rows"
          checked={options.removeEmptyRows}
          onChange={() => toggleOption('removeEmptyRows')}
        />
        <Checkbox
          label="Remove Duplicates"
          checked={options.removeDuplicates}
          onChange={() => toggleOption('removeDuplicates')}
        />
        <Checkbox
          label="Analyze Statistics"
          checked={options.analyzeStatistics}
          onChange={() => toggleOption('analyzeStatistics')}
        />
        {options.analyzeStatistics && (
          <div className="ml-4 space-y-2 border-l pl-4">
            <Checkbox
              label="Count Rows & Columns"
              checked={statisticsOptions.countRowsCols}
              onChange={() => toggleStatOption('countRowsCols')}
            />
            <Checkbox
              label="Unique Values per Column"
              checked={statisticsOptions.uniqueValues}
              onChange={() => toggleStatOption('uniqueValues')}
            />
            <Checkbox
              label="Basic Statistics (Mean, Median, etc.)"
              checked={statisticsOptions.basicStats}
              onChange={() => toggleStatOption('basicStats')}
            />
            <Checkbox
              label="Detect Nulls & Outliers"
              checked={statisticsOptions.detectNullsOutliers}
              onChange={() => toggleStatOption('detectNullsOutliers')}
            />
            <Checkbox
              label="Summary Visualization"
              checked={statisticsOptions.summaryVisualization}
              onChange={() => toggleStatOption('summaryVisualization')}
            />
            <Checkbox
              label="Export Analysis (.xlsx & .pdf)"
              checked={statisticsOptions.exportAnalysis}
              onChange={() => toggleStatOption('exportAnalysis')}
            />
          </div>
        )}
        <Checkbox
          label="Download Trash (Deleted Rows)"
          checked={options.downloadTrash}
          onChange={() => toggleOption('downloadTrash')}
        />
      </div>

      {data && (
        <>
          <div className="overflow-x-auto border mb-4">
            <table className="min-w-full text-sm">
              <tbody>
                {data.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b">
                    {row.map((cell, j) => (
                      <td key={j} className="p-2 border-r">
                        {typeof cell === 'object' ? JSON.stringify(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mr-4" onClick={handleDownload}>Download Cleaned File</Button>
          {options.downloadTrash && (
            <Button variant="outline" onClick={handleDownloadTrash}>Download Trash</Button>
          )}
        </>
      )}
    </div>
  );
}
