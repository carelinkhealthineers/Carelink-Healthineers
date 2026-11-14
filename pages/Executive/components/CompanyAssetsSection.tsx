import React, { useMemo, useRef, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Upload,
  Trash2,
  Edit3,
  X,
  Minus,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
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
  ArrowRight,
  Sparkles,
  Monitor,
  Armchair,
  Wrench,
  MapPin,
} from 'lucide-react';
import { AssetCondition, CompanyAssetItem } from '../../../types';
import { CreateCompanyAssetInput } from '../../../services/executiveService';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface CompanyAssetsSectionProps {
  assetItems: CompanyAssetItem[];
  assetSegments: string[];
  onAddSegment: (segmentName: string) => Promise<void>;
  onDeleteSegment?: (segmentName: string) => Promise<void>;
  onClearEmptySegments?: (usedSegmentNames: string[]) => Promise<void>;
  onCreateAsset: (input: CreateCompanyAssetInput) => Promise<void>;
  onUpdateAsset: (id: string, updates: Partial<CompanyAssetItem>) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
}

type AssetFilterMode = 'all' | 'good' | 'in_use' | 'maintenance';
type ViewLayoutMode = 'cards' | 'table';

const ALL_SEGMENTS_KEY = '__ALL__';
const UNCATEGORIZED_KEY = 'Uncategorized';

const ASSET_SEGMENT_ACCENTS = [
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
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70',
    border: 'border-rose-200/80 hover:border-rose-300',
    shadow: 'hover:shadow-rose-200/50',
    bubble: 'bg-rose-200/35',
    iconBg: 'bg-white text-rose-500 border-rose-100 shadow-rose-100/80',
    titleHover: 'group-hover:text-rose-700',
    actionText: 'text-rose-600',
    pricePill: 'bg-rose-50/90 text-rose-900 border-rose-200/70',
  },
];

function getCuteAssetIcon(segmentName: string) {
  const lower = segmentName.toLowerCase();
  if (lower.includes('it') || lower.includes('comp') || lower.includes('electr') || lower.includes('laptop')) {
    return <Monitor size={20} />;
  }
  if (lower.includes('furn') || lower.includes('chair') || lower.includes('desk') || lower.includes('table')) {
    return <Armchair size={20} />;
  }
  if (lower.includes('lab') || lower.includes('demo') || lower.includes('tool') || lower.includes('repair')) {
    return <Wrench size={20} />;
  }
  if (lower.includes('office') || lower.includes('room') || lower.includes('build')) {
    return <Building2 size={20} />;
  }
  return <Layers size={20} />;
}

