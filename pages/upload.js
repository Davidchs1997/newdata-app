import { useState } from 'react';
import Papa from 'papaparse';
import * as xlsx from 'xlsx';

export default function Upload() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setColumns(results.meta.fields);
          setData(results.data);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = xlsx.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = xlsx.utils.sheet_to_json(ws);
        setColumns(Object.keys(json[0] || {}));
        setData(json);
      };
      reader.readAsBinaryString(file);
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const json = JSON.parse(evt.target.result);
        setColumns(Object.keys(json[0] || {}));
        setData(json);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload CSV / XLSX / JSON</h2>
      <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
      {data.length > 0 && (
        <table border="1" cellPadding="5" style={{ marginTop: '1rem' }}>
          <thead>
            <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => <td key={c+i}>{row[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}