import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  CheckSquare,
  Square,
  Bookmark,
  Trash2,
  Plus,
  Table,
  CheckCircle2,
  X,
  FileText,
  Save,
  RotateCcw,
  ArrowUpDown,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Stethoscope,
  Undo2,
  FolderOpen,
} from 'lucide-react';
import {
  ProductSaleRecord,
  TaDaClaim,
  CompanyNote,
  CustomExcelPreset,
} from '../../../types';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface CustomExcelPortalSectionProps {
  salesRecords: ProductSaleRecord[];
  tadaClaims: TaDaClaim[];
  companyNotes: CompanyNote[];
  monthlyBudget: number;
  presets: CustomExcelPreset[];
  onSavePreset: (preset: Omit<CustomExcelPreset, 'id' | 'created_at'>) => Promise<void>;
  onDeletePreset: (id: string) => Promise<void>;
}

type DatasetKey = 'sales' | 'tada' | 'notes' | 'hishab' | 'blank';
type ViewTab = 'sheet' | 'saved-sheets';

interface ColumnDef {
  key: string;
  label: string;
  isNumeric?: boolean;
}

const MASTER_COLUMNS: ColumnDef[] = [
  { key: 'sale_date', label: 'Sale Date' },
  { key: 'product_name', label: 'Equipment / Product' },
  { key: 'product_model', label: 'Model / Serial' },
  { key: 'doctor_name', label: 'Doctor / Surgeon Name' },
  { key: 'hospital_center_name', label: 'Hospital / Dental Center' },
  { key: 'location_district', label: 'District / City' },
  { key: 'quantity', label: 'Qty', isNumeric: true },
  { key: 'sale_value', label: 'Sale Value (BDT)', isNumeric: true },
  { key: 'paid_amount', label: 'Paid Amount (BDT)', isNumeric: true },
  { key: 'due_amount', label: 'Due Amount (BDT)', isNumeric: true },
  { key: 'payment_status', label: 'Payment Status' },
  { key: 'delivery_status', label: 'Delivery Status' },
  { key: 'notes', label: 'Remarks / Notes' },
];

const DATASET_COLUMNS: Record<DatasetKey, ColumnDef[]> = {
  sales: MASTER_COLUMNS,
  tada: [
    { key: 'travel_start_date', label: 'Travel Date' },
    { key: 'employee_name', label: 'Employee Name' },
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'title', label: 'Duty Title / Purpose' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'travel_allowance', label: 'Travel Allowance (BDT)', isNumeric: true },
    { key: 'daily_allowance', label: 'Daily Allowance (BDT)', isNumeric: true },
    { key: 'transportation_expense', label: 'Local Transport (BDT)', isNumeric: true },
    { key: 'accommodation_food_expense', label: 'Hotel & Food (BDT)', isNumeric: true },
    { key: 'total_amount', label: 'Total Claim (BDT)', isNumeric: true },
    { key: 'status', label: 'Approval Status' },
    { key: 'payment_status', label: 'Disbursement' },
  ],
  notes: [
    { key: 'date', label: 'Directive Date' },
    { key: 'title', label: 'Title / Subject' },
    { key: 'category', label: 'Category' },
    { key: 'author_name', label: 'Issued By' },
    { key: 'amount', label: 'Amount (BDT)', isNumeric: true },
    { key: 'content', label: 'Details / Instructions' },
  ],
  hishab: [
    { key: 'metric', label: 'Financial Metric' },
    { key: 'category', label: 'Classification' },
    { key: 'amount_bdt', label: 'Amount (BDT)', isNumeric: true },
    { key: 'status_notes', label: 'Status / Notes' },
  ],
  blank: MASTER_COLUMNS,
};

const EXCEL_COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