const CONDITION_META: Record<AssetCondition, { label: string; dot: string; text: string }> = {
  good: { label: 'Good Condition', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  in_use: { label: 'In Active Use', dot: 'bg-sky-500', text: 'text-sky-700' },
  maintenance: { label: 'Needs Check', dot: 'bg-amber-500', text: 'text-amber-700' },
};

async function compressAssetPicture(file: File): Promise<string> {
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

export const CompanyAssetsSection: React.FC<CompanyAssetsSectionProps> = ({
  assetItems,
  assetSegments,
  onAddSegment,
  onDeleteSegment,
  onClearEmptySegments,
  onCreateAsset,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  // Step 1: null = user chooses segment first
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<AssetFilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewLayoutMode>('cards');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // Add Segment Modal
  const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState(false);
  const [newSegmentInput, setNewSegmentInput] = useState('');
  const [segmentModalError, setSegmentModalError] = useState<string | null>(null);
  const [isSavingSegment, setIsSavingSegment] = useState(false);

  // Add / Edit Asset Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyAssetItem | null>(null);
  const [priceInputMode, setPriceInputMode] = useState<'unit' | 'total'>('unit');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalNewSegmentMode, setModalNewSegmentMode] = useState(false);
  const [modalCustomSegment, setModalCustomSegment] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    asset_code: '',
    category: '',
    quantity: '1',
    unit_label: 'pcs',
    price_input: '',
    acquired_date: new Date().toISOString().split('T')[0],
    location_or_holder: '',
    condition: 'good' as AssetCondition,
    picture_url: '',
    notes: '',
  });

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<CompanyAssetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo preview
  const [previewItem, setPreviewItem] = useState<CompanyAssetItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    assetSegments.forEach(addIfNew);
    assetItems.forEach((item) => addIfNew(item.category));
    return list;
  }, [assetSegments, assetItems]);

  const hasUncategorized = useMemo(
    () => assetItems.some((item) => !(item.category || '').trim()),
    [assetItems]
  );

  const segmentStats = useMemo(() => {
    const buildStats = (items: CompanyAssetItem[]) => {
      const count = items.length;
      const units = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
      const value = items.reduce(
        (s, i) => s + (Number(i.quantity) || 0) * (Number(i.asset_price) || 0),
        0
      );
      return { count, units, value };
    };

    const byName: Record<string, { count: number; units: number; value: number }> = {};
    availableSegments.forEach((seg) => {
      const segItems = assetItems.filter(
        (i) => (i.category || '').trim().toLowerCase() === seg.toLowerCase()
      );
      byName[seg] = buildStats(segItems);
    });

    if (hasUncategorized) {
      const uncatItems = assetItems.filter((i) => !(i.category || '').trim());
      byName[UNCATEGORIZED_KEY] = buildStats(uncatItems);
    }

    return {
      all: buildStats(assetItems),
      byName,
    };
  }, [availableSegments, hasUncategorized, assetItems]);

  const emptySegmentsCount = useMemo(
    () => availableSegments.filter((seg) => (segmentStats.byName[seg]?.count || 0) === 0).length,
    [availableSegments, segmentStats]
  );

  const usedSegmentNames = useMemo(
    () => availableSegments.filter((seg) => (segmentStats.byName[seg]?.count || 0) > 0),
    [availableSegments, segmentStats]
  );

  const segmentItems = useMemo(() => {
    if (!selectedSegment || selectedSegment === ALL_SEGMENTS_KEY) {
      return assetItems;
    }
    if (selectedSegment === UNCATEGORIZED_KEY) {
      return assetItems.filter((i) => !(i.category || '').trim());
    }
    return assetItems.filter(
      (i) => (i.category || '').trim().toLowerCase() === selectedSegment.toLowerCase()
    );
  }, [assetItems, selectedSegment]);

  const summary = useMemo(() => {
    const source = selectedSegment === null ? assetItems : segmentItems;
    const totalItems = source.length;
    const totalUnits = source.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    const totalAssetValue = source.reduce(
      (s, i) => s + (Number(i.quantity) || 0) * (Number(i.asset_price) || 0),
      0
    );
    const maintenanceCount = source.filter((i) => i.condition === 'maintenance').length;
    return {
      totalItems,
      totalUnits,
      totalAssetValue,
      maintenanceCount,
    };
  }, [assetItems, segmentItems, selectedSegment]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return segmentItems.filter((item) => {
      if (filterMode !== 'all' && item.condition !== filterMode) return false;
      if (showSelectedOnly && !selectedItemIds.has(item.id)) return false;

      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.asset_code || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.location_or_holder || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q)
      );
    });
  }, [segmentItems, filterMode, searchTerm, showSelectedOnly, selectedItemIds]);

  const exportItems = useMemo(() => {
    const checkedInSegment = segmentItems.filter((i) => selectedItemIds.has(i.id));
    if (checkedInSegment.length > 0) return checkedInSegment;
    return filteredItems;
  }, [segmentItems, filteredItems, selectedItemIds]);

  const activeSegmentLabel = useMemo(() => {
    if (!selectedSegment || selectedSegment === ALL_SEGMENTS_KEY) return 'All Company Assets';
    return selectedSegment;
  }, [selectedSegment]);

  const handleSelectSegment = (seg: string | null) => {
    setSelectedSegment(seg);
    setSelectedItemIds(new Set());
    setShowSelectedOnly(false);
    setSearchTerm('');
    setFilterMode('all');
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    const allFilteredSelectedNow =
      filteredItems.length > 0 && filteredItems.every((i) => selectedItemIds.has(i.id));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelectedNow) {
        filteredItems.forEach((i) => next.delete(i.id));
      } else {
        filteredItems.forEach((i) => next.add(i.id));
      }
      return next;
    });
  };

  const openAddSegmentModal = () => {
    setNewSegmentInput('');
    setSegmentModalError(null);
    setIsAddSegmentModalOpen(true);
  };

  const handleCreateNewSegmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSegmentInput.trim();
    if (!clean) {
      setSegmentModalError('Please enter a segment name.');
      return;
    }
    setIsSavingSegment(true);
    setSegmentModalError(null);
    try {
      await onAddSegment(clean);
      setNewSegmentInput('');
      setIsAddSegmentModalOpen(false);
      handleSelectSegment(clean);
    } catch (err: any) {
      setSegmentModalError(err?.message || 'Could not add segment.');
    } finally {
      setIsSavingSegment(false);
    }
  };

  const handleRemoveEmptySegment = async (segmentName: string) => {
    if (!onDeleteSegment) return;
    await onDeleteSegment(segmentName);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setPriceInputMode('unit');
    setImageError(null);
    setIsDraggingPhoto(false);
    setModalNewSegmentMode(false);
    setModalCustomSegment('');
    const prefillSegment =
      selectedSegment && selectedSegment !== ALL_SEGMENTS_KEY && selectedSegment !== UNCATEGORIZED_KEY
        ? selectedSegment
        : availableSegments[0] || '';
    setFormState({
      name: '',
      asset_code: '',
      category: prefillSegment,
      quantity: '1',
      unit_label: 'pcs',
      price_input: '',
      acquired_date: new Date().toISOString().split('T')[0],
      location_or_holder: '',
      condition: 'good',
      picture_url: '',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: CompanyAssetItem) => {
    setEditingItem(item);
    setPriceInputMode('unit');
    setImageError(null);
    setIsDraggingPhoto(false);
    setModalNewSegmentMode(false);
    setModalCustomSegment('');
    setFormState({
      name: item.name,
      asset_code: item.asset_code || '',
      category: item.category || '',
      quantity: String(item.quantity ?? 0),
      unit_label: item.unit_label || 'pcs',
      price_input: String(item.asset_price ?? 0),
      acquired_date: item.acquired_date || new Date().toISOString().split('T')[0],
      location_or_holder: item.location_or_holder || '',
      condition: item.condition || 'good',
      picture_url: item.picture_url || '',
      notes: item.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const processAssetPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select or drop a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setImageError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await compressAssetPicture(file);
      setFormState((prev) => ({ ...prev, picture_url: dataUrl }));
    } catch (err: any) {
      setImageError(err?.message || 'Failed to process selected image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAssetPhotoFile(file);
    e.target.value = '';
  };

  const handlePhotoDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAssetPhotoFile(file);
    }
  };

  const formQty = Math.max(0, Number(formState.quantity) || 0);
  const formPriceInput = Math.max(0, Number(formState.price_input) || 0);
  const computedUnitPrice =
    priceInputMode === 'unit'
      ? formPriceInput
      : formQty > 0
      ? Number((formPriceInput / formQty).toFixed(2))
      : formPriceInput;
  const computedTotalCost =
    priceInputMode === 'total' ? formPriceInput : Math.round(formQty * formPriceInput);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    const finalSegment = modalNewSegmentMode
      ? modalCustomSegment.trim()
      : formState.category.trim();

    setIsSaving(true);
    try {
      if (modalNewSegmentMode && finalSegment) {
        await onAddSegment(finalSegment).catch(() => {});
      }

      if (editingItem) {
        await onUpdateAsset(editingItem.id, {
          name: formState.name.trim(),
          asset_code: formState.asset_code.trim(),
          category: finalSegment,
          quantity: formQty,
          unit_label: formState.unit_label.trim() || 'pcs',
          asset_price: computedUnitPrice,
          acquired_date: formState.acquired_date,
          location_or_holder: formState.location_or_holder.trim(),
          condition: formState.condition,
          picture_url: formState.picture_url,
          notes: formState.notes.trim(),
        });
      } else {
        await onCreateAsset({
          name: formState.name.trim(),
          asset_code: formState.asset_code.trim(),
          category: finalSegment,
          quantity: formQty,
          unit_label: formState.unit_label.trim() || 'pcs',
          asset_price: computedUnitPrice,
          acquired_date: formState.acquired_date,
          location_or_holder: formState.location_or_holder.trim(),
          condition: formState.condition,
          picture_url: formState.picture_url,
          notes: formState.notes.trim(),
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

  const handleQuickQuantityStep = async (item: CompanyAssetItem, delta: number) => {
    const nextQty = Math.max(0, (Number(item.quantity) || 0) + delta);
    if (nextQty === item.quantity) return;
    await onUpdateAsset(item.id, { quantity: nextQty });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteAsset(deleteTarget.id);
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

  const handleExportPDF = (customList?: CompanyAssetItem[], customLabel?: string) => {
    const itemsToExport = customList ?? exportItems;
    if (itemsToExport.length === 0) return;

    const label = customLabel ?? activeSegmentLabel;
    const headers = [
      '#',
      'Asset Name',
      'Segment',
      'Qty',
      'Asset Price (BDT)',
      'Total Asset Value (BDT)',
      'Location & Condition',
    ];

    let totalQty = 0;
    let totalAssetVal = 0;

    const rows: (string | number)[][] = itemsToExport.map((item, idx) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.asset_price) || 0;
      const val = qty * price;
      const unit = item.unit_label || 'pcs';

      totalQty += qty;
      totalAssetVal += val;

      const nameWithCode = item.asset_code ? `${item.name} (${item.asset_code})` : item.name;
      const condLabel = CONDITION_META[item.condition || 'good'].label;
      const locCond = [item.location_or_holder, condLabel].filter(Boolean).join(' | ');

      return [
        idx + 1,
        nameWithCode,
        item.category?.trim() || UNCATEGORIZED_KEY,
        `${qty} ${unit}`,
        `Tk ${price.toLocaleString()}`,
        `Tk ${val.toLocaleString()}`,
        locCond,
      ];
    });

    rows.push([
      'TOTAL SUMMARY',
      `${itemsToExport.length} Assets`,
      label,
      `${totalQty} units`,
      '-',
      `Tk ${totalAssetVal.toLocaleString()}`,
      '-',
    ]);

    const safeSegSlug = label.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    exportToPDF({
      filename: `Carelink_Company_Assets_${safeSegSlug}_${new Date().toISOString().split('T')[0]}`,
      title: `Carelink Healthineers - Company Asset Register (${label})`,
      subtitle: `Segment: ${label} | ${itemsToExport.length} Assets (${totalQty} units) | Company Asset Value: Tk ${totalAssetVal.toLocaleString()}`,
      headers,
      rows,
    });
  };

  const handleExportExcel = (customList?: CompanyAssetItem[], customLabel?: string) => {
    const itemsToExport = customList ?? exportItems;
    if (itemsToExport.length === 0) return;

    const label = customLabel ?? activeSegmentLabel;
    const headers = [
      'Asset Name',
      'Segment',
      'Asset Code / Model',
      'Quantity',
      'Unit',
      'Company Asset Price / Unit (BDT)',
      'Total Company Asset Value (BDT)',
      'Condition',
      'Acquired Date',
      'Location / Assigned To',
      'Notes',
    ];

    let totalQty = 0;
    let totalAssetVal = 0;

    const rows: (string | number)[][] = itemsToExport.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.asset_price) || 0;
      const val = qty * price;
      totalQty += qty;
      totalAssetVal += val;
      return [
        item.name,
        item.category?.trim() || UNCATEGORIZED_KEY,
        item.asset_code || '-',
        qty,
        item.unit_label || 'pcs',
        price,
        val,
        CONDITION_META[item.condition || 'good'].label,
        item.acquired_date || '',
        item.location_or_holder || '-',
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
      totalAssetVal,
      '',
      '',
      '',
      '',
    ]);

    const safeSegSlug = label.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    exportToExcel({
      filename: `Carelink_Company_Assets_${safeSegSlug}_${new Date().toISOString().split('T')[0]}`,
      sheetName: label.slice(0, 31) || 'Company Assets',
      headers,
      rows,
    });
  };

  const selectedCountInFiltered = filteredItems.filter((i) => selectedItemIds.has(i.id)).length;
  const allFilteredSelected =
    filteredItems.length > 0 && selectedCountInFiltered === filteredItems.length;

  return (
    <div className="space-y-5">
      {/* Cute Executive Company Assets Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 p-5 sm:p-6 text-white shadow-lg shadow-slate-900/10 border border-slate-800/80">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-12 h-52 w-52 rounded-full bg-indigo-400/15 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-400/15 border border-teal-300/25 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Company Assets <span className="text-teal-300 font-bold">(কোম্পানির সম্পদ ও মূল্য)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Register company property, equipment &amp; their asset values cleanly — asset prices stay here and are never added to Expenses.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {selectedSegment === null && assetItems.length > 0 && (
              <button
                type="button"
                onClick={() => handleExportPDF(assetItems, 'All Company Assets')}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-rose-600/25 transition-all"
              >
                <FileText size={15} />
                <span>PDF Export</span>
              </button>
            )}
            <button
              type="button"
              onClick={openAddSegmentModal}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/15 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 backdrop-blur-xs transition-all"
            >
              <Layers size={15} className="text-teal-300" />
              <span>Add Segment</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-teal-500/30 transition-all"
            >
              <Plus size={16} />
              <span>Add Company Asset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card Asset Summary Strip (No Expense Sync) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">
              {selectedSegment ? `${activeSegmentLabel} · Assets` : 'Total Asset Entries'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {summary.totalItems}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              {summary.maintenanceCount > 0 ? (
                <span className="text-amber-700 font-semibold">{summary.maintenanceCount} needs check</span>
              ) : (
                'All tracked assets'
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 size={17} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Total Units</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {summary.totalUnits.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Owned items</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Boxes size={17} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 rounded-2xl border border-emerald-200/70 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800">Company Asset Price</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950 mt-1 tabular-nums">
              ৳{summary.totalAssetValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700/85 mt-0.5">Standalone asset value</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet size={17} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-violet-50/70 via-white to-white rounded-2xl border border-violet-200/70 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-violet-800">Asset Segments</div>
            <div className="text-2xl font-extrabold text-violet-950 mt-1 tabular-nums">
              {availableSegments.length}
            </div>
            <div className="text-[11px] text-violet-700/80 mt-0.5">Not synced to Expenses</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-100/80 border border-violet-200 text-violet-700 flex items-center justify-center shrink-0">
            <Layers size={17} />
          </div>
        </div>
      </div>

      {/* STEP 1: CUTE SEGMENT CHOOSER */}
      {selectedSegment === null ? (
        <div className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/20 to-indigo-50/20 rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-100 to-indigo-100 border border-teal-200/70 text-teal-700 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Choose Company Asset Segment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick a category below to inspect company assets, asset prices, and export PDF or Excel reports.
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
            {/* Master Card: All Company Assets */}
            <button
              type="button"
              onClick={() => handleSelectSegment(ALL_SEGMENTS_KEY)}
              className="group relative overflow-hidden text-left p-5 rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 text-white shadow-md shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[164px]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15 group-hover:scale-125 transition-transform duration-500"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-teal-200/15"
              />

              <div className="relative flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 backdrop-blur-xs flex items-center justify-center text-white shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <FolderOpen size={21} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold tracking-wide text-teal-50">
                  ALL ASSETS
                </span>
              </div>

              <div className="relative mt-4">
                <div className="text-base font-extrabold tracking-tight text-white">
                  All Company Assets
                </div>
                <div className="text-xs text-teal-100/90 mt-0.5 tabular-nums">
                  {segmentStats.all.count} {segmentStats.all.count === 1 ? 'asset' : 'assets'} · {segmentStats.all.units} qty
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-teal-50 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
              const stat = segmentStats.byName[segment] || { count: 0, units: 0, value: 0 };
              const accent = ASSET_SEGMENT_ACCENTS[index % ASSET_SEGMENT_ACCENTS.length];
              return (
                <div
                  key={segment}
                  className={`group relative overflow-hidden rounded-3xl border ${accent.border} ${accent.cardBg} shadow-xs hover:shadow-xl ${accent.shadow} hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[164px]`}
                >
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
                        {getCuteAssetIcon(segment)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div
                        className={`text-base font-extrabold text-slate-900 ${accent.titleHover} transition-colors truncate`}
                      >
                        {segment}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {stat.count} {stat.count === 1 ? 'asset' : 'assets'} · {stat.units} qty
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-900/5 flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-bold ${accent.actionText} flex items-center gap-1 group-hover:translate-x-0.5 transition-transform`}
                        >
                          <span>View assets</span>
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

            {hasUncategorized && (
              <button
                type="button"
                onClick={() => handleSelectSegment(UNCATEGORIZED_KEY)}
                className="group relative overflow-hidden text-left p-5 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-100/70 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[164px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Building2 size={20} />
                </div>
                <div className="mt-4">
                  <div className="text-base font-extrabold text-slate-800">{UNCATEGORIZED_KEY}</div>
                  <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {segmentStats.byName[UNCATEGORIZED_KEY]?.count || 0} assets
                  </div>
                  <div className="mt-3.5 pt-3 border-t border-slate-900/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View assets</span>
                      <ArrowRight size={13} />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-extrabold text-slate-900 tabular-nums">
                      ৳{(segmentStats.byName[UNCATEGORIZED_KEY]?.value || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Add New Segment Card */}
            <button
              type="button"
              onClick={openAddSegmentModal}
              className="group relative overflow-hidden p-5 rounded-3xl border-2 border-dashed border-teal-200/90 hover:border-teal-400 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/50 hover:from-teal-50 hover:to-emerald-50/80 hover:shadow-lg hover:shadow-teal-100/60 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2.5 min-h-[164px] text-slate-600 hover:text-teal-700"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-teal-100 text-teal-600 group-hover:border-teal-500 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Plus size={22} />
              </div>
              <div className="text-center">
                <div className="text-sm font-extrabold tracking-tight">Add New Segment</div>
                <div className="text-[11px] text-slate-400 group-hover:text-teal-600/80 mt-0.5 transition-colors">
                  Laptops, Chairs, Printers…
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: SELECTED SEGMENT ASSETS VIEW */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
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
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({assetItems.length})
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
                          ? 'bg-white text-teal-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {seg} ({count})
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={openAddSegmentModal}
                className="px-2.5 py-1.5 border border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 text-slate-600 hover:text-teal-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Plus size={13} />
                <span>New Segment</span>
              </button>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search in ${activeSegmentLabel}...`}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  {(
                    [
                      { key: 'all', label: 'All' },
                      { key: 'good', label: 'Good' },
                      { key: 'in_use', label: 'In Use' },
                      { key: 'maintenance', label: 'Needs Check' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilterMode(tab.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                        filterMode === tab.key
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllFiltered}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {allFilteredSelected ? (
                      <CheckSquare size={14} className="text-teal-600" />
                    ) : (
                      <Square size={14} className="text-slate-400" />
                    )}
                    <span>{allFilteredSelected ? 'Deselect All' : 'Select All'}</span>
                  </button>
                )}

                {selectedItemIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSelectedOnly((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer whitespace-nowrap transition-all ${
                      showSelectedOnly
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    {showSelectedOnly
                      ? `Showing Selected (${selectedItemIds.size})`
                      : `View Selected (${selectedItemIds.size})`}
                  </button>
                )}

                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <List size={13} />
                    <span>Table</span>
                  </button>
                </div>

                {exportItems.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleExportExcel()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                    >
                      <FileSpreadsheet size={14} />
                      <span>Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPDF()}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                    >
                      <FileText size={14} />
                      <span>
                        PDF Export{selectedItemIds.size > 0 ? ` (${selectedItemIds.size})` : ''}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                <Building2 size={26} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {segmentItems.length === 0
                  ? `No company assets in "${activeSegmentLabel}" yet`
                  : 'No assets match your filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add office equipment, furniture, IT devices, or instruments here with their company asset price.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Plus size={15} />
                  <span>Add Asset to {activeSegmentLabel}</span>
                </button>
                {showSelectedOnly && (
                  <button
                    type="button"
                    onClick={() => setShowSelectedOnly(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Show All in Segment
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.asset_price) || 0;
                const assetTotalVal = qty * price;
                const isSelected = selectedItemIds.has(item.id);
                const condMeta = CONDITION_META[item.condition || 'good'];

                return (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-3xl border overflow-hidden flex flex-col transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300'
                    }`}
                  >
                    <div className="relative h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                      {item.picture_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="w-full h-full cursor-pointer group/img"
                          title="Click to enlarge photo"
                        >
                          <img
                            src={item.picture_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover/img:scale-[1.03] transition-transform duration-300"
                          />
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-300">
                          <ImageIcon size={32} />
                          <span className="text-[11px] font-medium text-slate-400">No photo</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleItemSelection(item.id)}
                        className={`absolute top-3 left-3 p-1.5 rounded-xl border shadow-xs cursor-pointer backdrop-blur-xs transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white/90 text-slate-500 border-slate-200/80 hover:border-teal-400 hover:text-teal-600'
                        }`}
                        title={isSelected ? 'Uncheck asset' : 'Select asset for export'}
                      >
                        {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 border border-slate-200/80 shadow-xs backdrop-blur-xs flex items-center gap-1.5 text-[11px] font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${condMeta.dot}`} />
                        <span className={condMeta.text}>{condMeta.label}</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                              {item.name}
                            </h3>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                              <span className="font-semibold text-teal-700">
                                {item.category || UNCATEGORIZED_KEY}
                              </span>
                              {item.asset_code && (
                                <span className="text-slate-400 font-mono">· {item.asset_code}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit asset"
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              title="Delete asset"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3.5 p-3 rounded-2xl bg-slate-50/90 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-[11px] font-medium text-slate-500">Asset Price / Unit</div>
                            <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 tabular-nums">
                              ৳{price.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-slate-500">Company Value</div>
                            <div className="font-mono font-extrabold text-emerald-700 text-sm mt-0.5 tabular-nums">
                              ৳{assetTotalVal.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {(item.location_or_holder || item.acquired_date) && (
                          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                            <span className="truncate flex items-center gap-1">
                              {item.location_or_holder ? (
                                <>
                                  <MapPin size={11} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{item.location_or_holder}</span>
                                </>
                              ) : (
                                ''
                              )}
                            </span>
                            {item.acquired_date && (
                              <span className="shrink-0 font-mono text-slate-400">
                                {item.acquired_date}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => handleQuickQuantityStep(item, -1)}
                            disabled={qty <= 0}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs disabled:opacity-40 cursor-pointer transition-all"
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-3 text-xs font-extrabold text-slate-900 tabular-nums">
                            {qty} {item.unit_label || 'pcs'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickQuantityStep(item, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs cursor-pointer transition-all"
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                        >
                          <Edit3 size={12} />
                          <span>Update</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-3.5 px-3 w-10">
                        <button
                          type="button"
                          onClick={toggleSelectAllFiltered}
                          className="p-1 text-slate-500 hover:text-teal-600 cursor-pointer"
                        >
                          {allFilteredSelected ? (
                            <CheckSquare size={15} className="text-teal-600" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-3">Asset</th>
                      <th className="py-3.5 px-3">Segment</th>
                      <th className="py-3.5 px-3 text-right">Qty</th>
                      <th className="py-3.5 px-3 text-right">Asset Price</th>
                      <th className="py-3.5 px-3 text-right">Total Value</th>
                      <th className="py-3.5 px-3">Condition &amp; Location</th>
                      <th className="py-3.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map((item) => {
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.asset_price) || 0;
                      const val = qty * price;
                      const isSelected = selectedItemIds.has(item.id);
                      const condMeta = CONDITION_META[item.condition || 'good'];

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => toggleItemSelection(item.id)}
                              className="p-1 text-slate-500 hover:text-teal-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare size={15} className="text-teal-600" />
                              ) : (
                                <Square size={15} />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {item.picture_url ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewItem(item)}
                                  className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer"
                                >
                                  <img
                                    src={item.picture_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <ImageIcon size={14} />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900">{item.name}</div>
                                {item.asset_code && (
                                  <div className="text-[11px] font-mono text-slate-400">
                                    {item.asset_code}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">
                            {item.category || UNCATEGORIZED_KEY}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleQuickQuantityStep(item, -1)}
                                disabled={qty <= 0}
                                className="px-2 py-1 text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer rounded-l-lg"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-extrabold text-slate-900 tabular-nums">
                                {qty} {item.unit_label || 'pcs'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickQuantityStep(item, 1)}
                                className="px-2 py-1 text-slate-600 hover:bg-white cursor-pointer rounded-r-lg"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                            ৳{price.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700 tabular-nums">
                            ৳{val.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <div className={`font-semibold ${condMeta.text}`}>{condMeta.label}</div>
                            {(item.location_or_holder || item.acquired_date) && (
                              <div className="text-[11px] text-slate-400">
                                {[item.location_or_holder, item.acquired_date]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                title="Delete"
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
            </div>
          )}
        </div>
      )}

      {/* ADD NEW SEGMENT MODAL */}
      {isAddSegmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Add Asset Segment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSegmentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewSegmentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Segment Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSegmentInput}
                  onChange={(e) => {
                    setNewSegmentInput(e.target.value);
                    setSegmentModalError(null);
                  }}
                  placeholder="e.g., Laptops, Office Furniture, Printers"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                />
                {segmentModalError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5">
                    {segmentModalError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSegmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSegment}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  {isSavingSegment && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Segment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT COMPANY ASSET MODAL (Supports Drag & Drop Photo) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingItem ? 'Edit Company Asset' : 'Add Company Asset'}
                </h3>
                <p className="text-xs text-slate-500">
                  Company asset prices are tracked here only — they will not be added to Expenses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* Drag & Drop or Click Asset Photo */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(true);
                }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={handlePhotoDrop}
                className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${
                  isDraggingPhoto
                    ? 'border-teal-500 bg-teal-50/70'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                  {isProcessingImage ? (
                    <Loader2 size={22} className="animate-spin text-teal-600" />
                  ) : formState.picture_url ? (
                    <img
                      src={formState.picture_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={24} className="text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-800">
                    Asset Photo (Drag &amp; Drop or Upload)
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImagePick}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Upload size={13} className="text-teal-600" />
                      <span>{formState.picture_url ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {formState.picture_url && (
                      <button
                        type="button"
                        onClick={() => setFormState((p) => ({ ...p, picture_url: '' }))}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {imageError && <p className="text-[11px] text-rose-600">{imageError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g., Dell Latitude Laptop / Executive Desk"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Asset Code / Model</label>
                  <input
                    type="text"
                    value={formState.asset_code}
                    onChange={(e) => setFormState({ ...formState, asset_code: e.target.value })}
                    placeholder="e.g., CL-IT-004"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Segment *</label>
                    <button
                      type="button"
                      onClick={() => setModalNewSegmentMode((prev) => !prev)}
                      className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      {modalNewSegmentMode ? 'Choose existing segment' : '+ Create new segment'}
                    </button>
                  </div>

                  {modalNewSegmentMode ? (
                    <input
                      type="text"
                      required
                      value={modalCustomSegment}
                      onChange={(e) => setModalCustomSegment(e.target.value)}
                      placeholder="Enter new segment name..."
                      className="w-full mt-1 px-3.5 py-2.5 bg-teal-50/40 border border-teal-300 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500"
                    />
                  ) : (
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500"
                    >
                      {availableSegments.map((seg) => (
                        <option key={seg} value={seg}>
                          {seg}
                        </option>
                      ))}
                      {formState.category &&
                        !availableSegments.some(
                          (s) => s.toLowerCase() === formState.category.toLowerCase()
                        ) && <option value={formState.category}>{formState.category}</option>}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Quantity *</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formState.quantity}
                      onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                      className="col-span-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-teal-500"
                    />
                    <input
                      type="text"
                      value={formState.unit_label}
                      onChange={(e) => setFormState({ ...formState, unit_label: e.target.value })}
                      placeholder="pcs"
                      className="px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center focus:outline-none focus:bg-white focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Company Asset Price (৳) *
                    </label>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPriceInputMode('unit')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          priceInputMode === 'unit'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Per Unit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceInputMode('total')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          priceInputMode === 'total'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Total Value
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formState.price_input}
                    onChange={(e) => setFormState({ ...formState, price_input: e.target.value })}
                    placeholder={priceInputMode === 'unit' ? 'Asset price per unit' : 'Total asset value'}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    {formQty} {formState.unit_label || 'pcs'} × ৳{computedUnitPrice.toLocaleString()} ={' '}
                    <span className="font-bold text-emerald-700">
                      ৳{computedTotalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Condition</label>
                  <select
                    value={formState.condition}
                    onChange={(e) =>
                      setFormState({ ...formState, condition: e.target.value as AssetCondition })
                    }
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500"
                  >
                    <option value="good">Good Condition</option>
                    <option value="in_use">In Active Use</option>
                    <option value="maintenance">Needs Maintenance / Check</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Acquired Date</label>
                  <input
                    type="date"
                    value={formState.acquired_date}
                    onChange={(e) => setFormState({ ...formState, acquired_date: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Location / Assigned To</label>
                  <input
                    type="text"
                    value={formState.location_or_holder}
                    onChange={(e) =>
                      setFormState({ ...formState, location_or_holder: e.target.value })
                    }
                    placeholder="e.g., Head Office Dhaka, Service Room, Engineer Team"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Notes</label>
                  <textarea
                    rows={2}
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    placeholder="Serial number, warranty note, or asset description..."
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Save Company Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ASSET CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Delete Company Asset?</h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Remove <span className="font-bold text-slate-900">{deleteTarget.name}</span> from your
              Company Assets register?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                <span>Delete Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX */}
      {previewItem && previewItem.picture_url && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">{previewItem.name}</div>
                <div className="text-xs text-slate-500">
                  {previewItem.quantity} {previewItem.unit_label || 'pcs'} · Asset Price: ৳
                  {(Number(previewItem.asset_price) || 0).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-100 flex items-center justify-center max-h-[75vh]">
              <img
                src={previewItem.picture_url}
                alt={previewItem.name}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
