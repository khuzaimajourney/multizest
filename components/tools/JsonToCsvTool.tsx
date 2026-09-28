'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

// Flatten nested objects (e.g. user.address.city)
const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  return Object.keys(obj).reduce((acc: any, k: string) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

export default function JsonToCsvTool() {
  const defaultSample = JSON.stringify(
    [
      { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Engineer', country: 'USA' },
      { id: 2, name: 'Maria Garcia', email: 'maria@example.com', role: 'Designer', country: 'Spain' },
      { id: 3, name: 'Kenji Sato', email: 'kenji@example.com', role: 'Product Lead', country: 'Japan' },
      { id: 4, name: 'Fatima Al-Mansoor', email: 'fatima@example.com', role: 'Marketing', country: 'UAE' },
    ],
    null,
    2
  );

  const [jsonInput, setJsonInput] = useState(defaultSample);
  const [csvOutput, setCsvOutput] = useState('');
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<any[][]>([]);
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-convert whenever jsonInput or delimiter changes
  useEffect(() => {
    if (!jsonInput.trim()) {
      setCsvOutput('');
      setTableHeaders([]);
      setTableRows([]);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        setError('JSON array is empty.');
        return;
      }

      // Collect unique keys from all flattened objects
      const flattened = items.map((item) =>
        typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }
      );

      const headersSet = new Set<string>();
      flattened.forEach((row) => Object.keys(row).forEach((k) => headersSet.add(k)));
      const headers = Array.from(headersSet);

      setTableHeaders(headers);

      // Build rows
      const rows = flattened.map((row) =>
        headers.map((h) => {
          const val = row[h];
          if (val === undefined || val === null) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        })
      );
      setTableRows(rows);

      // Format CSV string with proper quotes escaping
      const escapeCsvCell = (cell: string) => {
        if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      };

      const headerLine = headers.map(escapeCsvCell).join(delimiter);
      const rowLines = rows.map((r) => r.map(escapeCsvCell).join(delimiter)).join('\n');
      const fullCsv = `${headerLine}\n${rowLines}`;

      setCsvOutput(fullCsv);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax.');
    }
  }, [jsonInput, delimiter]);

  const handleCopy = () => {
    if (!csvOutput) return;
    navigator.clipboard.writeText(csvOutput);
    setCopied(true);
    fireSuccessConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multizest-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    fireSuccessConfetti();
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonInput(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
            <span>Delimiter:</span>
            <InteractiveTooltip content="Choose comma for standard CSV, semicolon for European Excel, or Tab for TSV." />
          </label>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setDelimiter(',')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                delimiter === ',' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Comma (,)
            </button>
            <button
              type="button"
              onClick={() => setDelimiter(';')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                delimiter === ';' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semicolon (;)
            </button>
            <button
              type="button"
              onClick={() => setDelimiter('\t')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                delimiter === '\t' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tab
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
            <FileCode className="w-3.5 h-3.5 text-teal-600" />
            <span>Upload .JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setJsonInput('')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Input JSON Array
            </label>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Auto-updating
            </span>
          </div>
          <textarea
            rows={12}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON array here (e.g. [{ 'name': 'John', 'age': 30 }])..."
            className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}
        </div>

        {/* CSV Output Text */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Raw CSV Output
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {tableRows.length} rows • {tableHeaders.length} columns
            </span>
          </div>
          <textarea
            rows={12}
            readOnly
            value={csvOutput}
            placeholder="Parsed CSV results will appear here automatically..."
            className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none select-all"
          />
        </div>
      </div>

      {/* Interactive Table Preview */}
      {tableRows.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-teal-600" />
            <span>Interactive Spreadsheet Preview ({tableRows.length} rows)</span>
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto max-h-72 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {tableHeaders.map((head) => (
                    <th key={head} className="px-4 py-3 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setJsonInput(defaultSample)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Load Sample JSON</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!csvOutput}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-semibold text-sm transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied CSV!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!csvOutput}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-lg shadow-teal-500/25 active:scale-95 disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