export const CustomExcelPortalSection: React.FC<CustomExcelPortalSectionProps> = ({
  salesRecords,
  tadaClaims,
  companyNotes,
  monthlyBudget,
  presets,
  onSavePreset,
  onDeletePreset,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('sheet');
  const [selectedDataset, setSelectedDataset] = useState<DatasetKey>('sales');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    ['sale_date', 'product_name', 'product_model', 'doctor_name', 'hospital_center_name', 'location_district', 'quantity', 'sale_value', 'paid_amount', 'due_amount', 'payment_status', 'notes']
  );
  
  // Search & Date Range Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  
  // Sorting state
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Presets & Modal
  const [presetNameInput, setPresetNameInput] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  // Active Selected Cell for Inline Editing & Google Sheets Formula Bar
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
  const [editingCellVal, setEditingCellVal] = useState<string>('');

  // Editable State for Rows
  const [manualRows, setManualRows] = useState<Record<string, any>[]>([]);
  const [editedRowsMap, setEditedRowsMap] = useState<Record<string, Record<string, any>>>({});

  // History Stack for Restore / Undo (Ctrl + Z)
  const [historyStack, setHistoryStack] = useState<{
    manualRows: Record<string, any>[];
    editedRowsMap: Record<string, Record<string, any>>;
  }[]>([]);

  // Add Row Form State
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, string>>({
    sale_date: new Date().toISOString().split('T')[0],
    quantity: '1',
    sale_value: '',
    paid_amount: '',
    due_amount: '0',
    payment_status: 'full_paid',
    delivery_status: 'installed',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Push state to Undo History Stack
  const pushToUndoHistory = () => {
    setHistoryStack((prev) => [
      ...prev.slice(-20), // keep max 20 undo steps
      { manualRows: [...manualRows], editedRowsMap: { ...editedRowsMap } },
    ]);
  };

  // Perform Undo / Restore (Ctrl + Z)
  const handleUndo = () => {
    if (historyStack.length === 0) {
      alert('No previous edit state to restore.');
      return;
    }
    const previousState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setManualRows(previousState.manualRows);
    setEditedRowsMap(previousState.editedRowsMap);
    setSelectedCell(null);
  };

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStack, manualRows, editedRowsMap]);

  // Switch dataset
  const handleSelectDataset = (key: DatasetKey) => {
    setSelectedDataset(key);
    const cols = DATASET_COLUMNS[key] || MASTER_COLUMNS;
    setSelectedColumns(cols.map((c) => c.key));
    setSelectedCell(null);
  };

  // Toggle Column
  const handleToggleColumn = (colKey: string) => {
    if (selectedColumns.includes(colKey)) {
      if (selectedColumns.length === 1) return;
      setSelectedColumns(selectedColumns.filter((k) => k !== colKey));
    } else {
      setSelectedColumns([...selectedColumns, colKey]);
    }
  };

  // Sort toggle
  const handleHeaderClick = (colKey: string) => {
    if (sortCol === colKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  // Load a Saved Sheet Preset
  const handleApplyPreset = (preset: CustomExcelPreset) => {
    setSelectedDataset(preset.dataset as DatasetKey);
    setSelectedColumns(preset.columns);
    setActiveViewTab('sheet');
  };

  // Save new sheet preset
  const handleSaveCurrentPreset = async () => {
    if (!presetNameInput.trim()) return;
    setIsSavingPreset(true);
    try {
      await onSavePreset({
        name: presetNameInput.trim(),
        dataset: selectedDataset === 'blank' ? 'sales' : selectedDataset,
        columns: selectedColumns,
      });
      setPresetNameInput('');
      setShowSavePresetModal(false);
    } finally {
      setIsSavingPreset(false);
    }
  };

  // Auto-calculate Due Amount for Add Row Modal
  const updateNewRowField = (field: string, value: string) => {
    const updated = { ...newRowData, [field]: value };

    const saleValNum = Number(field === 'sale_value' ? value : updated.sale_value) || 0;
    let paidNum = Number(field === 'paid_amount' ? value : updated.paid_amount) || 0;

    if (field === 'payment_status') {
      if (value === 'full_paid') paidNum = saleValNum;
      if (value === 'due') paidNum = 0;
      updated.paid_amount = paidNum.toString();
    }

    const calculatedDue = Math.max(0, saleValNum - paidNum);
    updated.due_amount = calculatedDue.toString();

    // Auto set status if paid matches sale_value
    if (field === 'paid_amount' || field === 'sale_value') {
      if (paidNum >= saleValNum && saleValNum > 0) updated.payment_status = 'full_paid';
      else if (paidNum === 0) updated.payment_status = 'due';
      else if (paidNum < saleValNum) updated.payment_status = 'partial';
    }

    setNewRowData(updated);
  };

  // Add Row directly to Sheet
  const handleAddManualRow = (e: React.FormEvent) => {
    e.preventDefault();
    pushToUndoHistory();

    const saleValNum = Number(newRowData.sale_value) || 0;
    const paidNum = Number(newRowData.paid_amount) || 0;
    const calculatedDue = Math.max(0, saleValNum - paidNum);

    const rowObj: Record<string, any> = {
      id: `manual-row-${Date.now()}`,
      created_at: new Date().toISOString(),
      sale_value: saleValNum,
      paid_amount: paidNum,
      due_amount: calculatedDue,
    };

    MASTER_COLUMNS.forEach((col) => {
      if (rowObj[col.key] !== undefined) return;
      const val = newRowData[col.key];
      if (col.isNumeric) {
        rowObj[col.key] = val ? Number(val) : 0;
      } else {
        rowObj[col.key] = val || '—';
      }
    });

    setManualRows([rowObj, ...manualRows]);
    setNewRowData({
      sale_date: new Date().toISOString().split('T')[0],
      quantity: '1',
      sale_value: '',
      paid_amount: '',
      due_amount: '0',
      payment_status: 'full_paid',
      delivery_status: 'installed',
    });
    setShowAddRowModal(false);
  };

  // Remove individual row
  const handleDeleteManualRow = (id: string) => {
    pushToUndoHistory();
    setManualRows(manualRows.filter((r) => r.id !== id));
    if (selectedCell) setSelectedCell(null);
  };

  // Remove entire sheet or custom rows
  const handleRemoveSheet = async (presetId?: string) => {
    if (presetId) {
      if (confirm('Are you sure you want to remove this saved sheet preset from your portal?')) {
        await onDeletePreset(presetId);
      }
    } else {
      if (confirm('Clear all custom added rows in this spreadsheet?')) {
        pushToUndoHistory();
        setManualRows([]);
        setEditedRowsMap({});
        setSelectedCell(null);
      }
    }
  };

  // Handle cell click (select cell for editing)
  const handleCellSelect = (rowIdx: number, colKey: string, currentVal: any) => {
    setSelectedCell({ rowIdx, colKey });
    setEditingCellVal(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  // Save inline cell edit with auto-calculated due_amount
  const handleCellEditChange = (newVal: string) => {
    if (!selectedCell) return;
    pushToUndoHistory();

    setEditingCellVal(newVal);
    const row = tableData[selectedCell.rowIdx];
    if (!row) return;

    const rowId = row.id || `row-idx-${selectedCell.rowIdx}`;
    const updatedRow = { ...row, [selectedCell.colKey]: newVal };

    // Auto calculate due amount if sale_value or paid_amount is edited inline
    if (selectedCell.colKey === 'sale_value' || selectedCell.colKey === 'paid_amount') {
      const saleValNum = Number(selectedCell.colKey === 'sale_value' ? newVal : updatedRow.sale_value) || 0;
      const paidNum = Number(selectedCell.colKey === 'paid_amount' ? newVal : updatedRow.paid_amount) || 0;
      updatedRow.due_amount = Math.max(0, saleValNum - paidNum);
    }

    setEditedRowsMap((prev) => ({
      ...prev,
      [rowId]: updatedRow,
    }));
  };

  // Import CSV File
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    pushToUndoHistory();

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file does not contain enough data rows.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const newImportedRows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const rowObj: Record<string, any> = { id: `imported-row-${Date.now()}-${i}` };

        headers.forEach((h, colIdx) => {
          const val = values[colIdx] || '';
          if (h.includes('hospital') || h.includes('center')) rowObj.hospital_center_name = val;
          else if (h.includes('doctor')) rowObj.doctor_name = val;
          else if (h.includes('product') || h.includes('equipment')) rowObj.product_name = val;
          else if (h.includes('model') || h.includes('serial')) rowObj.product_model = val;
          else if (h.includes('date')) rowObj.sale_date = val;
          else if (h.includes('price') || h.includes('value')) rowObj.sale_value = Number(val) || 0;
          else if (h.includes('paid')) rowObj.paid_amount = Number(val) || 0;
          else if (h.includes('due')) rowObj.due_amount = Number(val) || 0;
          else if (h.includes('status')) rowObj.payment_status = val;
          else rowObj[h] = val;
        });

        // Auto calculate due amount for imported rows if missing
        const sVal = Number(rowObj.sale_value) || 0;
        const pVal = Number(rowObj.paid_amount) || 0;
        if (!rowObj.due_amount && sVal > 0) {
          rowObj.due_amount = Math.max(0, sVal - pVal);
        }

        newImportedRows.push(rowObj);
      }

      setManualRows((prev) => [...newImportedRows, ...prev]);
      alert(`Successfully imported ${newImportedRows.length} rows into the spreadsheet!`);
    };

    reader.readAsText(file);
  };

  // Generate Current Rows according to dataset, inline edits, & filters
  const tableData = useMemo(() => {
    let raw: Record<string, any>[] = [];

    if (selectedDataset === 'blank') {
      raw = manualRows;
    } else if (selectedDataset === 'sales') {
      raw = [...salesRecords, ...manualRows];
    } else if (selectedDataset === 'tada') {
      raw = tadaClaims;
    } else if (selectedDataset === 'notes') {
      raw = companyNotes;
    } else if (selectedDataset === 'hishab') {
      const salesTotal = salesRecords.reduce((acc, s) => acc + (Number(s.sale_value) || 0), 0);
      const paidTotal = salesRecords.reduce((acc, s) => acc + (Number(s.paid_amount) || 0), 0);
      const tadaTotal = tadaClaims.reduce((acc, c) => acc + (Number(c.total_amount) || 0), 0);
      const notesExpenseTotal = companyNotes
        .filter((n) => n.category === 'expense')
        .reduce((acc, n) => acc + (Number(n.amount) || 0), 0);
      const allExpenses = tadaTotal + notesExpenseTotal;
      const netMargin = paidTotal - allExpenses;

      raw = [
        { metric: 'Monthly Budget Allocated', category: 'Target', amount_bdt: monthlyBudget, status_notes: 'Board Approved' },
        { metric: 'Total Equipment Sales Revenue', category: 'Inflow', amount_bdt: salesTotal, status_notes: `${salesRecords.length} Orders` },
        { metric: 'Cash Collections Received', category: 'Inflow', amount_bdt: paidTotal, status_notes: 'Bank Cleared' },
        { metric: 'Personal Field Staff TA/DA Claims', category: 'Outflow', amount_bdt: tadaTotal, status_notes: `${tadaClaims.length} Claims` },
        { metric: 'Company Operational Notes Expenses', category: 'Outflow', amount_bdt: notesExpenseTotal, status_notes: 'Office / Logistics' },
        { metric: 'ALL TOTAL EXPENSES', category: 'Grand Outflow', amount_bdt: allExpenses, status_notes: `${monthlyBudget > 0 ? Math.round((allExpenses / monthlyBudget) * 100) : 0}% of Budget` },
        { metric: 'NET CASH BALANCE (HISHAB)', category: 'Surplus', amount_bdt: netMargin, status_notes: netMargin >= 0 ? 'Positive Operating Cash' : 'Deficit' },
      ];
    }

    // Apply inline edits
    const merged = raw.map((r, idx) => {
      const rowId = r.id || `row-idx-${idx}`;
      return editedRowsMap[rowId] ? { ...r, ...editedRowsMap[rowId] } : r;
    });

    // Filters
    let filtered = merged;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) => v && String(v).toLowerCase().includes(q))
      );
    }

    if (startDate) {
      filtered = filtered.filter((r) => {
        const d = r.sale_date || r.travel_start_date || r.date;
        return d && d >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((r) => {
        const d = r.sale_date || r.travel_start_date || r.date;
        return d && d <= endDate;
      });
    }

    if (paymentStatusFilter !== 'All') {
      filtered = filtered.filter((r) => r.payment_status === paymentStatusFilter);
    }

    // Sorting
    if (sortCol) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortCol] ?? '';
        const valB = b[sortCol] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        return sortDir === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return filtered;
  }, [selectedDataset, salesRecords, tadaClaims, companyNotes, monthlyBudget, searchTerm, startDate, endDate, paymentStatusFilter, sortCol, sortDir, manualRows, editedRowsMap]);

  // Headers for current selection
  const activeHeaders = useMemo(() => {
    const allCols = DATASET_COLUMNS[selectedDataset] || MASTER_COLUMNS;
    return allCols.filter((col) => selectedColumns.includes(col.key));
  }, [selectedDataset, selectedColumns]);

  // Summary KPI Metrics
  const summaryMetrics = useMemo(() => {
    const totalSales = tableData.reduce((sum, r) => sum + (Number(r.sale_value || r.amount_bdt) || 0), 0);
    const totalPaid = tableData.reduce((sum, r) => sum + (Number(r.paid_amount) || 0), 0);
    const totalDue = tableData.reduce((sum, r) => sum + (Number(r.due_amount) || 0), 0);
    const realizationRate = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

    return { totalSales, totalPaid, totalDue, realizationRate };
  }, [tableData]);

  // Download Custom Excel
  const handleDownloadCustomExcel = () => {
    const headers = activeHeaders.map((h) => h.label);
    const rows = tableData.map((row) => {
      return activeHeaders.map((col) => {
        const val = row[col.key];
        return val !== undefined && val !== null ? val : '—';
      });
    });

    exportToExcel({
      filename: `Carelink_Sales_Spreadsheet_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Sales Sheet',
      headers,
      rows,
    });
  };

  // Download Custom PDF
  const handleDownloadCustomPDF = () => {
    const headers = activeHeaders.map((h) => h.label);
    const rows = tableData.map((row) => {
      return activeHeaders.map((col) => {
        const val = row[col.key];
        if (col.isNumeric && typeof val === 'number') {
          return val.toLocaleString();
        }
        return val !== undefined && val !== null ? String(val) : '—';
      });
    });

    exportToPDF({
      filename: `Carelink_Sales_Report_${new Date().toISOString().split('T')[0]}`,
      title: 'Carelink Healthineers — Executive Sales & Operations Spreadsheet',
      subtitle: `Official Corporate Statement · ${tableData.length} Records · Generated ${new Date().toLocaleDateString()}`,
      headers,
      rows,
    });
  };

  return (
    <div className="space-y-4 w-full">
      {/* TOP VIEW SWITCHER: SPREADSHEET VS MY SAVED SHEETS PAGE */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewTab('sheet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'sheet'
                ? 'bg-[#0f9d58] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Active Excel Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveViewTab('saved-sheets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'saved-sheets'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderOpen size={16} />
            <span>My Saved Sheets (আমার সংরক্ষিত শিট)</span>
            {presets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-200 text-indigo-950 font-black">
                {presets.length}
              </span>
            )}
          </button>
        </div>

        {/* RESTORE / UNDO (CTRL + Z) BUTTON */}
        <button
          onClick={handleUndo}
          disabled={historyStack.length === 0}
          className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Restore previous edit (Ctrl + Z)"
        >
          <Undo2 size={14} className="text-amber-700" />
          <span>Restore (Ctrl + Z)</span>
        </button>
      </div>

      {/* VIEW PAGE 1: MY SAVED SHEETS PAGE */}
      {activeViewTab === 'saved-sheets' ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FolderOpen className="text-indigo-600" size={22} />
                <span>My Saved Sheets Portal (আমার সংরক্ষিত শিটসমূহ)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, open, export, or delete your saved custom Excel sheet layouts.
              </p>
            </div>

            <button
              onClick={() => setShowSavePresetModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Bookmark size={15} />
              <span>Save Current Layout</span>
            </button>
          </div>

          {presets.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-3">
              <FolderOpen size={36} className="text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No saved sheets in your portal yet.</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Customize columns in your spreadsheet and click &quot;Save Sheet&quot; to save custom portal views here.
              </p>
              <button
                onClick={() => setActiveViewTab('sheet')}
                className="px-4 py-2 bg-[#0f9d58] text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <FileSpreadsheet size={15} />
                <span>Open Active Spreadsheet</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all space-y-4 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {preset.dataset} Sheet
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {preset.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleRemoveSheet(preset.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete saved sheet"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1 font-mono">
                    <div>Included Columns: <strong className="text-slate-800">{preset.columns.length} columns</strong></div>
                    <div>Created Date: <strong className="text-slate-700">{preset.created_at ? preset.created_at.split('T')[0] : '—'}</strong></div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center transition-colors cursor-pointer"
                    >
                      Open Sheet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW PAGE 2: ACTIVE SPREADSHEET GRID */
        <>
          {/* 1. GOOGLE SHEETS EXECUTIVE TOOLBAR (GREEN HEADER) */}
          <div className="bg-[#0f9d58] text-white p-4 lg:p-5 rounded-3xl shadow-md space-y-4 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#0f9d58] flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  📊
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Carelink Google Sheets Terminal</span>
                    <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono uppercase">Full Display</span>
                  </h2>
                  <p className="text-xs text-emerald-100">
                    Live Google Sheets experience: Auto-calculated due balances, Ctrl+Z restore, inline editing &amp; export.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-600"
                  title="Import CSV File"
                >
                  <Upload size={14} />
                  <span>Import CSV</span>
                </button>

                <button
                  onClick={() => setShowAddRowModal(true)}
                  className="px-3.5 py-2 bg-white text-[#0f9d58] hover:bg-emerald-50 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  <span>+ Add Row</span>
                </button>

                <button
                  onClick={() => setShowSavePresetModal(true)}
                  className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-600"
                >
                  <Bookmark size={14} />
                  <span>Save Sheet</span>
                </button>

                <button
                  onClick={handleDownloadCustomExcel}
                  className="px-4 py-2 bg-white text-[#0f9d58] hover:bg-emerald-50 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handleDownloadCustomPDF}
                  className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* GOOGLE SHEETS FORMULA BAR (`fx`) WITH LIVE INLINE CELL EDITING */}
            <div className="flex items-center gap-2 bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs shadow-inner">
              <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded text-[11px] shrink-0">
                {selectedCell
                  ? `${EXCEL_COL_LETTERS[activeHeaders.findIndex((h) => h.key === selectedCell.colKey)] || 'A'}${selectedCell.rowIdx + 1}`
                  : 'A1'}
              </span>
              <span className="font-serif italic font-bold text-slate-400 text-sm shrink-0">fx</span>
              <div className="w-px h-4 bg-slate-300 shrink-0" />
              <input
                type="text"
                placeholder={selectedCell ? 'Type here to edit cell value directly...' : 'Click any cell to edit...'}
                value={selectedCell ? editingCellVal : ''}
                onChange={(e) => handleCellEditChange(e.target.value)}
                disabled={!selectedCell}
                className="w-full bg-transparent font-mono text-slate-900 font-semibold focus:outline-hidden text-xs"
              />
              {selectedCell && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                  Cell Active (Editing)
                </span>
              )}
            </div>
          </div>

          {/* 2. SUMMARY KPI CALCULATIONS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Sales Value</span>
              <div className="text-xl font-black font-mono text-slate-900">
                ৳{summaryMetrics.totalSales.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">{tableData.length} records active</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Total Cash Paid</span>
              <div className="text-xl font-black font-mono text-emerald-600">
                ৳{summaryMetrics.totalPaid.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">{summaryMetrics.realizationRate}% Cash Realized</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Total Due Balance (Auto)</span>
              <div className="text-xl font-black font-mono text-amber-600">
                ৳{summaryMetrics.totalDue.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Auto Computed Balance</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">Filtered Records</span>
              <div className="text-xl font-black text-indigo-600">{tableData.length} Rows</div>
              <span className="text-[10px] text-slate-500">Live Auto-Sum Grid</span>
            </div>
          </div>

          {/* 3. FILTERS, SEARCH, & DATE RANGE BAR */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* Sheet Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 mr-1">
                  Select Sheet:
                </span>

                <button
                  onClick={() => handleSelectDataset('sales')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedDataset === 'sales'
                      ? 'bg-[#0f9d58] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Equipment & Hospital Sales
                </button>

                <button
                  onClick={() => handleSelectDataset('tada')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedDataset === 'tada'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Employee TA/DA Claims
                </button>

                <button
                  onClick={() => handleSelectDataset('hishab')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedDataset === 'hishab'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Total Hishab
                </button>

                <button
                  onClick={() => handleSelectDataset('blank')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedDataset === 'blank'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  ✨ Custom Blank Sheet
                </button>
              </div>

              {/* Search Box */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex-1 min-w-[220px]">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Hospital, Doctor, Product, Serial, District..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent focus:outline-hidden text-slate-800"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Date Range & Payment Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                  <Calendar size={13} className="text-slate-400" />
                  <span className="text-[11px] text-slate-500 font-medium">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                  <Calendar size={13} className="text-slate-400" />
                  <span className="text-[11px] text-slate-500 font-medium">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Clear Dates
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                  <Filter size={13} className="text-slate-400" />
                  <span className="text-[11px] text-slate-500 font-medium">Payment:</span>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="full_paid">Full Paid</option>
                    <option value="partial">Partial</option>
                    <option value="due">Full Due</option>
                  </select>
                </div>
              </div>
            </div>

            {/* COLUMN CUSTOMIZER CHECKLIST */}
            <div className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Table size={14} className="text-[#0f9d58]" />
                  <span>Select Columns to Include in Excel ({selectedColumns.length} Active)</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedColumns(MASTER_COLUMNS.map((c) => c.key))}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => handleRemoveSheet()}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear Added Rows</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(DATASET_COLUMNS[selectedDataset] || MASTER_COLUMNS).map((col) => {
                  const isSelected = selectedColumns.includes(col.key);
                  return (
                    <button
                      key={col.key}
                      onClick={() => handleToggleColumn(col.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-2 border-[#0f9d58] text-emerald-950 shadow-2xs'
                          : 'bg-white/60 border border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? <CheckSquare size={13} className="text-[#0f9d58]" /> : <Square size={13} />}
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. THE GOOGLE SHEETS SPREADSHEET GRID (FULL DISPLAY WIDTH) */}
          <div className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden font-sans w-full">
            {/* Google Sheets Tab Bar */}
            <div className="bg-[#f8f9fa] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-t-lg bg-white border-t-2 border-t-[#0f9d58] border-x border-slate-300 font-bold text-emerald-900 text-[11px] shadow-2xs flex items-center gap-1.5">
                  <span>Sheet1</span>
                  <span className="text-[10px] text-slate-400">({tableData.length} Rows)</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setShowAddRowModal(true)}
                  className="px-2.5 py-1 bg-[#0f9d58] hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add Row</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[620px] w-full">
              <table className="w-full text-left border-collapse text-xs select-none">
                {/* Column Header Letters A, B, C, D... */}
                <thead>
                  <tr className="bg-[#f1f3f4] border-b border-slate-300 text-slate-600 font-mono text-[10px] text-center">
                    <th className="w-12 border-r border-slate-300 py-1.5 bg-[#e8eaed] font-bold text-slate-500">
                      #
                    </th>
                    {activeHeaders.map((col, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleHeaderClick(col.key)}
                        className="border-r border-slate-300 py-1.5 px-3 font-bold text-slate-700 hover:bg-slate-300/80 cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>{EXCEL_COL_LETTERS[idx] || String.fromCharCode(65 + idx)}</span>
                          {sortCol === col.key && (
                            <ArrowUpDown size={11} className="text-emerald-700" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-12 border-r border-slate-300 py-1.5 bg-[#e8eaed] font-bold text-slate-400">
                      del
                    </th>
                  </tr>

                  {/* Data Header Labels */}
                  <tr className="bg-[#f8f9fa] border-b-2 border-slate-300 text-slate-800 font-extrabold text-[11px]">
                    <th className="py-2 px-3 text-center border-r border-slate-300 text-slate-400 font-mono">
                      Rows
                    </th>
                    {activeHeaders.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleHeaderClick(col.key)}
                        className={`py-2 px-4 border-r border-slate-300 whitespace-nowrap bg-slate-50/80 cursor-pointer hover:bg-emerald-50/50 ${
                          col.isNumeric ? 'text-right' : 'text-left'
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="py-2 px-2 text-center border-r border-slate-300 text-slate-400">
                      Clear
                    </th>
                  </tr>
                </thead>

                {/* Grid Rows */}
                <tbody className="divide-y divide-slate-200 font-medium bg-white">
                  {tableData.map((row, rowIdx) => (
                    <tr key={row.id || rowIdx} className="hover:bg-emerald-50/30 transition-colors">
                      {/* Row Number */}
                      <td className="py-2 px-3 text-center border-r border-slate-300 bg-[#f8f9fa] font-mono text-slate-500 text-[11px] font-bold">
                        {rowIdx + 1}
                      </td>

                      {/* Editable Grid Cells */}
                      {activeHeaders.map((col) => {
                        const val = row[col.key];
                        const isNum = col.isNumeric && typeof val === 'number';
                        const isSelected = selectedCell?.rowIdx === rowIdx && selectedCell?.colKey === col.key;

                        return (
                          <td
                            key={col.key}
                            onClick={() => handleCellSelect(rowIdx, col.key, val)}
                            className={`py-2.5 px-4 border-r border-slate-200 whitespace-nowrap cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-100/90 ring-2 ring-[#0f9d58] font-bold text-emerald-950'
                                : 'text-slate-800 hover:bg-slate-50'
                            } ${col.isNumeric ? 'text-right font-mono' : 'text-left'}`}
                          >
                            {isNum ? (
                              <span className={val < 0 ? 'text-rose-600 font-bold' : ''}>
                                {col.label.includes('BDT') ? `৳${val.toLocaleString()}` : val.toLocaleString()}
                              </span>
                            ) : val !== undefined && val !== null ? (
                              String(val)
                            ) : (
                              '—'
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        {row.id && (String(row.id).startsWith('manual-row-') || String(row.id).startsWith('imported-row-')) && (
                          <button
                            onClick={() => handleDeleteManualRow(row.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Remove row from sheet"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {tableData.length === 0 && (
                    <tr>
                      <td
                        colSpan={activeHeaders.length + 2}
                        className="py-12 text-center text-slate-400 italic bg-white"
                      >
                        This Google Sheet is currently empty. Click &quot;+ Add Row&quot; above to type data directly.
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Total Auto-Sum Row */}
                {tableData.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#f1f3f4] border-t-2 border-slate-400 font-black text-slate-900 text-xs">
                      <td className="py-2.5 px-3 text-center border-r border-slate-300 bg-[#e8eaed] font-mono text-emerald-800 font-bold">
                        Σ
                      </td>
                      {activeHeaders.map((col, idx) => {
                        if (idx === 0) {
                          return (
                            <td key={col.key} className="py-2.5 px-4 border-r border-slate-300 uppercase font-mono">
                              SUM ({tableData.length} Rows)
                            </td>
                          );
                        }

                        if (col.isNumeric) {
                          const sum = tableData.reduce((acc, row) => acc + (Number(row[col.key]) || 0), 0);
                          return (
                            <td
                              key={col.key}
                              className="py-2.5 px-4 text-right font-mono text-emerald-900 border-r border-slate-300 font-black"
                            >
                              {col.label.includes('BDT') ? `৳${sum.toLocaleString()}` : sum.toLocaleString()}
                            </td>
                          );
                        }

                        return <td key={col.key} className="border-r border-slate-200"></td>;
                      })}
                      <td className="border-r border-slate-300"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: ADD MANUAL ROW WITH AUTO DUE BALANCE CALCULATION */}
      {showAddRowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="text-[#0f9d58]" size={18} />
                <span>Add Row Data (Auto Due Balance Calculated)</span>
              </h3>
              <button
                onClick={() => setShowAddRowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddManualRow} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Center Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Medical College Hospital"
                    value={newRowData.hospital_center_name || ''}
                    onChange={(e) => updateNewRowField('hospital_center_name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. M. A. Rahman"
                    value={newRowData.doctor_name || ''}
                    onChange={(e) => updateNewRowField('doctor_name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Equipment / Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dürr Dental Chair"
                    value={newRowData.product_name || ''}
                    onChange={(e) => updateNewRowField('product_name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model / Serial</label>
                  <input
                    type="text"
                    placeholder="e.g. Model C3 Premium"
                    value={newRowData.product_model || ''}
                    onChange={(e) => updateNewRowField('product_model', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={newRowData.sale_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateNewRowField('sale_date', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka"
                    value={newRowData.location_district || ''}
                    onChange={(e) => updateNewRowField('location_district', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Value / Price (BDT) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 450000"
                    value={newRowData.sale_value || ''}
                    onChange={(e) => updateNewRowField('sale_value', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={newRowData.payment_status || 'full_paid'}
                    onChange={(e) => updateNewRowField('payment_status', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold"
                  >
                    <option value="full_paid">Full Paid</option>
                    <option value="partial">Partial / Advance</option>
                    <option value="due">Full Due</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid Amount (BDT)</label>
                  <input
                    type="number"
                    placeholder="Amount paid"
                    value={newRowData.paid_amount || ''}
                    onChange={(e) => updateNewRowField('paid_amount', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* AUTO-CALCULATED DUE BALANCE BOX */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Auto-Calculated Due Balance (স্বয়ংক্রিয় বকেয়া):</span>
                <span className="font-mono font-black text-amber-950 text-base">
                  ৳{Math.max(0, (Number(newRowData.sale_value) || 0) - (Number(newRowData.paid_amount) || 0)).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Location Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi, Dhaka. Delivered with 1 year warranty."
                  value={newRowData.notes || ''}
                  onChange={(e) => updateNewRowField('notes', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddRowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Add Row to Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SAVE SHEET PRESET */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bookmark className="text-[#0f9d58]" size={18} />
                <span>Save Google Sheet Layout</span>
              </h3>
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Save this customized layout and column selection in your portal to open anytime under My Saved Sheets.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Preset Sheet Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hospital Sales & Payment Ledger"
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div>Columns: <span className="font-bold text-slate-800">{selectedColumns.length} columns selected</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingPreset || !presetNameInput.trim()}
                onClick={handleSaveCurrentPreset}
                className="px-5 py-2 bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {isSavingPreset ? 'Saving...' : 'Save Sheet Layout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
