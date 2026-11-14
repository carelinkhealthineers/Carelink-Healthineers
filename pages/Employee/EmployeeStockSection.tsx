import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Boxes,
  Layers,
  Plus,
  Minus,
  X,
  Loader2,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import { Employee, StockRequest } from '../../types';
import {
  EmployeeStockCatalogItem,
  fetchEmployeeStockCatalog,
  fetchStockSegments,
  fetchStockRequestsForEmployee,
  createStockRequest,
  employeeCreateStockItem,
  subscribeToStockSync,
} from '../../services/executiveService';

interface EmployeeStockSectionProps {
  employee: Employee;
  onToast: (msg: string) => void;
}

export const EmployeeStockSection: React.FC<EmployeeStockSectionProps> = ({
  employee,
  onToast,
}) => {
  const [catalog, setCatalog] = useState<EmployeeStockCatalogItem[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [myRequests, setMyRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [viewTab, setViewTab] = useState<'catalog' | 'requests'>('catalog');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Request Modal State
  const [requestTarget, setRequestTarget] = useState<EmployeeStockCatalogItem | null>(null);
  const [requestedQty, setRequestedQty] = useState<number>(1);
  const [purposeInput, setPurposeInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Add Purchased Stock Item Modal State (for employee field purchase like electronics)
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [addStockError, setAddStockError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'Electronics',
    quantity: 1,
    unit_label: 'pcs',
    buying_price: 0,
    supplier_name: '',
    notes: '',
    add_to_expense: true,
  });

  const handleEmployeeAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddStockError('Please enter item name.');
      return;
    }
    const qty = Math.max(1, Number(addForm.quantity) || 1);
    const price = Math.max(0, Number(addForm.buying_price) || 0);

    setIsAddingStock(true);
    setAddStockError(null);
    try {
      await employeeCreateStockItem(
        {
          name: addForm.name.trim(),
          category: addForm.category.trim() || 'Electronics',
          quantity: qty,
          unit_label: addForm.unit_label.trim() || 'pcs',
          buying_price: price,
          supplier_name: addForm.supplier_name.trim(),
          notes: addForm.notes.trim(),
          add_to_expense: addForm.add_to_expense,
        },
        employee
      );

      setIsAddStockOpen(false);
      setAddForm({
        name: '',
        category: 'Electronics',
        quantity: 1,
        unit_label: 'pcs',
        buying_price: 0,
        supplier_name: '',
        notes: '',
        add_to_expense: true,
      });
      onToast(`Added "${addForm.name}" to stock & expense logs successfully.`);
      await loadData(true);
    } catch (err: any) {
      setAddStockError(err?.message || 'Failed to add stock item.');
    } finally {
      setIsAddingStock(false);
    }
  };

  const loadData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const [items, segs, reqs] = await Promise.all([
          fetchEmployeeStockCatalog(),
          fetchStockSegments().catch(() => []),
          fetchStockRequestsForEmployee(employee.id).catch(() => []),
        ]);
        setCatalog(items);
        setSegments(segs);
        setMyRequests(reqs);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [employee.id]
  );

  useEffect(() => {
    loadData(false);
    const unsub = subscribeToStockSync(() => {
      loadData(true);
    });
    return unsub;
  }, [loadData]);

  // Unique segment tabs combining saved segments + item categories
  const segmentOptions = useMemo(() => {
    const map = new Map<string, string>();
    segments.forEach((s) => {
      const clean = s.trim();
      if (clean && !map.has(clean.toLowerCase())) {
        map.set(clean.toLowerCase(), clean);
      }
    });
    catalog.forEach((item) => {
      const clean = (item.category || '').trim();
      if (clean && !map.has(clean.toLowerCase())) {
        map.set(clean.toLowerCase(), clean);
      }
    });
    return Array.from(map.values());
  }, [segments, catalog]);

  const filteredCatalog = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesSeg =
        selectedSegment === 'ALL' ||
        (item.category || '').trim().toLowerCase() === selectedSegment.toLowerCase();
      if (!matchesSeg) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        (item.sku_or_model || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term)
      );
    });
  }, [catalog, selectedSegment, searchTerm]);

  const stats = useMemo(() => {
    const totalUnits = catalog.reduce((sum, i) => sum + i.quantity, 0);
    const inStockProducts = catalog.filter((i) => i.quantity > 0).length;
    const pendingCount = myRequests.filter((r) => r.status === 'pending').length;
    const approvedCount = myRequests.filter((r) => r.status === 'approved').length;
    return { totalUnits, inStockProducts, pendingCount, approvedCount };
  }, [catalog, myRequests]);

  const openRequestModal = (item: EmployeeStockCatalogItem) => {
    setRequestTarget(item);
    setRequestedQty(item.quantity > 0 ? 1 : 0);
    setPurposeInput('');
    setModalError(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTarget) return;

    setModalError(null);
    const qty = Math.floor(Number(requestedQty) || 0);
    if (qty <= 0) {
      setModalError('Please request at least 1 piece.');
      return;
    }
    if (qty > requestTarget.quantity) {
      setModalError(`Only ${requestTarget.quantity} ${requestTarget.unit_label} available in stock.`);
      return;
    }
    if (!purposeInput.trim()) {
      setModalError('Please enter where or why you need this stock item.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createStockRequest(
        {
          stock_item_id: requestTarget.id,
          requested_qty: qty,
          purpose: purposeInput.trim(),
        },
        employee
      );
      setMyRequests((prev) => [created, ...prev]);
      setRequestTarget(null);
      onToast(`Requested ${qty} ${created.unit_label} of ${created.stock_item_name} for executive approval.`);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to submit stock request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 rounded-3xl bg-[#0e1422] border border-[#1c2638] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 size={26} className="animate-spin text-blue-400" />
        <span className="text-xs font-medium">Loading available stock products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Stock Products &amp; Pcs Request
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              View available product quantities and request pcs needed for field work or clients. Executive approval updates stock automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsAddStockOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <Plus size={14} />
            <span>Add Purchased Item</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-400' : 'text-blue-400'} />
            <span>Refresh Stock</span>
          </button>
        </div>
      </section>

      {/* Summary Cards (No prices — quantity & request status only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-[#1c2638] flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Available Products</div>
            <div className="text-2xl font-extrabold text-white mt-0.5 tabular-nums">
              {stats.inStockProducts}
              <span className="text-xs font-normal text-slate-500 ml-1">/ {catalog.length}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
            <Package size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1422] border border-[#1c2638] flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Total Stock Qty</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-0.5 tabular-nums">
              {stats.totalUnits.toLocaleString()}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-400 flex items-center justify-center shrink-0">
            <Boxes size={16} />
          </div>
        </div>

        <div
          onClick={() => setViewTab('requests')}
          className="p-4 rounded-2xl bg-[#0e1422] border border-[#1c2638] hover:border-amber-500/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
        >
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Pending Approval</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5 tabular-nums">
              {stats.pendingCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={16} />
          </div>
        </div>

        <div
          onClick={() => setViewTab('requests')}
          className="p-4 rounded-2xl bg-[#0e1422] border border-[#1c2638] hover:border-emerald-500/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
        >
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Approved Requests</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5 tabular-nums">
              {stats.approvedCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 rounded-2xl bg-[#0e1422] border border-[#1c2638] text-xs self-start">
          <button
            type="button"
            onClick={() => setViewTab('catalog')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Stock Catalog ({catalog.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('requests')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewTab === 'requests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList size={14} />
            <span>My Requests ({myRequests.length})</span>
            {stats.pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                {stats.pendingCount}
              </span>
            )}
          </button>
        </div>

        {viewTab === 'catalog' && (
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, segment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0e1422] border border-[#1c2638] focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* VIEW 1: STOCK CATALOG (AMOUNT ONLY, NO PRICES) */}
      {viewTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Segment Filter Chips */}
          {segmentOptions.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedSegment('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSegment === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0e1422] text-slate-400 border border-[#1c2638] hover:text-white'
                }`}
              >
                All Segments
              </button>
              {segmentOptions.map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setSelectedSegment(seg)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    selectedSegment.toLowerCase() === seg.toLowerCase()
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0e1422] text-slate-400 border border-[#1c2638] hover:text-white'
                  }`}
                >
                  <Layers size={12} />
                  <span>{seg}</span>
                </button>
              ))}
            </div>
          )}

          {filteredCatalog.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0e1422] border border-[#1c2638] text-center space-y-2">
              <Package size={32} className="mx-auto text-slate-600" />
              <div className="text-sm font-bold text-slate-300">No Stock Products Found</div>
              <p className="text-xs text-slate-500">
                Try clearing your search or selecting a different segment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((item) => {
                const isOut = item.quantity <= 0;
                const isLow = item.quantity > 0 && item.quantity <= 3;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#0e1422] border border-[#1c2638] hover:border-blue-500/40 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {item.picture_url ? (
                        <img
                          src={item.picture_url}
                          alt={item.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0 bg-slate-900"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <Package size={22} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {item.category && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-semibold text-slate-300">
                              {item.category}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              isOut
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                                : isLow
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Available'}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white leading-snug truncate" title={item.name}>
                          {item.name}
                        </h3>
                        {item.sku_or_model && (
                          <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                            Model / SKU: {item.sku_or_model}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Amount + Request Button (Strictly NO Prices) */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                          In Stock
                        </span>
                        <span
                          className={`text-xl font-black font-mono tabular-nums ${
                            isOut
                              ? 'text-rose-400'
                              : isLow
                              ? 'text-amber-300'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.quantity}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            {item.unit_label}
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => openRequestModal(item)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isOut
                            ? 'bg-slate-800/60 text-slate-500 border border-white/5 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 cursor-pointer active:scale-95'
                        }`}
                      >
                        <Send size={13} />
                        <span>{isOut ? 'Unavailable' : 'Ask for Pcs'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: MY STOCK REQUESTS */
        <div className="rounded-3xl bg-[#0e1422] border border-[#1c2638] overflow-hidden">
          <div className="p-5 border-b border-[#1c2638] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">My Stock Pcs Requests</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Track executive approval status. Once approved, stock pcs are deducted automatically.
              </p>
            </div>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-xs text-slate-400">
              <ClipboardList size={30} className="mx-auto text-slate-600" />
              <p>You haven&apos;t requested any stock pcs yet.</p>
              <button
                type="button"
                onClick={() => setViewTab('catalog')}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                Browse Stock Catalog
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {req.stock_item_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-mono font-bold">
                        {req.requested_qty} {req.unit_label}
                      </span>
                      {req.stock_item_category && (
                        <span className="text-[11px] text-slate-400">
                          · {req.stock_item_category}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300">
                      Purpose: <span className="text-slate-400">{req.purpose}</span>
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-mono">{req.created_at.slice(0, 10)}</span>
                      {req.reviewed_by && (
                        <span>
                          · Reviewed by <strong className="text-slate-300">{req.reviewed_by}</strong>
                        </span>
                      )}
                      {req.executive_remarks && (
                        <span className="text-sky-300">· Note: &ldquo;{req.executive_remarks}&rdquo;</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-center">
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Clock size={13} />
                        <span>Pending Executive</span>
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 size={13} />
                        <span>Approved &amp; Issued</span>
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                        <XCircle size={13} />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REQUEST PCS MODAL */}
      {requestTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border border-[#232f45] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Package size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Request Stock Pcs</h3>
                  <p className="text-[11px] text-slate-400">Sent to Executive for approval</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestTarget(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{requestTarget.name}</div>
                  {requestTarget.category && (
                    <div className="text-[11px] text-slate-400">{requestTarget.category}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Available</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {requestTarget.quantity} {requestTarget.unit_label}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  How many {requestTarget.unit_label} do you need? *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestedQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={requestTarget.quantity}
                    value={requestedQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setRequestedQty(Number.isNaN(val) ? 1 : Math.min(requestTarget.quantity, Math.max(1, val)));
                    }}
                    className="flex-1 text-center py-2.5 bg-[#090d14] border border-white/15 rounded-xl text-base font-mono font-bold text-white outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRequestedQty((q) => Math.min(requestTarget.quantity, q + 1))
                    }
                    className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Hospital / Client / Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Delivery to Popular Diagnostic Center or replacement during field service"
                  value={purposeInput}
                  onChange={(e) => setPurposeInput(e.target.value)}
                  className="w-full p-3 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none resize-none"
                />
              </div>

              {modalError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestTarget(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Purchased Stock Item Modal */}
      {isAddStockOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsAddStockOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0e1422] border border-[#232f45] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Package size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Purchased Stock Item</h3>
                  <p className="text-[11px] text-slate-400">Record field purchases (electronics, parts, tools)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStockOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEmployeeAddStock} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dürr Dental Sensor Cable"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Category / Segment</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none text-xs"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Tools">Tools</option>
                    <option value="Consumables">Consumables</option>
                    <option value="General Equipment">General Equipment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Unit Label</label>
                  <input
                    type="text"
                    value={addForm.unit_label}
                    onChange={(e) => setAddForm({ ...addForm, unit_label: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Buying Price (Tk) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={addForm.buying_price}
                    onChange={(e) => setAddForm({ ...addForm, buying_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Supplier / Store Name</label>
                <input
                  type="text"
                  placeholder="e.g. local supplier or market store"
                  value={addForm.supplier_name}
                  onChange={(e) => setAddForm({ ...addForm, supplier_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. purchased urgently for client site repair"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-[#090d14] border border-white/15 focus:border-blue-500 rounded-xl text-white outline-none text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add_to_expense"
                  checked={addForm.add_to_expense}
                  onChange={(e) => setAddForm({ ...addForm, add_to_expense: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <label htmlFor="add_to_expense" className="text-xs text-slate-300 cursor-pointer">
                  Log total cost (Tk {(addForm.quantity * addForm.buying_price).toLocaleString()}) to company expenses automatically
                </label>
              </div>

              {addStockError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{addStockError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingStock}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-60"
                >
                  {isAddingStock ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Add to Stock &amp; Expenses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
