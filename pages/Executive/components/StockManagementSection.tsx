import React, { useMemo, useRef, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Upload,
  Trash2,
  Edit3,
  X,
  Minus,
  ShoppingBag,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Check,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  FolderOpen,
  Layers,
  Boxes,
  Wallet,
  Receipt,
  ArrowRight,
  Sparkles,
  Scissors,
  Cpu,
  BriefcaseMedical,
  Stethoscope,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import { StockItem, StockRequest } from '../../../types';
import { CreateStockItemInput, RestockInput } from '../../../services/executiveService';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface StockManagementSectionProps {
  stockItems: StockItem[];
  stockSegments: string[];
  stockRequests?: StockRequest[];
  onApproveStockRequest?: (requestId: string, remarks?: string) => Promise<void>;
  onRejectStockRequest?: (requestId: string, remarks?: string) => Promise<void>;
  onAddSegment: (segmentName: string) => Promise<void>;
  onDeleteSegment?: (segmentName: string) => Promise<void>;
  onClearEmptySegments?: (usedSegmentNames: string[]) => Promise<void>;
  onCreateStock: (input: CreateStockItemInput) => Promise<void>;
  onRestockItem: (id: string, input: RestockInput) => Promise<void>;
  onUpdateStock: (id: string, updates: Partial<StockItem>) => Promise<void>;
  onDeleteStock: (id: string, alsoDeleteExpenses: boolean) => Promise<void>;
}

type StockFilterMode = 'all' | 'in_stock' | 'low_out';
type ViewLayoutMode = 'cards' | 'table';

const ALL_SEGMENTS_KEY = '__ALL__';
const UNCATEGORIZED_KEY = 'Uncategorized';

const SEGMENT_ACCENTS = [
  {
    cardBg: 'bg-gradient-to-br from-sky-50/90 via-white to-blue-50/70',
    border: 'border-sky-200/80 hover:border-sky-300',
    shadow: 'hover:shadow-sky-200/50',
    bubble: 'bg-sky-200/35',
    iconBg: 'bg-white text-sky-600 border-sky-100 shadow-sky-100/80',
    titleHover: 'group-hover:text-sky-700',
    actionText: 'text-sky-600',
    pricePill: 'bg-sky-50/90 text-sky-900 border-sky-200/70',
  },
  {
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70',
    border: 'border-rose-200/80 hover:border-rose-300',
    shadow: 'hover:shadow-rose-200/50',
    bubble: 'bg-rose-200/35',
    iconBg: 'bg-white text-rose-500 border-rose-100 shadow-rose-100/80',
    titleHover: 'group-hover:text-rose-700',
    actionText: 'text-rose-600',
    pricePill: 'bg-rose-50/90 text-rose-900 border-rose-200/70',
  },
  {
    cardBg: 'bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70',
    border: 'border-violet-200/80 hover:border-violet-300',
    shadow: 'hover:shadow-violet-200/50',
    bubble: 'bg-violet-200/35',
    iconBg: 'bg-white text-violet-600 border-violet-100 shadow-violet-100/80',
    titleHover: 'group-hover:text-violet-700',
    actionText: 'text-violet-600',
    pricePill: 'bg-violet-50/90 text-violet-900 border-violet-200/70',
  },
  {
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70',
    border: 'border-emerald-200/80 hover:border-emerald-300',
    shadow: 'hover:shadow-emerald-200/50',
    bubble: 'bg-emerald-200/35',
    iconBg: 'bg-white text-emerald-600 border-emerald-100 shadow-emerald-100/80',
    titleHover: 'group-hover:text-emerald-700',
    actionText: 'text-emerald-600',
    pricePill: 'bg-emerald-50/90 text-emerald-900 border-emerald-200/70',
  },
  {
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70',
    border: 'border-amber-200/80 hover:border-amber-300',
    shadow: 'hover:shadow-amber-200/50',
    bubble: 'bg-amber-200/35',
    iconBg: 'bg-white text-amber-600 border-amber-100 shadow-amber-100/80',
    titleHover: 'group-hover:text-amber-700',
    actionText: 'text-amber-600',
    pricePill: 'bg-amber-50/90 text-amber-900 border-amber-200/70',
  },
  {
    cardBg: 'bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/70',
    border: 'border-cyan-200/80 hover:border-cyan-300',
    shadow: 'hover:shadow-cyan-200/50',
    bubble: 'bg-cyan-200/35',
    iconBg: 'bg-white text-cyan-600 border-cyan-100 shadow-cyan-100/80',
    titleHover: 'group-hover:text-cyan-700',
    actionText: 'text-cyan-600',
    pricePill: 'bg-cyan-50/90 text-cyan-900 border-cyan-200/70',
  },
];

function getCuteSegmentIcon(segmentName: string) {
  const lower = segmentName.toLowerCase();
  if (lower.includes('electr') || lower.includes('device') || lower.includes('machine') || lower.includes('cable')) {
    return <Cpu size={20} />;
  }
  if (lower.includes('scissor') || lower.includes('tool') || lower.includes('instrument') || lower.includes('forcep')) {
    return <Scissors size={20} />;
  }
  if (lower.includes('kit') || lower.includes('box') || lower.includes('pack') || lower.includes('bag')) {
    return <BriefcaseMedical size={20} />;
  }
  if (lower.includes('surg') || lower.includes('med') || lower.includes('clinic') || lower.includes('doctor')) {
    return <Stethoscope size={20} />;
  }
  return <Layers size={20} />;
}

async function compressStockPicture(file: File): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read image file.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  if (file.size <= 140 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return rawDataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

export const StockManagementSection: React.FC<StockManagementSectionProps> = ({
  stockItems,
  stockSegments,
  stockRequests = [],
  onApproveStockRequest,
  onRejectStockRequest,
  onAddSegment,
  onDeleteSegment,
  onClearEmptySegments,
  onCreateStock,
  onRestockItem,
  onUpdateStock,
  onDeleteStock,
}) => {
  // Step 1: null = user chooses which segment/items to view first
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<StockFilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewLayoutMode>('cards');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // Clean Modal for Adding a New Segment
  const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState(false);
  const [newSegmentInput, setNewSegmentInput] = useState('');
  const [segmentModalError, setSegmentModalError] = useState<string | null>(null);
  const [isSavingSegment, setIsSavingSegment] = useState(false);

  // Add / Edit Stock Item Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [priceInputMode, setPriceInputMode] = useState<'unit' | 'total'>('unit');
  const [addToExpense, setAddToExpense] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalNewSegmentMode, setModalNewSegmentMode] = useState(false);
  const [modalCustomSegment, setModalCustomSegment] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    sku_or_model: '',
    category: '',
    quantity: '1',
    unit_label: 'pcs',
    price_input: '',
    purchase_date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    picture_url: '',
    notes: '',
  });

  // Restock ("Buy More") Modal state
  const [restockTarget, setRestockTarget] = useState<StockItem | null>(null);
  const [restockForm, setRestockForm] = useState({
    added_quantity: '1',
    buying_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    notes: '',
    add_to_expense: true,
  });
  const [isRestocking, setIsRestocking] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo lightbox preview
  const [previewItem, setPreviewItem] = useState<StockItem | null>(null);

  // Employee Stock Requests Approval Queue state
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [requestRemarksMap, setRequestRemarksMap] = useState<Record<string, string>>({});
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const pendingRequests = useMemo(
    () => stockRequests.filter((r) => r.status === 'pending'),
    [stockRequests]
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Merge configured stockSegments + any categories actually used by items
  const availableSegments = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];

    const addIfNew = (raw?: string) => {
      const clean = (raw || '').trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(clean);
      }
    };

    stockSegments.forEach(addIfNew);
    stockItems.forEach((item) => addIfNew(item.category));
    return list;
  }, [stockSegments, stockItems]);

  const hasUncategorized = useMemo(
    () => stockItems.some((item) => !(item.category || '').trim()),
    [stockItems]
  );

  // Segment statistics
  const segmentStats = useMemo(() => {
    const buildStats = (items: StockItem[]) => {
      const count = items.length;
      const units = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
      const value = items.reduce(
        (s, i) => s + (Number(i.quantity) || 0) * (Number(i.buying_price) || 0),
        0
      );
      const lowOut = items.filter((i) => (Number(i.quantity) || 0) <= 2).length;
      return { count, units, value, lowOut };
    };

    const byName: Record<string, { count: number; units: number; value: number; lowOut: number }> = {};
    availableSegments.forEach((seg) => {
      const segItems = stockItems.filter(
        (i) => (i.category || '').trim().toLowerCase() === seg.toLowerCase()
      );
      byName[seg] = buildStats(segItems);
    });

    if (hasUncategorized) {
      const uncatItems = stockItems.filter((i) => !(i.category || '').trim());
      byName[UNCATEGORIZED_KEY] = buildStats(uncatItems);
    }

    return {
      all: buildStats(stockItems),
      byName,
    };
  }, [availableSegments, hasUncategorized, stockItems]);

  const emptySegmentsCount = useMemo(
    () =>
      availableSegments.filter((seg) => (segmentStats.byName[seg]?.count || 0) === 0).length,
    [availableSegments, segmentStats]
  );

  const usedSegmentNames = useMemo(
    () =>
      availableSegments.filter((seg) => (segmentStats.byName[seg]?.count || 0) > 0),
    [availableSegments, segmentStats]
  );

  // Items matching the currently chosen segment
  const segmentItems = useMemo(() => {
    if (!selectedSegment || selectedSegment === ALL_SEGMENTS_KEY) {
      return stockItems;
    }
    if (selectedSegment === UNCATEGORIZED_KEY) {
      return stockItems.filter((item) => !(item.category || '').trim());
    }
    const targetLower = selectedSegment.toLowerCase();
    return stockItems.filter(
      (item) => (item.category || '').trim().toLowerCase() === targetLower
    );
  }, [stockItems, selectedSegment]);

  // Filtered items inside chosen segment
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return segmentItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.sku_or_model || '').toLowerCase().includes(q) ||
        (item.supplier_name || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);

      const qty = Number(item.quantity) || 0;
      const matchesMode =
        filterMode === 'all' ||
        (filterMode === 'in_stock' && qty > 2) ||
        (filterMode === 'low_out' && qty <= 2);

      const matchesSelected = !showSelectedOnly || selectedItemIds.has(item.id);

      return matchesSearch && matchesMode && matchesSelected;
    });
  }, [segmentItems, searchTerm, filterMode, showSelectedOnly, selectedItemIds]);

  // Summary metrics
  const summarySource = selectedSegment ? segmentItems : stockItems;
  const summary = useMemo(() => {
    const totalItems = summarySource.length;
    const totalUnits = summarySource.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    const currentStockValue = summarySource.reduce(
      (sum, s) => sum + (Number(s.quantity) || 0) * (Number(s.buying_price) || 0),
      0
    );
    const totalExpenseLogged = summarySource.reduce(
      (sum, s) => sum + (Number(s.total_expense_logged) || 0),
      0
    );
    const lowOrOutCount = summarySource.filter((s) => (Number(s.quantity) || 0) <= 2).length;
    return { totalItems, totalUnits, currentStockValue, totalExpenseLogged, lowOrOutCount };
  }, [summarySource]);

  const activeSegmentLabel =
    !selectedSegment || selectedSegment === ALL_SEGMENTS_KEY
      ? 'All Stock Items'
      : selectedSegment;

  // Items queued for export
  const exportItems = useMemo(() => {
    if (selectedItemIds.size > 0) {
      const picked = filteredItems.filter((item) => selectedItemIds.has(item.id));
      if (picked.length > 0) return picked;
    }
    return filteredItems;
  }, [filteredItems, selectedItemIds]);

  // Form calculations
  const formQty = Math.max(0, Number(formState.quantity) || 0);
  const rawPrice = Math.max(0, Number(formState.price_input) || 0);
  const computedUnitPrice =
    priceInputMode === 'unit'
      ? rawPrice
      : formQty > 0
      ? Math.round(rawPrice / formQty)
      : rawPrice;
  const computedTotalCost =
    priceInputMode === 'unit' ? Math.round(rawPrice * formQty) : Math.round(rawPrice);

  const handleSelectSegment = (seg: string | null) => {
    setSelectedSegment(seg);
    setSearchTerm('');
    setFilterMode('all');
    setSelectedItemIds(new Set());
    setShowSelectedOnly(false);
  };

  const openAddSegmentModal = () => {
    setNewSegmentInput('');
    setSegmentModalError(null);
    setIsAddSegmentModalOpen(true);
  };

  const handleSaveNewSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSegmentInput.trim();
    if (!clean) {
      setSegmentModalError('Please enter a segment name.');
      return;
    }
    if (availableSegments.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSegmentModalError(`"${clean}" already exists.`);
      return;
    }
    setSegmentModalError(null);
    setIsSavingSegment(true);
    try {
      await onAddSegment(clean);
      setNewSegmentInput('');
      setIsAddSegmentModalOpen(false);
      if (selectedSegment !== null) {
        handleSelectSegment(clean);
      }
    } finally {
      setIsSavingSegment(false);
    }
  };

  const handleRemoveEmptySegment = async (segmentName: string) => {
    if (!onDeleteSegment) return;
    await onDeleteSegment(segmentName);
    if (selectedSegment && selectedSegment.toLowerCase() === segmentName.toLowerCase()) {
      handleSelectSegment(null);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) setShowSelectedOnly(false);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allSelected =
      filteredItems.length > 0 && filteredItems.every((i) => selectedItemIds.has(i.id));
    if (allSelected) {
      setSelectedItemIds(new Set());
      setShowSelectedOnly(false);
    } else {
      setSelectedItemIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setPriceInputMode('unit');
    setAddToExpense(true);
    setImageError(null);
    const hasCustomDefault = availableSegments.length === 0;
    setModalNewSegmentMode(hasCustomDefault);
    setModalCustomSegment('');
    const prefilledSegment =
      selectedSegment &&
      selectedSegment !== ALL_SEGMENTS_KEY &&
      selectedSegment !== UNCATEGORIZED_KEY
        ? selectedSegment
        : availableSegments[0] || '';
    setFormState({
      name: '',
      sku_or_model: '',
      category: prefilledSegment,
      quantity: '1',
      unit_label: 'pcs',
      price_input: '',
      purchase_date: new Date().toISOString().split('T')[0],
      supplier_name: '',
      picture_url: '',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingItem(item);
    setPriceInputMode('unit');
    setAddToExpense(false);
    setImageError(null);
    setModalNewSegmentMode(false);
    setModalCustomSegment('');
    setFormState({
      name: item.name,
      sku_or_model: item.sku_or_model || '',
      category: item.category || '',
      quantity: String(item.quantity ?? 0),
      unit_label: item.unit_label || 'pcs',
      price_input: String(item.buying_price ?? 0),
      purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
      supplier_name: item.supplier_name || '',
      picture_url: item.picture_url || '',
      notes: item.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const openRestockModal = (item: StockItem) => {
    setRestockTarget(item);
    setRestockForm({
      added_quantity: '1',
      buying_price: String(item.buying_price || ''),
      purchase_date: new Date().toISOString().split('T')[0],
      supplier_name: item.supplier_name || '',
      notes: '',
      add_to_expense: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await compressStockPicture(file);
      setFormState((prev) => ({ ...prev, picture_url: dataUrl }));
    } catch {
      setImageError('Could not load that image. Please try a JPG or PNG photo.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    const finalSegment = modalNewSegmentMode
      ? modalCustomSegment.trim()
      : formState.category.trim();

    setIsSaving(true);
    try {
      if (finalSegment && !availableSegments.some((s) => s.toLowerCase() === finalSegment.toLowerCase())) {
        await onAddSegment(finalSegment);
      }

      if (editingItem) {
        await onUpdateStock(editingItem.id, {
          name: formState.name.trim(),
          sku_or_model: formState.sku_or_model.trim(),
          category: finalSegment,
          quantity: formQty,
          unit_label: formState.unit_label.trim() || 'pcs',
          buying_price: computedUnitPrice,
          purchase_date: formState.purchase_date,
          supplier_name: formState.supplier_name.trim(),
          picture_url: formState.picture_url,
          notes: formState.notes.trim(),
        });
      } else {
        await onCreateStock({
          name: formState.name.trim(),
          sku_or_model: formState.sku_or_model.trim(),
          category: finalSegment,
          quantity: formQty,
          unit_label: formState.unit_label.trim() || 'pcs',
          buying_price: computedUnitPrice,
          purchase_date: formState.purchase_date,
          supplier_name: formState.supplier_name.trim(),
          picture_url: formState.picture_url,
          notes: formState.notes.trim(),
          add_to_expense: addToExpense,
        });

        if (selectedSegment === null) {
          setSelectedSegment(finalSegment || ALL_SEGMENTS_KEY);
        }
      }
      setIsFormModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget) return;
    const addedQty = Math.max(1, Number(restockForm.added_quantity) || 0);
    const unitPrice = Math.max(0, Number(restockForm.buying_price) || 0);

    setIsRestocking(true);
    try {
      await onRestockItem(restockTarget.id, {
        added_quantity: addedQty,
        buying_price: unitPrice,
        purchase_date: restockForm.purchase_date,
        supplier_name: restockForm.supplier_name,
        notes: restockForm.notes,
        add_to_expense: restockForm.add_to_expense,
      });
      setRestockTarget(null);
    } finally {
      setIsRestocking(false);
    }
  };

  const handleQuickQuantityStep = async (item: StockItem, delta: number) => {
    const nextQty = Math.max(0, (Number(item.quantity) || 0) + delta);
    if (nextQty === item.quantity) return;
    await onUpdateStock(item.id, { quantity: nextQty });
  };

  const handleConfirmDelete = async (alsoDeleteExpenses: boolean) => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteStock(deleteTarget.id, alsoDeleteExpenses);
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = (customList?: StockItem[], customLabel?: string) => {
    const itemsToExport = customList ?? exportItems;
    if (itemsToExport.length === 0) return;

    const label = customLabel ?? activeSegmentLabel;
    const headers = [
      '#',
      'Item Name',
      'Segment',
      'Qty',
      'Buying Price (BDT)',
      'Stock Value (BDT)',
      'Supplier & Date',
    ];

    let totalQty = 0;
    let totalStockVal = 0;

    const rows: (string | number)[][] = itemsToExport.map((item, idx) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.buying_price) || 0;
      const val = qty * price;
      const unit = item.unit_label || 'pcs';

      totalQty += qty;
      totalStockVal += val;

      const supDate = [item.supplier_name, item.purchase_date].filter(Boolean).join(' | ') || '-';
      const nameWithSku = item.sku_or_model ? `${item.name} (${item.sku_or_model})` : item.name;

      return [
        idx + 1,
        nameWithSku,
        item.category?.trim() || UNCATEGORIZED_KEY,
        `${qty} ${unit}`,
        `Tk ${price.toLocaleString()}`,
        `Tk ${val.toLocaleString()}`,
        supDate,
      ];
    });

    rows.push([
      'TOTAL SUMMARY',
      `${itemsToExport.length} Items`,
      label,
      `${totalQty} units`,
      '-',
      `Tk ${totalStockVal.toLocaleString()}`,
      '-',
    ]);

    const safeSegSlug = label.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    exportToPDF({
      filename: `Carelink_Stock_${safeSegSlug}_${new Date().toISOString().split('T')[0]}`,
      title: `Carelink Healthineers - Stock Report (${label})`,
      subtitle: `Segment: ${label} | ${itemsToExport.length} Items (${totalQty} units) | Stock Value: Tk ${totalStockVal.toLocaleString()}`,
      headers,
      rows,
    });
  };

  const handleExportExcel = (customList?: StockItem[], customLabel?: string) => {
    const itemsToExport = customList ?? exportItems;
    if (itemsToExport.length === 0) return;

    const label = customLabel ?? activeSegmentLabel;
    const headers = [
      'Item Name',
      'Segment',
      'Model / SKU',
      'Quantity',
      'Unit',
      'Buying Price / Unit (BDT)',
      'Current Stock Value (BDT)',
      'Expense Logged (BDT)',
      'Purchase Date',
      'Supplier',
      'Notes',
    ];

    let totalQty = 0;
    let totalStockVal = 0;
    let totalExpense = 0;

    const rows: (string | number)[][] = itemsToExport.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.buying_price) || 0;
      const val = qty * price;
      const exp = Number(item.total_expense_logged) || 0;
      totalQty += qty;
      totalStockVal += val;
      totalExpense += exp;
      return [
        item.name,
        item.category?.trim() || UNCATEGORIZED_KEY,
        item.sku_or_model || '-',
        qty,
        item.unit_label || 'pcs',
        price,
        val,
        exp,
        item.purchase_date || '',
        item.supplier_name || '-',
        item.notes || '',
      ];
    });

    rows.push([
      'TOTAL SUMMARY',
      label,
      '-',
      totalQty,
      'units',
      '-',
      totalStockVal,
      totalExpense,
      '',
      '',
      '',
    ]);

    const safeSegSlug = label.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    exportToExcel({
      filename: `Carelink_Stock_${safeSegSlug}_${new Date().toISOString().split('T')[0]}`,
      sheetName: label.slice(0, 31) || 'Stock List',
      headers,
      rows,
    });
  };

  const selectedCountInFiltered = filteredItems.filter((i) => selectedItemIds.has(i.id)).length;
  const allFilteredSelected =
    filteredItems.length > 0 && selectedCountInFiltered === filteredItems.length;

  return (
    <div className="space-y-5">
      {/* Stylish Executive Stock Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 sm:p-6 text-white shadow-lg shadow-slate-900/10 border border-slate-800/80">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-sky-300 shrink-0 shadow-inner">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Stock &amp; Inventory <span className="text-sky-300 font-bold">(স্টক ও ক্রয় হিসাব)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Choose a segment to browse stock items, track buying prices &amp; quantities, and export clean PDF reports.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {stockRequests.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRequestsPanel((v) => !v)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-all border ${
                  pendingRequests.length > 0
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
                    : showRequestsPanel
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
                }`}
              >
                <ClipboardCheck size={15} />
                <span>
                  Requests ({pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : stockRequests.length})
                </span>
              </button>
            )}
            {selectedSegment === null && stockItems.length > 0 && (
              <button
                type="button"
                onClick={() => handleExportPDF(stockItems, 'All Stock Items')}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-rose-600/25 transition-all"
              >
                <FileText size={15} />
                <span>PDF Export</span>
              </button>
            )}
            <button
              type="button"
              onClick={openAddSegmentModal}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 backdrop-blur-xs transition-all"
            >
              <Layers size={15} className="text-sky-300" />
              <span>Add Segment</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus size={16} />
              <span>Add Stock Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stylish 4-Card Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">
              {selectedSegment ? `${activeSegmentLabel} · Items` : 'Total Stock Items'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {summary.totalItems}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              {summary.lowOrOutCount > 0 ? (
                <span className="text-amber-700 font-semibold">{summary.lowOrOutCount} low or out</span>
              ) : (
                `${availableSegments.length} segments active`
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={17} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Total Quantity</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {summary.totalUnits.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Units on hand</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Boxes size={17} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-200/70 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800">Current Stock Value</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950 mt-1 tabular-nums">
              ৳{summary.currentStockValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">Qty × Buying Price</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet size={17} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-rose-50/70 via-white to-white rounded-2xl border border-rose-200/70 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-rose-800">Added to Expenses</div>
            <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1 tabular-nums">
              ৳{summary.totalExpenseLogged.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5">Synced to Financial Hishab</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
            <Receipt size={17} />
          </div>
        </div>
      </div>

      {/* EMPLOYEE STOCK REQUESTS APPROVAL PANEL */}
      {(pendingRequests.length > 0 || showRequestsPanel) && stockRequests.length > 0 && (
        <div className="rounded-3xl bg-white border border-amber-200/90 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-amber-50 via-orange-50/60 to-white border-b border-amber-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Employee Stock Pcs Requests
                  </h3>
                  {pendingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                      {pendingRequests.length} Pending Approval
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Approving a request automatically reduces that product&apos;s stock quantity.
                </p>
              </div>
            </div>

            {showRequestsPanel && (
              <button
                type="button"
                onClick={() => setShowRequestsPanel(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {pendingRequests.length > 0 ? 'Show Pending Only' : 'Close'}
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {(showRequestsPanel ? stockRequests : pendingRequests).map((req) => {
              const liveItem = stockItems.find((s) => s.id === req.stock_item_id);
              const liveQty = liveItem ? Number(liveItem.quantity) || 0 : 0;
              const insufficient = req.status === 'pending' && liveQty < req.requested_qty;
              const isBusy = processingRequestId === req.id;

              return (
                <div
                  key={req.id}
                  className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold">
                        <UserCheck size={11} className="text-blue-600" />
                        {req.employee_name} ({req.employee_code})
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {req.stock_item_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-extrabold">
                        Requesting {req.requested_qty} {req.unit_label}
                      </span>
                      {req.status === 'pending' && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                            insufficient
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          In Stock: {liveQty} {req.unit_label}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-700">Purpose:</strong> {req.purpose}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="font-mono">{req.created_at.slice(0, 10)}</span>
                      {req.employee_department && <span>· {req.employee_department}</span>}
                      {req.reviewed_by && (
                        <span>
                          · {req.status === 'approved' ? 'Approved' : 'Declined'} by{' '}
                          <strong className="text-slate-600">{req.reviewed_by}</strong>
                        </span>
                      )}
                      {req.executive_remarks && (
                        <span className="text-slate-600">· Note: &ldquo;{req.executive_remarks}&rdquo;</span>
                      )}
                    </div>
                  </div>

                  {req.status === 'pending' && onApproveStockRequest && onRejectStockRequest ? (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Optional remark..."
                        value={requestRemarksMap[req.id] || ''}
                        onChange={(e) =>
                          setRequestRemarksMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 w-40"
                      />
                      <button
                        type="button"
                        disabled={isBusy || insufficient}
                        onClick={async () => {
                          setProcessingRequestId(req.id);
                          try {
                            await onApproveStockRequest(req.id, requestRemarksMap[req.id]);
                          } finally {
                            setProcessingRequestId(null);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          insufficient
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                        }`}
                        title={
                          insufficient
                            ? 'Not enough stock available to approve'
                            : `Approve and deduct ${req.requested_qty} ${req.unit_label} from stock`
                        }
                      >
                        {isBusy ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        <span>Approve &amp; Deduct</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={async () => {
                          setProcessingRequestId(req.id);
                          try {
                            await onRejectStockRequest(req.id, requestRemarksMap[req.id]);
                          } finally {
                            setProcessingRequestId(null);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <XCircle size={13} />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0">
                      {req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 size={13} />
                          <span>Approved &amp; Deducted</span>
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          <XCircle size={13} />
                          <span>Declined</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                          <Clock size={13} />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: CUTE SEGMENT CHOOSER */}
      {selectedSegment === null ? (
        <div className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/25 to-rose-50/20 rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200/70 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Choose What You Want to View
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick a segment card below to browse items, update quantities, or export a cute PDF report.
                </p>
              </div>
            </div>

            {onClearEmptySegments && emptySegmentsCount > 0 && (
              <button
                type="button"
                onClick={() => onClearEmptySegments(usedSegmentNames)}
                className="px-3.5 py-2 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/80 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 transition-all"
              >
                <Trash2 size={13} />
                <span>Remove Empty ({emptySegmentsCount})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cute Master Card: All Stock Items */}
            <button
              type="button"
              onClick={() => handleSelectSegment(ALL_SEGMENTS_KEY)}
              className="group relative overflow-hidden text-left p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[164px]"
            >
              {/* Soft decorative bubbles */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15 group-hover:scale-125 transition-transform duration-500"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-sky-300/15"
              />

              <div className="relative flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 backdrop-blur-xs flex items-center justify-center text-white shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <FolderOpen size={21} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold tracking-wide text-sky-100">
                  ALL STOCK
                </span>
              </div>

              <div className="relative mt-4">
                <div className="text-base font-extrabold tracking-tight text-white">
                  All Stock Items
                </div>
                <div className="text-xs text-blue-100/90 mt-0.5 tabular-nums">
                  {segmentStats.all.count} {segmentStats.all.count === 1 ? 'item' : 'items'} · {segmentStats.all.units} qty
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-sky-100 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open all</span>
                    <ArrowRight size={13} />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-white/20 border border-white/20 text-xs font-mono font-extrabold text-white tabular-nums">
                    ৳{segmentStats.all.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>

            {/* Cute Pastel Segment Cards */}
            {availableSegments.map((segment, index) => {
              const stat = segmentStats.byName[segment] || { count: 0, units: 0, value: 0, lowOut: 0 };
              const accent = SEGMENT_ACCENTS[index % SEGMENT_ACCENTS.length];
              return (
                <div
                  key={segment}
                  className={`group relative overflow-hidden rounded-3xl border ${accent.border} ${accent.cardBg} shadow-xs hover:shadow-xl ${accent.shadow} hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[164px]`}
                >
                  {/* Soft decorative pastel corner blob */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full ${accent.bubble} group-hover:scale-125 transition-transform duration-500`}
                  />

                  <button
                    type="button"
                    onClick={() => handleSelectSegment(segment)}
                    className="relative w-full h-full p-5 text-left flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center ${accent.iconBg} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                      >
                        {getCuteSegmentIcon(segment)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div
                        className={`text-base font-extrabold text-slate-900 ${accent.titleHover} transition-colors truncate`}
                      >
                        {segment}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {stat.count} {stat.count === 1 ? 'item' : 'items'} · {stat.units} qty
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-900/5 flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-bold ${accent.actionText} flex items-center gap-1 group-hover:translate-x-0.5 transition-transform`}
                        >
                          <span>View items</span>
                          <ArrowRight size={13} />
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-xl border text-xs font-mono font-extrabold tabular-nums ${accent.pricePill}`}
                        >
                          ৳{stat.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>

                  {onDeleteSegment && stat.count === 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEmptySegment(segment);
                      }}
                      title={`Remove empty segment "${segment}"`}
                      className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/95 hover:bg-rose-500 text-slate-400 hover:text-white border border-slate-200/80 hover:border-rose-500 shadow-xs flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Cute Uncategorized Card (if any legacy items exist) */}
            {hasUncategorized && (
              <button
                type="button"
                onClick={() => handleSelectSegment(UNCATEGORIZED_KEY)}
                className="group relative overflow-hidden text-left p-5 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-100/70 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[164px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Package size={20} />
                </div>
                <div className="mt-4">
                  <div className="text-base font-extrabold text-slate-800">{UNCATEGORIZED_KEY}</div>
                  <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {segmentStats.byName[UNCATEGORIZED_KEY]?.count || 0} items
                  </div>
                  <div className="mt-3.5 pt-3 border-t border-slate-900/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View items</span>
                      <ArrowRight size={13} />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-extrabold text-slate-900 tabular-nums">
                      ৳{(segmentStats.byName[UNCATEGORIZED_KEY]?.value || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Cute Add New Segment Action Card */}
            <button
              type="button"
              onClick={openAddSegmentModal}
              className="group relative overflow-hidden p-5 rounded-3xl border-2 border-dashed border-sky-200/90 hover:border-blue-400 bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/50 hover:from-sky-50 hover:to-indigo-50/80 hover:shadow-lg hover:shadow-sky-100/60 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2.5 min-h-[164px] text-slate-600 hover:text-blue-700"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 text-blue-500 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Plus size={22} />
              </div>
              <div className="text-center">
                <div className="text-sm font-extrabold tracking-tight">Add New Segment</div>
                <div className="text-[11px] text-slate-400 group-hover:text-blue-500/80 mt-0.5 transition-colors">
                  Kits, Electronics, Scissors…
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: SELECTED SEGMENT ITEMS VIEW */
        <div className="space-y-4">
          {/* Unified Stylish Control Panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
            {/* Segment Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectSegment(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs transition-colors"
              >
                <ArrowLeft size={14} />
                <span>All Segments</span>
              </button>

              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleSelectSegment(ALL_SEGMENTS_KEY)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                    selectedSegment === ALL_SEGMENTS_KEY
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({stockItems.length})
                </button>

                {availableSegments.map((seg) => {
                  const count = segmentStats.byName[seg]?.count || 0;
                  const active = selectedSegment.toLowerCase() === seg.toLowerCase();
                  return (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => handleSelectSegment(seg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                        active
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {seg} ({count})
                    </button>
                  );
                })}

                {hasUncategorized && (
                  <button
                    type="button"
                    onClick={() => handleSelectSegment(UNCATEGORIZED_KEY)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                      selectedSegment === UNCATEGORIZED_KEY
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {UNCATEGORIZED_KEY} ({segmentStats.byName[UNCATEGORIZED_KEY]?.count || 0})
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={openAddSegmentModal}
                className="px-3 py-1.5 text-blue-700 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Plus size={13} />
                <span>New Segment</span>
              </button>
            </div>

            {/* Search, Status Filter, Item Selection & PDF/Excel Export */}
            <div className="pt-3.5 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                <div className="relative flex-1 min-w-[210px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search in ${activeSegmentLabel}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-all ${
                      filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({segmentItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('in_stock')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-all ${
                      filterMode === 'in_stock' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('low_out')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-all ${
                      filterMode === 'low_out' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Low / Out ({summary.lowOrOutCount})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {allFilteredSelected ? (
                      <CheckSquare size={14} className="text-blue-600" />
                    ) : (
                      <Square size={14} className="text-slate-400" />
                    )}
                    <span>{allFilteredSelected ? 'Unselect All' : 'Select Items'}</span>
                  </button>
                )}

                {selectedItemIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSelectedOnly((prev) => !prev)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer whitespace-nowrap transition-all ${
                      showSelectedOnly
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {showSelectedOnly
                      ? `Selected Only (${selectedItemIds.size})`
                      : `View Selected (${selectedItemIds.size})`}
                  </button>
                )}

                <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    title="Card view"
                    className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                      viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    title="Table view"
                    className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={exportItems.length === 0}
                  onClick={() => handleExportPDF()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-rose-600/20 transition-all"
                >
                  <FileText size={14} />
                  <span>
                    {selectedCountInFiltered > 0
                      ? `PDF Export (${selectedCountInFiltered})`
                      : 'PDF Export'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={exportItems.length === 0}
                  onClick={() => handleExportExcel()}
                  className="px-3.5 py-2 bg-emerald-50/70 hover:bg-emerald-100 disabled:opacity-40 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Package size={26} />
              </div>
              <div className="text-base font-extrabold text-slate-900">
                {segmentItems.length === 0
                  ? `No items in "${activeSegmentLabel}" yet`
                  : 'No items match your search'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {segmentItems.length === 0
                  ? `Add your first stock item to ${activeSegmentLabel} with a photo, quantity, and buying price.`
                  : 'Try clearing your search or changing the stock status filter.'}
              </p>
              {segmentItems.length === 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/25 transition-all"
                  >
                    <Plus size={15} />
                    <span>Add Item to {activeSegmentLabel}</span>
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* STYLISH TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="py-3.5 px-3.5 w-10">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer flex items-center"
                      >
                        {allFilteredSelected ? (
                          <CheckSquare size={15} className="text-blue-600" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-3.5">Item</th>
                    <th className="py-3.5 px-3.5">Segment</th>
                    <th className="py-3.5 px-3.5 text-right">Buying Price</th>
                    <th className="py-3.5 px-3.5 text-center">Quantity</th>
                    <th className="py-3.5 px-3.5 text-right">Stock Value</th>
                    <th className="py-3.5 px-3.5">Supplier &amp; Date</th>
                    <th className="py-3.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const qty = Number(item.quantity) || 0;
                    const unitPrice = Number(item.buying_price) || 0;
                    const stockVal = qty * unitPrice;
                    const unitLabel = item.unit_label || 'pcs';
                    const isChecked = selectedItemIds.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/30 transition-colors ${isChecked ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="py-3 px-3.5">
                          <button
                            type="button"
                            onClick={() => toggleItemSelection(item.id)}
                            className="text-slate-500 hover:text-blue-600 cursor-pointer flex items-center"
                          >
                            {isChecked ? (
                              <CheckSquare size={15} className="text-blue-600" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => item.picture_url && setPreviewItem(item)}
                              className={`w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 ${
                                item.picture_url ? 'cursor-pointer hover:ring-2 hover:ring-blue-500/30' : ''
                              }`}
                            >
                              {item.picture_url ? (
                                <img
                                  src={item.picture_url}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={15} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{item.name}</div>
                              {item.sku_or_model && (
                                <div className="text-[11px] text-slate-500">{item.sku_or_model}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-blue-700">
                          {item.category?.trim() || UNCATEGORIZED_KEY}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                          ৳{unitPrice.toLocaleString()} / {unitLabel}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickQuantityStep(item, -1)}
                              disabled={qty <= 0}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span
                              className={`min-w-[50px] text-center font-mono tabular-nums font-bold ${
                                qty === 0 ? 'text-rose-700' : qty <= 2 ? 'text-amber-700' : 'text-slate-900'
                              }`}
                            >
                              {qty} {unitLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickQuantityStep(item, 1)}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-800">
                          ৳{stockVal.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-[11px] text-slate-500">
                          <div>{item.supplier_name || '—'}</div>
                          {item.purchase_date && <div className="tabular-nums">{item.purchase_date}</div>}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openRestockModal(item)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                            >
                              Buy More
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* STYLISH CARDS VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const qty = Number(item.quantity) || 0;
                const unitPrice = Number(item.buying_price) || 0;
                const stockVal = qty * unitPrice;
                const unitLabel = item.unit_label || 'pcs';
                const isChecked = selectedItemIds.has(item.id);
                const segName = item.category?.trim() || UNCATEGORIZED_KEY;

                return (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      isChecked
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200/90 shadow-xs'
                    }`}
                  >
                    {/* Picture Frame */}
                    <div
                      onClick={() => item.picture_url && setPreviewItem(item)}
                      className={`relative h-48 bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden ${
                        item.picture_url ? 'cursor-pointer' : ''
                      }`}
                    >
                      {item.picture_url ? (
                        <img
                          src={item.picture_url}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                            <ImageIcon size={20} />
                          </div>
                          <span className="text-[11px] font-medium">No photo added</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.id);
                        }}
                        title={isChecked ? 'Deselect item' : 'Select item for PDF / viewing'}
                        className={`absolute top-3 left-3 p-1.5 rounded-xl border shadow-sm backdrop-blur-md cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-white/90 text-slate-600 border-slate-200/80 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {isChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>

                      {qty === 0 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-rose-600/95 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg shadow-sm">
                          Out of Stock
                        </div>
                      )}
                      {qty > 0 && qty <= 2 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-600/95 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg shadow-sm">
                          Low Stock
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-blue-600 tracking-wide">
                          {segName}
                        </div>
                        <h3 className="text-[15px] font-extrabold text-slate-900 leading-snug">
                          {item.name}
                        </h3>
                        {(item.sku_or_model || item.supplier_name || item.purchase_date) && (
                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                            {item.sku_or_model && <span>{item.sku_or_model}</span>}
                            {item.sku_or_model && item.supplier_name && <span aria-hidden="true">·</span>}
                            {item.supplier_name && <span>{item.supplier_name}</span>}
                            {(item.sku_or_model || item.supplier_name) && item.purchase_date && (
                              <span aria-hidden="true">·</span>
                            )}
                            {item.purchase_date && <span className="tabular-nums">{item.purchase_date}</span>}
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 pt-0.5 leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Buying Price & Stock Value Box */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/90 border border-slate-100 rounded-xl text-xs">
                        <div>
                          <div className="text-[10px] font-semibold text-slate-500">Buying Price</div>
                          <div className="font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                            ৳{unitPrice.toLocaleString()}{' '}
                            <span className="text-[10px] font-normal text-slate-500">/ {unitLabel}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-semibold text-slate-500">Stock Value</div>
                          <div className="font-mono font-bold text-emerald-800 tabular-nums mt-0.5">
                            ৳{stockVal.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Tactile Quantity Stepper */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-slate-600">Quantity</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickQuantityStep(item, -1)}
                            disabled={qty <= 0}
                            className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-[62px] text-center font-mono font-extrabold text-sm text-slate-900 tabular-nums">
                            {qty}{' '}
                            <span className="text-[11px] font-sans font-medium text-slate-500">
                              {unitLabel}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickQuantityStep(item, 1)}
                            className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => openRestockModal(item)}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        >
                          <ShoppingBag size={13} />
                          <span>Buy More</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 0: ADD NEW SEGMENT */}
      {isAddSegmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Add New Segment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSegmentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewSegment} className="space-y-4 text-xs">
              {segmentModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold">
                  {segmentModalError}
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Segment Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Dental Burs, Handpieces, Cables"
                  value={newSegmentInput}
                  onChange={(e) => {
                    setSegmentModalError(null);
                    setNewSegmentInput(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSegmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSegment || !newSegmentInput.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 shadow-sm shadow-blue-600/25 transition-all"
                >
                  {isSavingSegment ? 'Saving...' : 'Save Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STOCK ITEM */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Package size={16} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Item Picture (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3.5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 transition-colors"
                  >
                    {isProcessingImage ? (
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                    ) : formState.picture_url ? (
                      <img
                        src={formState.picture_url}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={22} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload size={13} />
                        <span>{formState.picture_url ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>
                      {formState.picture_url && (
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, picture_url: '' })}
                          className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {imageError ? (
                      <p className="text-[11px] text-rose-600 font-medium">{imageError}</p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Choose a photo from your computer or phone.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Item / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surgical Scissors, Sensor Board"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Segment *</label>
                    {availableSegments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setModalNewSegmentMode((prev) => !prev)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        {modalNewSegmentMode ? 'Choose Existing' : '+ New Segment'}
                      </button>
                    )}
                  </div>

                  {modalNewSegmentMode ? (
                    <input
                      type="text"
                      required
                      placeholder="Type new segment name..."
                      value={modalCustomSegment}
                      onChange={(e) => setModalCustomSegment(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-blue-400 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                    />
                  ) : (
                    <select
                      required
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                    >
                      <option value="">Select segment...</option>
                      {availableSegments.map((seg) => (
                        <option key={seg} value={seg}>
                          {seg}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formState.quantity}
                    onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={formState.unit_label}
                    onChange={(e) => setFormState({ ...formState, unit_label: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                  >
                    <option value="pcs">pcs</option>
                    <option value="unit">unit</option>
                    <option value="box">box</option>
                    <option value="set">set</option>
                    <option value="pack">pack</option>
                    <option value="kit">kit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Buying Price (BDT) *</label>
                  {!editingItem && (
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPriceInputMode('unit')}
                        className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                          priceInputMode === 'unit'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Per Unit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceInputMode('total')}
                        className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                          priceInputMode === 'total'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Total Paid
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  min="0"
                  required
                  placeholder={priceInputMode === 'unit' ? 'Price for 1 item' : 'Total amount paid for all items'}
                  value={formState.price_input}
                  onChange={(e) => setFormState({ ...formState, price_input: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-hidden transition-all"
                />

                {!editingItem && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Unit Price: <strong className="font-mono text-slate-900">৳{computedUnitPrice.toLocaleString()}</strong>
                      </span>
                      <span className="text-slate-600">
                        Total Buying Cost:{' '}
                        <strong className="font-mono text-rose-700 text-sm">
                          ৳{computedTotalCost.toLocaleString()}
                        </strong>
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none pt-2 border-t border-slate-200/80">
                      <input
                        type="checkbox"
                        checked={addToExpense}
                        onChange={(e) => setAddToExpense(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="font-semibold text-slate-800">
                        Add ৳{computedTotalCost.toLocaleString()} to Company Expenses automatically
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formState.purchase_date}
                    onChange={(e) => setFormState({ ...formState, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model / SKU</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formState.sku_or_model}
                    onChange={(e) => setFormState({ ...formState, sku_or_model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formState.supplier_name}
                    onChange={(e) => setFormState({ ...formState, supplier_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional note (e.g. shelf location, invoice no.)"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isProcessingImage}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-blue-600/25 transition-all"
                >
                  <Check size={15} />
                  <span>{isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Stock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUY MORE / RESTOCK */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Buy More Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {restockTarget.name} · Current stock: {restockTarget.quantity} {restockTarget.unit_label || 'pcs'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRestockTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Quantity Bought *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockForm.added_quantity}
                    onChange={(e) => setRestockForm({ ...restockForm, added_quantity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Buying Price / Unit (BDT) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={restockForm.buying_price}
                    onChange={(e) => setRestockForm({ ...restockForm, buying_price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={restockForm.purchase_date}
                    onChange={(e) => setRestockForm({ ...restockForm, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={restockForm.supplier_name}
                    onChange={(e) => setRestockForm({ ...restockForm, supplier_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    New Total Stock:{' '}
                    <strong className="font-mono text-slate-900">
                      {(Number(restockTarget.quantity) || 0) + (Number(restockForm.added_quantity) || 0)}{' '}
                      {restockTarget.unit_label || 'pcs'}
                    </strong>
                  </span>
                  <span className="text-slate-600">
                    Cost:{' '}
                    <strong className="font-mono text-rose-700">
                      ৳
                      {Math.round(
                        (Number(restockForm.added_quantity) || 0) * (Number(restockForm.buying_price) || 0)
                      ).toLocaleString()}
                    </strong>
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-2 border-t border-slate-200/80">
                  <input
                    type="checkbox"
                    checked={restockForm.add_to_expense}
                    onChange={(e) => setRestockForm({ ...restockForm, add_to_expense: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Add purchase cost to Company Expenses automatically
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-600/20 transition-all"
                >
                  {isRestocking ? 'Saving...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Delete Stock Item?</h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              You are removing <strong className="text-slate-900">{deleteTarget.name}</strong> from your stock list.
              {(deleteTarget.linked_expense_note_ids || []).length > 0 &&
                ' This item also created expense entries in Company Expenses.'}
            </p>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              {(deleteTarget.linked_expense_note_ids || []).length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Delete Stock Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(true)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 shadow-sm shadow-rose-600/20 transition-all"
                  >
                    Delete Stock &amp; Expense
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 shadow-sm shadow-rose-600/20 transition-all"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PHOTO LIGHTBOX */}
      {previewItem && previewItem.picture_url && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 cursor-default"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">{previewItem.name}</div>
                <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                  {previewItem.category ? `${previewItem.category} · ` : ''}
                  Qty: {previewItem.quantity} {previewItem.unit_label || 'pcs'} · Buying Price: ৳
                  {Number(previewItem.buying_price || 0).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={previewItem.picture_url}
                alt={previewItem.name}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
