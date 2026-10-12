import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { exportToExcel, exportToPDF, ExportDataPayload } from '../../utils/exportHelper';

interface ExportActionMenuProps {
  label?: string;
  getData: () => ExportDataPayload;
  className?: string;
}

export const ExportActionMenu: React.FC<ExportActionMenuProps> = ({
  label = 'Export',
  getData,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportExcel = () => {
    setIsOpen(false);
    const data = getData();
    exportToExcel({
      filename: data.filename,
      sheetName: data.sheetName || 'Data',
      headers: data.headers,
      rows: data.rows,
    });
  };

  const handleExportPDF = () => {
    setIsOpen(false);
    const data = getData();
    exportToPDF(data);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 bg-[#121622] hover:bg-[#1a2133] border border-[#232c42] rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        title="Choose export format: Excel or PDF"
      >
        <Download size={13} className="text-blue-400" />
        <span>{label}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0d111a] border border-[#1f2637] shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Choose Format
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 rounded-xl transition-all border border-transparent text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={15} />
            </div>
            <div>
              <div className="font-bold text-emerald-400">Excel (.xlsx)</div>
              <div className="text-[10px] text-slate-400">Full spreadsheet data</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/30 rounded-xl transition-all border border-transparent text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText size={15} />
            </div>
            <div>
              <div className="font-bold text-rose-400">PDF Document (.pdf)</div>
              <div className="text-[10px] text-slate-400">Printable &amp; audit ready</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
