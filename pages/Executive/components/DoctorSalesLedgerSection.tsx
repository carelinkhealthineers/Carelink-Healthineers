import React, { useState, useMemo } from 'react';
import {
  Building2,
  Stethoscope,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
  X,
  CreditCard,
  MapPin,
  Tag,
  BarChart3,
  PieChart as PieIcon,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ProductSaleRecord, SaleDeliveryStatus, SalePaymentStatus } from '../../../types';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface DoctorSalesLedgerSectionProps {
  salesRecords: ProductSaleRecord[];
  onAddSale: (newSale: any) => Promise<void>;
  onDeleteSale: (id: string) => Promise<void>;
  userName: string;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const DoctorSalesLedgerSection: React.FC<DoctorSalesLedgerSectionProps> = ({
  salesRecords,
  onAddSale,
  onDeleteSale,
  userName,
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPayment, setSelectedPayment] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Sale Form State
  const [formData, setFormData] = useState({
    product_name: '',
    product_model: '',
    doctor_name: '',
    hospital_center_name: '',
    location_district: 'Dhaka',
    sale_value: '',
    sale_date: new Date().toISOString().split('T')[0],
    quantity: '1',
    payment_status: 'full_paid' as SalePaymentStatus,
    paid_amount: '',
    due_amount: '0',
    delivery_status: 'installed' as SaleDeliveryStatus,
    warranty_period: '1 Year Full Warranty',
    notes: '',
  });

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return salesRecords.filter((record) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        record.product_name.toLowerCase().includes(q) ||
        (record.product_model && record.product_model.toLowerCase().includes(q)) ||
        record.doctor_name.toLowerCase().includes(q) ||
        record.hospital_center_name.toLowerCase().includes(q) ||
        (record.location_district && record.location_district.toLowerCase().includes(q));

      const matchesStatus =
        selectedStatus === 'All' || record.delivery_status === selectedStatus;

      const matchesPayment =
        selectedPayment === 'All' || record.payment_status === selectedPayment;

      const matchesMonth =
        selectedMonth === 'All' ||
        (record.sale_date && record.sale_date.startsWith(selectedMonth));

      return matchesSearch && matchesStatus && matchesPayment && matchesMonth;
    });
  }, [salesRecords, searchTerm, selectedStatus, selectedPayment, selectedMonth]);

  // Aggregated Totals
  const aggregates = useMemo(() => {
    const totalRevenue = filteredRecords.reduce((sum, r) => sum + (Number(r.sale_value) || 0), 0);
    const totalPaid = filteredRecords.reduce((sum, r) => sum + (Number(r.paid_amount) || 0), 0);
    const totalDue = filteredRecords.reduce((sum, r) => sum + (Number(r.due_amount) || 0), 0);
    const totalUnits = filteredRecords.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);

    return {
      totalRevenue,
      totalPaid,
      totalDue,
      totalUnits,
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  // Chart 1: Revenue by Doctor / Medical Center
  const centerChartData = useMemo(() => {
    const centerMap: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const name = r.hospital_center_name || r.doctor_name || 'Other';
      const shortName = name.length > 20 ? `${name.substring(0, 18)}...` : name;
      centerMap[shortName] = (centerMap[shortName] || 0) + (Number(r.sale_value) || 0);
    });

    return Object.entries(centerMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [filteredRecords]);

  // Chart 2: Product Equipment Distribution
  const productChartData = useMemo(() => {
    const productMap: Record<string, { value: number; count: number }> = {};
    filteredRecords.forEach((r) => {
      const name = r.product_name.length > 22 ? `${r.product_name.substring(0, 20)}...` : r.product_name;
      if (!productMap[name]) productMap[name] = { value: 0, count: 0 };
      productMap[name].value += Number(r.sale_value) || 0;
      productMap[name].count += Number(r.quantity) || 1;
    });

    return Object.entries(productMap)
      .map(([name, data]) => ({ name, value: data.value, count: data.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredRecords]);

  // Chart 3: Payment Status Breakdown Pie
  const paymentPieData = useMemo(() => {
    const paid = filteredRecords.filter((r) => r.payment_status === 'full_paid').length;
    const partial = filteredRecords.filter((r) => r.payment_status === 'partial').length;
    const due = filteredRecords.filter((r) => r.payment_status === 'due').length;

    return [
      { name: 'Full Paid', value: paid },
      { name: 'Partial / Advance', value: partial },
      { name: 'Due Receivable', value: due },
    ].filter((item) => item.value > 0);
  }, [filteredRecords]);

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name.trim() || !formData.doctor_name.trim() || !formData.hospital_center_name.trim()) {
      alert('Please fill in the Product Name, Doctor Name, and Hospital/Center Name.');
      return;
    }

    const saleVal = Number(formData.sale_value) || 0;
    let paid = Number(formData.paid_amount) || 0;
    if (formData.payment_status === 'full_paid') {
      paid = saleVal;
    }

    const due = Math.max(0, saleVal - paid);

    setIsSubmitting(true);
    try {
      await onAddSale({
        product_name: formData.product_name,
        product_model: formData.product_model,
        doctor_name: formData.doctor_name,
        hospital_center_name: formData.hospital_center_name,
        location_district: formData.location_district,
        sale_value: saleVal,
        sale_date: formData.sale_date,
        quantity: Number(formData.quantity) || 1,
        payment_status: formData.payment_status,
        paid_amount: paid,
        due_amount: due,
        delivery_status: formData.delivery_status,
        warranty_period: formData.warranty_period,
        recorded_by: userName || 'Executive Desk',
        notes: formData.notes,
      });

      setIsAddModalOpen(false);
      setFormData({
        product_name: '',
        product_model: '',
        doctor_name: '',
        hospital_center_name: '',
        location_district: 'Dhaka',
        sale_value: '',
        sale_date: new Date().toISOString().split('T')[0],
        quantity: '1',
        payment_status: 'full_paid',
        paid_amount: '',
        due_amount: '0',
        delivery_status: 'installed',
        warranty_period: '1 Year Full Warranty',
        notes: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'Sale Date',
      'Equipment / Product Name',
      'Model / Serial',
      'Doctor Name',
      'Hospital / Medical Center',
      'District / Location',
      'Qty',
      'Sale Value (BDT)',
      'Paid Amount (BDT)',
      'Due Amount (BDT)',
      'Payment Status',
      'Delivery Status',
      'Warranty Period',
      'Remarks',
    ];

    const rows: (string | number)[][] = filteredRecords.map((r) => [
      r.sale_date,
      r.product_name,
      r.product_model || '—',
      r.doctor_name,
      r.hospital_center_name,
      r.location_district,
      r.quantity || 1,
      r.sale_value,
      r.paid_amount || 0,
      r.due_amount || 0,
      r.payment_status === 'full_paid' ? 'Full Paid' : r.payment_status === 'partial' ? 'Partial' : 'Due',
      r.delivery_status,
      r.warranty_period || 'Standard',
      r.notes || '',
    ]);

    // Summary row
    rows.push([
      'TOTAL SUMMARY',
      `${aggregates.count} Orders`,
      '—',
      '—',
      '—',
      '—',
      aggregates.totalUnits,
      aggregates.totalRevenue,
      aggregates.totalPaid,
      aggregates.totalDue,
      '—',
      '—',
      '—',
      '—',
    ]);

    exportToExcel({
      filename: `Carelink_Doctor_Equipment_Sales_Ledger_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Doctor Sales',
      headers,
      rows,
    });
  };

  // Export to PDF
  const handleExportPDF = () => {
    const headers = [
      'Date',
      'Product / Equipment',
      'Doctor Name',
      'Hospital / Center',
      'Qty',
      'Value (BDT)',
      'Paid',
      'Status',
    ];

    const rows: (string | number)[][] = filteredRecords.map((r) => [
      r.sale_date,
      r.product_name,
      r.doctor_name,
      r.hospital_center_name,
      r.quantity || 1,
      `Tk ${r.sale_value.toLocaleString()}`,
      `Tk ${(r.paid_amount || 0).toLocaleString()}`,
      r.delivery_status,
    ]);

    exportToPDF({
      filename: `Carelink_Doctor_Equipment_Sales_Ledger_${new Date().toISOString().split('T')[0]}`,
      title: 'Carelink Healthineers — Medical Equipment Sales Ledger',
      subtitle: `Doctor & Hospital Distribution Register · Total Booked: Tk ${aggregates.totalRevenue.toLocaleString()} · MD / Board Review`,
      headers,
      rows,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="text-blue-600" size={22} />
            <span>Doctor & Medical Center Sales Ledger (পণ্য ও হাসপাতাল বিক্রয় হিসাব)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete track of which medical and dental equipment is sold or installed to which doctor, clinic, or hospital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Record New Equipment Sale</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet size={15} />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Download size={15} />
            <span>PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Equipment Sold Value
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{aggregates.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            {aggregates.count} orders · {aggregates.totalUnits} machines
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Cash Collected (Received)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            ৳{aggregates.totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {aggregates.totalRevenue > 0
              ? Math.round((aggregates.totalPaid / aggregates.totalRevenue) * 100)
              : 0}
            % Collection realization
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Due Receivables Pending
          </span>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">
            ৳{aggregates.totalDue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            From Doctors / Hospital accounts
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Installed & Under Warranty
          </span>
          <div className="text-2xl font-black font-mono text-indigo-600 mt-1">
            {filteredRecords.filter((r) => r.delivery_status === 'installed' || r.delivery_status === 'under_warranty').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Active in medical field service
          </span>
        </div>
      </div>

      {/* System Charts for Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales by Doctor / Hospital */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-600" />
                <span>Sales Value by Medical Center / Doctor</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Top purchasing hospitals, clinics, and doctors by booking value
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centerChartData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Total Value']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Product Equipment Models Sold */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Tag size={16} className="text-teal-600" />
                <span>Equipment Distribution (Top Products)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Revenue generated per equipment category and units installed
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[260px] bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by Doctor Name, Hospital, Clinic, Equipment..."
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 text-[11px]">Delivery:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="installed">Installed</option>
              <option value="delivered">Delivered</option>
              <option value="under_warranty">Under Warranty</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 text-[11px]">Payment:</span>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Payments</option>
              <option value="full_paid">Full Paid</option>
              <option value="partial">Partial</option>
              <option value="due">Due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Excel-like Spreadsheet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Equipment Sales Register ({filteredRecords.length} Transactions)</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Showing real-time records from Carelink database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4">Equipment & Model</th>
                <th className="py-3 px-4">Doctor Name</th>
                <th className="py-3 px-4">Hospital / Center Name</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-right">Value (BDT)</th>
                <th className="py-3 px-3 text-right">Paid (BDT)</th>
                <th className="py-3 px-3 text-right">Due (BDT)</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Warranty</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.map((sale, idx) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {sale.sale_date}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{sale.product_name}</div>
                    {sale.product_model && (
                      <div className="text-[11px] text-slate-500 font-mono">{sale.product_model}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-950 whitespace-nowrap">
                    {sale.doctor_name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {sale.hospital_center_name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {sale.location_district}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    ৳{sale.sale_value.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 whitespace-nowrap">
                    ৳{(sale.paid_amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-700 whitespace-nowrap">
                    ৳{(sale.due_amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                        sale.payment_status === 'full_paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.payment_status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sale.payment_status === 'full_paid'
                        ? 'Paid'
                        : sale.payment_status === 'partial'
                        ? 'Partial'
                        : 'Due'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                        sale.delivery_status === 'installed'
                          ? 'bg-blue-100 text-blue-800'
                          : sale.delivery_status === 'under_warranty'
                          ? 'bg-indigo-100 text-indigo-800'
                          : sale.delivery_status === 'delivered'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sale.delivery_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {sale.warranty_period}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Delete sale record for ${sale.doctor_name} (${sale.product_name})?`)) {
                          onDeleteSale(sale.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    No sales records matched the search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-extrabold text-slate-900">
                  <td colSpan={6} className="py-3.5 px-4 text-right uppercase text-[11px]">
                    Total Summary ({aggregates.count} Machines Sold):
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm font-black">
                    ৳{aggregates.totalRevenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-emerald-700 font-black">
                    ৳{aggregates.totalPaid.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-amber-700 font-black">
                    ৳{aggregates.totalDue.toLocaleString()}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL: RECORD NEW EQUIPMENT SALE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Record New Equipment Sale
                </h3>
                <p className="text-xs text-slate-500">
                  Log machine delivery, doctor name, hospital center, and payment details.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Equipment / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dürr VistaPano S 2.0"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Model / Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VP-804 / Unit SN-920"
                    value={formData.product_model}
                    onChange={(e) => setFormData({ ...formData, product_model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Doctor / Surgeon Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Md. Rafiqul Islam"
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Hospital / Dental Center *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Popular Diagnostic Centre"
                    value={formData.hospital_center_name}
                    onChange={(e) => setFormData({ ...formData, hospital_center_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    District / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka"
                    value={formData.location_district}
                    onChange={(e) => setFormData({ ...formData, location_district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sale Value / Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 450000"
                    value={formData.sale_value}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      const valNum = Number(valStr) || 0;
                      const paidNum = Number(formData.paid_amount) || 0;
                      let updatedPaid = paidNum;
                      if (formData.payment_status === 'full_paid') updatedPaid = valNum;
                      if (formData.payment_status === 'due') updatedPaid = 0;
                      const calculatedDue = Math.max(0, valNum - updatedPaid);

                      setFormData({
                        ...formData,
                        sale_value: valStr,
                        paid_amount: updatedPaid > 0 ? updatedPaid.toString() : (formData.payment_status === 'due' ? '0' : formData.paid_amount),
                        due_amount: calculatedDue.toString(),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => {
                      const status = e.target.value as SalePaymentStatus;
                      const saleVal = Number(formData.sale_value) || 0;
                      let paid = Number(formData.paid_amount) || 0;
                      if (status === 'full_paid') paid = saleVal;
                      if (status === 'due') paid = 0;
                      const due = Math.max(0, saleVal - paid);

                      setFormData({
                        ...formData,
                        payment_status: status,
                        paid_amount: paid.toString(),
                        due_amount: due.toString(),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="full_paid">Full Paid</option>
                    <option value="partial">Partial / Advance</option>
                    <option value="due">Full Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Paid Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Amount paid"
                    value={formData.paid_amount}
                    onChange={(e) => {
                      const paidStr = e.target.value;
                      const paidNum = Number(paidStr) || 0;
                      const saleVal = Number(formData.sale_value) || 0;
                      const calculatedDue = Math.max(0, saleVal - paidNum);

                      let newStatus: SalePaymentStatus = formData.payment_status;
                      if (paidNum >= saleVal && saleVal > 0) newStatus = 'full_paid';
                      else if (paidNum === 0) newStatus = 'due';
                      else if (paidNum < saleVal) newStatus = 'partial';

                      setFormData({
                        ...formData,
                        paid_amount: paidStr,
                        due_amount: calculatedDue.toString(),
                        payment_status: newStatus,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Auto Due Display Note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Auto-Calculated Due Balance:</span>
                <span className="font-mono font-black text-amber-950 text-sm">
                  ৳{Math.max(0, (Number(formData.sale_value) || 0) - (Number(formData.paid_amount) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Delivery / Installation Status
                  </label>
                  <select
                    value={formData.delivery_status}
                    onChange={(e) => setFormData({ ...formData, delivery_status: e.target.value as SaleDeliveryStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="installed">Installed & Operational</option>
                    <option value="delivered">Delivered to Site</option>
                    <option value="under_warranty">Under Active Warranty</option>
                    <option value="pending">Pending Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Year Comprehensive"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({ ...formData, warranty_period: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Installation / Commercial Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Calibration certificate issued. Next servicing in 90 days."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Sale Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
