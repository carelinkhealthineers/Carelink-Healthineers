import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Plus,
  Search,
  UploadCloud,
  Trash2,
  Edit3,
  X,
  Pin,
  Download,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
  Sparkles,
  Paperclip,
  FolderHeart,
  CheckCircle2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { CompanyDraft, DraftAttachment, DraftColorTag } from '../../../types';
import { CreateDraftInput } from '../../../services/executiveService';

interface CompanyDraftsSectionProps {
  drafts: CompanyDraft[];
  userName: string;
  onCreateDraft: (input: CreateDraftInput) => Promise<void>;
  onUpdateDraft: (
    id: string,
    updates: Partial<Omit<CompanyDraft, 'id' | 'created_at'>>
  ) => Promise<void>;
  onTogglePin: (id: string) => Promise<void>;
  onDeleteDraft: (id: string) => Promise<void>;
}

const MAX_SINGLE_FILE_BYTES = 4 * 1024 * 1024; // 4 MB safety guard for JSON persistence

const DRAFT_THEMES: Record<
  DraftColorTag,
  {
    label: string;
    dot: string;
    cardBg: string;
    border: string;
    bubble: string;
    iconBg: string;
    chipBg: string;
  }
> = {
  sky: {
    label: 'Sky',
    dot: 'bg-sky-400',
    cardBg: 'bg-gradient-to-br from-sky-50/90 via-white to-blue-50/70',
    border: 'border-sky-200/80 hover:border-sky-300',
    bubble: 'bg-sky-200/35',
    iconBg: 'bg-white text-sky-600 border-sky-100',
    chipBg: 'bg-white/90 border-sky-200/80 hover:border-sky-400',
  },
  rose: {
    label: 'Blush',
    dot: 'bg-rose-400',
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70',
    border: 'border-rose-200/80 hover:border-rose-300',
    bubble: 'bg-rose-200/35',
    iconBg: 'bg-white text-rose-500 border-rose-100',
    chipBg: 'bg-white/90 border-rose-200/80 hover:border-rose-400',
  },
  violet: {
    label: 'Lavender',
    dot: 'bg-violet-400',
    cardBg: 'bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70',
    border: 'border-violet-200/80 hover:border-violet-300',
    bubble: 'bg-violet-200/35',
    iconBg: 'bg-white text-violet-600 border-violet-100',
    chipBg: 'bg-white/90 border-violet-200/80 hover:border-violet-400',
  },
  mint: {
    label: 'Mint',
    dot: 'bg-emerald-400',
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70',
    border: 'border-emerald-200/80 hover:border-emerald-300',
    bubble: 'bg-emerald-200/35',
    iconBg: 'bg-white text-emerald-600 border-emerald-100',
    chipBg: 'bg-white/90 border-emerald-200/80 hover:border-emerald-400',
  },
  amber: {
    label: 'Peach',
    dot: 'bg-amber-400',
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70',
    border: 'border-amber-200/80 hover:border-amber-300',
    bubble: 'bg-amber-200/35',
    iconBg: 'bg-white text-amber-600 border-amber-100',
    chipBg: 'bg-white/90 border-amber-200/80 hover:border-amber-400',
  },
};

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdfDraftFile(file: Pick<DraftAttachment, 'mime_type' | 'name' | 'data_url'>): boolean {
  const mime = (file.mime_type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const url = (file.data_url || '').toLowerCase();
  return mime.includes('pdf') || name.endsWith('.pdf') || url.startsWith('data:application/pdf');
}

function isExcelDraftFile(file: Pick<DraftAttachment, 'mime_type' | 'name'>): boolean {
  const mime = (file.mime_type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv') ||
    name.endsWith('.ods') ||
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv')
  );
}

function isImageDraftFile(file: Pick<DraftAttachment, 'mime_type' | 'name' | 'data_url'>): boolean {
  if (isPdfDraftFile(file)) return false;
  const mime = (file.mime_type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const url = (file.data_url || '').toLowerCase();
  return (
    mime.startsWith('image/') ||
    url.startsWith('data:image/') ||
    /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(name)
  );
}

function isTextDraftFile(file: Pick<DraftAttachment, 'mime_type' | 'name'>): boolean {
  const mime = (file.mime_type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return (
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    /\.(txt|json|md|log)$/i.test(name)
  );
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) {
    return { bytes: new Uint8Array(), mime: 'application/octet-stream' };
  }
  const header = dataUrl.slice(0, commaIdx);
  const body = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+)/i);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const isBase64 = /;base64/i.test(header);

  if (isBase64) {
    const binary = atob(body.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, mime };
  }
  const decoded = decodeURIComponent(body);
  return { bytes: new TextEncoder().encode(decoded), mime };
}

function createDraftBlobUrl(file: DraftAttachment): { objectUrl: string; isRevocable: boolean } {
  if (!file.data_url) return { objectUrl: '', isRevocable: false };
  if (!file.data_url.startsWith('data:')) {
    return { objectUrl: file.data_url, isRevocable: false };
  }
  try {
    const { bytes, mime } = dataUrlToBytes(file.data_url);
    const forcedMime = isPdfDraftFile(file)
      ? 'application/pdf'
      : file.mime_type && file.mime_type !== 'application/octet-stream'
      ? file.mime_type
      : mime;
    const blob = new Blob([bytes], { type: forcedMime });
    return { objectUrl: URL.createObjectURL(blob), isRevocable: true };
  } catch {
    return { objectUrl: file.data_url, isRevocable: false };
  }
}

function triggerDraftFileDownload(file: DraftAttachment): void {
  const { objectUrl, isRevocable } = createDraftBlobUrl(file);
  if (!objectUrl) return;
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = file.name || 'draft-file';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  if (isRevocable) {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }
}

function getExcelColName(idx: number): string {
  let n = idx;
  let label = '';
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function getFileIcon(mime: string, name: string) {
  if (isImageDraftFile({ mime_type: mime, name, data_url: '' })) {
    return <ImageIcon size={15} className="text-sky-600 shrink-0" />;
  }
  if (isExcelDraftFile({ mime_type: mime, name })) {
    return <FileSpreadsheet size={15} className="text-emerald-600 shrink-0" />;
  }
  if (isPdfDraftFile({ mime_type: mime, name, data_url: '' }) || /\.(doc|docx)$/i.test(name)) {
    return <FileText size={15} className="text-rose-600 shrink-0" />;
  }
  return <FileIcon size={15} className="text-violet-600 shrink-0" />;
}

async function compressImageDataUrl(file: File): Promise<{ dataUrl: string; sizeBytes: number }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read file.'));
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

  if (!file.type.startsWith('image/') || file.size <= 220 * 1024) {
    return { dataUrl: rawDataUrl, sizeBytes: file.size };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 1400;
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
          resolve({ dataUrl: rawDataUrl, sizeBytes: file.size });
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        const finalUrl = compressed.length < rawDataUrl.length ? compressed : rawDataUrl;
        const approxBytes = Math.round((finalUrl.length * 3) / 4);
        resolve({ dataUrl: finalUrl, sizeBytes: Math.min(file.size, approxBytes) });
      } catch {
        resolve({ dataUrl: rawDataUrl, sizeBytes: file.size });
      }
    };
    img.onerror = () => resolve({ dataUrl: rawDataUrl, sizeBytes: file.size });
    img.src = rawDataUrl;
  });
}

async function readFilesToAttachments(
  fileList: FileList | File[]
): Promise<{ attachments: DraftAttachment[]; skippedNames: string[] }> {
  const files = Array.from(fileList);
  const attachments: DraftAttachment[] = [];
  const skippedNames: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith('image/') && file.size > MAX_SINGLE_FILE_BYTES) {
      skippedNames.push(`${file.name} (> 4 MB)`);
      continue;
    }

    const { dataUrl, sizeBytes } = await compressImageDataUrl(file);
    const inferredMime =
      file.type ||
      (file.name.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : file.name.toLowerCase().endsWith('.xlsx')
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : file.name.toLowerCase().endsWith('.xls')
        ? 'application/vnd.ms-excel'
        : file.name.toLowerCase().endsWith('.csv')
        ? 'text/csv'
        : 'application/octet-stream');
    attachments.push({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      mime_type: inferredMime,
      size_bytes: sizeBytes,
      data_url: dataUrl,
      uploaded_at: new Date().toISOString(),
    });
  }

  return { attachments, skippedNames };
}

export const CompanyDraftsSection: React.FC<CompanyDraftsSectionProps> = ({
  drafts,
  userName,
  onCreateDraft,
  onUpdateDraft,
  onTogglePin,
  onDeleteDraft,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'with_files'>('all');

  // Drag-and-drop visual states
  const [isMainDropActive, setIsMainDropActive] = useState(false);
  const [isModalDropActive, setIsModalDropActive] = useState(false);
  const [dragOverDraftId, setDragOverDraftId] = useState<string | null>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Create / Edit Draft Modal
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<CompanyDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftForm, setDraftForm] = useState<{
    title: string;
    content: string;
    color_tag: DraftColorTag;
    is_pinned: boolean;
    files: DraftAttachment[];
  }>({
    title: '',
    content: '',
    color_tag: 'sky',
    is_pinned: false,
    files: [],
  });

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<CompanyDraft | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // File Preview Modal & Viewer state
  const [previewFile, setPreviewFile] = useState<DraftAttachment | null>(null);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [excelSearch, setExcelSearch] = useState('');
  const [imgZoom, setImgZoom] = useState(1);
  const [imgRotate, setImgRotate] = useState(0);

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  const previewBlob = useMemo(() => {
    if (!previewFile) return { objectUrl: '', isRevocable: false };
    return createDraftBlobUrl(previewFile);
  }, [previewFile]);

  useEffect(() => {
    setActiveSheetIdx(0);
    setExcelSearch('');
    setImgZoom(1);
    setImgRotate(0);
  }, [previewFile?.id]);

  useEffect(() => {
    return () => {
      if (previewBlob.isRevocable && previewBlob.objectUrl) {
        URL.revokeObjectURL(previewBlob.objectUrl);
      }
    };
  }, [previewBlob]);

  const parsedExcelWorkbook = useMemo(() => {
    if (!previewFile || !isExcelDraftFile(previewFile)) return null;
    try {
      const { bytes } = dataUrlToBytes(previewFile.data_url);
      const wb = XLSX.read(bytes, { type: 'array' });
      const sheets = wb.SheetNames.map((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(ws, {
          header: 1,
          defval: '',
        });
        const maxCols = rawRows.reduce((max, row) => Math.max(max, row.length), 0);
        const normalizedRows = rawRows.map((row) => {
          const copy = row.map((cell) => (cell === null || cell === undefined ? '' : String(cell)));
          while (copy.length < maxCols) copy.push('');
          return copy;
        });
        return {
          name: sheetName,
          rows: normalizedRows,
          colCount: maxCols,
        };
      });
      return { sheets, error: null as string | null };
    } catch (err: any) {
      return { sheets: [], error: err?.message || 'Could not parse spreadsheet file.' };
    }
  }, [previewFile]);

  const parsedTextContent = useMemo(() => {
    if (!previewFile || !isTextDraftFile(previewFile) || isExcelDraftFile(previewFile)) return null;
    try {
      const { bytes } = dataUrlToBytes(previewFile.data_url);
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }, [previewFile]);

  const stats = useMemo(() => {
    const totalDrafts = drafts.length;
    const totalFiles = drafts.reduce((sum, d) => sum + (d.files?.length || 0), 0);
    const pinnedCount = drafts.filter((d) => d.is_pinned).length;
    return { totalDrafts, totalFiles, pinnedCount };
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return drafts.filter((d) => {
      if (filterMode === 'pinned' && !d.is_pinned) return false;
      if (filterMode === 'with_files' && (!d.files || d.files.length === 0)) return false;

      if (!q) return true;
      const inTitle = d.title.toLowerCase().includes(q);
      const inContent = (d.content || '').toLowerCase().includes(q);
      const inFiles = (d.files || []).some((f) => f.name.toLowerCase().includes(q));
      return inTitle || inContent || inFiles;
    });
  }, [drafts, filterMode, searchTerm]);

  const openNewDraftModal = (prefillFiles: DraftAttachment[] = []) => {
    setEditingDraft(null);
    setUploadNotice(null);
    const defaultTitle =
      prefillFiles.length === 1
        ? prefillFiles[0].name.replace(/\.[^/.]+$/, '')
        : prefillFiles.length > 1
        ? `${prefillFiles.length} Files Draft`
        : '';

    const colorCycle: DraftColorTag[] = ['sky', 'rose', 'violet', 'mint', 'amber'];
    const nextColor = colorCycle[drafts.length % colorCycle.length];

    setDraftForm({
      title: defaultTitle,
      content: '',
      color_tag: nextColor,
      is_pinned: false,
      files: prefillFiles,
    });
    setIsDraftModalOpen(true);
  };

  const openEditDraftModal = (draft: CompanyDraft) => {
    setEditingDraft(draft);
    setUploadNotice(null);
    setDraftForm({
      title: draft.title,
      content: draft.content || '',
      color_tag: draft.color_tag || 'sky',
      is_pinned: Boolean(draft.is_pinned),
      files: draft.files ? [...draft.files] : [],
    });
    setIsDraftModalOpen(true);
  };

  // Drag & Drop or Browse on the Main Dropzone -> Opens New Draft prefilled with dropped files
  const handleMainFilesAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsReadingFiles(true);
    setUploadNotice(null);
    try {
      const { attachments, skippedNames } = await readFilesToAttachments(fileList);
      if (skippedNames.length > 0) {
        setUploadNotice(`Skipped files over 4 MB: ${skippedNames.join(', ')}`);
      }
      if (attachments.length > 0) {
        openNewDraftModal(attachments);
      }
    } finally {
      setIsReadingFiles(false);
    }
  };

  // Drag & Drop directly onto an existing Draft Card -> Appends files immediately
  const handleDropOntoExistingCard = async (
    e: React.DragEvent<HTMLDivElement>,
    draft: CompanyDraft
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDraftId(null);

    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;

    setIsReadingFiles(true);
    try {
      const { attachments, skippedNames } = await readFilesToAttachments(fileList);
      if (skippedNames.length > 0) {
        setUploadNotice(`Skipped files over 4 MB: ${skippedNames.join(', ')}`);
      }
      if (attachments.length > 0) {
        await onUpdateDraft(draft.id, {
          files: [...(draft.files || []), ...attachments],
        });
        setUploadNotice(`Added ${attachments.length} file(s) to "${draft.title}"`);
      }
    } finally {
      setIsReadingFiles(false);
    }
  };

  // Drag & Drop or Browse inside the Create/Edit Modal
  const handleModalFilesAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsReadingFiles(true);
    try {
      const { attachments, skippedNames } = await readFilesToAttachments(fileList);
      if (skippedNames.length > 0) {
        setUploadNotice(`Skipped files over 4 MB: ${skippedNames.join(', ')}`);
      }
      if (attachments.length > 0) {
        setDraftForm((prev) => ({
          ...prev,
          title:
            prev.title.trim() ||
            (attachments.length === 1 ? attachments[0].name.replace(/\.[^/.]+$/, '') : prev.title),
          files: [...prev.files, ...attachments],
        }));
      }
    } finally {
      setIsReadingFiles(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftForm.title.trim() && !draftForm.content.trim() && draftForm.files.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const finalTitle =
        draftForm.title.trim() ||
        (draftForm.files[0]?.name.replace(/\.[^/.]+$/, '') || 'Quick Draft');

      if (editingDraft) {
        await onUpdateDraft(editingDraft.id, {
          title: finalTitle,
          content: draftForm.content,
          color_tag: draftForm.color_tag,
          is_pinned: draftForm.is_pinned,
          files: draftForm.files,
        });
      } else {
        await onCreateDraft({
          title: finalTitle,
          content: draftForm.content,
          color_tag: draftForm.color_tag,
          is_pinned: draftForm.is_pinned,
          files: draftForm.files,
          author_name: userName,
        });
      }
      setIsDraftModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteDraft(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const canPreviewInModal = (file: DraftAttachment) =>
    isImageDraftFile(file) ||
    isPdfDraftFile(file) ||
    isExcelDraftFile(file) ||
    isTextDraftFile(file);

  return (
    <div className="space-y-5">
      {/* Cute Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 sm:p-6 text-white shadow-lg shadow-violet-500/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/15 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-16 h-48 w-48 rounded-full bg-pink-300/20 blur-2xl"
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
              <FolderHeart size={23} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Draft &amp; File Box <span className="text-pink-100 font-bold">(ড্রাফট ও ফাইল বক্স)</span>
              </h2>
              <p className="text-xs text-violet-100 mt-0.5 max-w-2xl">
                Create cute notes, keep important documents, and drag &amp; drop files anytime to save them safely in your draft box.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <input
              ref={mainFileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                handleMainFilesAdded(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => mainFileInputRef.current?.click()}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white border border-white/25 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 backdrop-blur-xs transition-all"
            >
              <UploadCloud size={15} />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => openNewDraftModal([])}
              className="px-4 py-2.5 bg-white hover:bg-violet-50 active:scale-[0.98] text-violet-700 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md transition-all"
            >
              <Plus size={16} />
              <span>Create New Draft</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cute 3-Card Summary Row */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="p-4 bg-gradient-to-br from-sky-50/80 via-white to-white rounded-2xl border border-sky-200/70 shadow-xs flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-sky-700">Saved Drafts</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
              {stats.totalDrafts}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-sky-100 text-sky-500 flex items-center justify-center shadow-xs">
            <FileText size={18} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-rose-50/80 via-white to-white rounded-2xl border border-rose-200/70 shadow-xs flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-rose-700">Uploaded Files</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
              {stats.totalFiles}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
            <Paperclip size={18} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-violet-50/80 via-white to-white rounded-2xl border border-violet-200/70 shadow-xs flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-violet-700">Pinned First</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
              {stats.pinnedCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-violet-100 text-violet-600 flex items-center justify-center shadow-xs">
            <Pin size={18} />
          </div>
        </div>
      </div>

      {/* Super Easy Cute Drag & Drop Quick Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsMainDropActive(true);
        }}
        onDragLeave={() => setIsMainDropActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsMainDropActive(false);
          handleMainFilesAdded(e.dataTransfer.files);
        }}
        onClick={() => mainFileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isMainDropActive
            ? 'border-violet-500 bg-gradient-to-br from-violet-50 via-pink-50/60 to-sky-50 scale-[1.01] shadow-lg shadow-violet-200/50'
            : 'border-violet-200/90 hover:border-violet-400 bg-gradient-to-br from-white via-violet-50/35 to-rose-50/35 hover:shadow-md'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-300 ${
              isMainDropActive
                ? 'bg-violet-600 text-white border-violet-500 scale-110 -rotate-3'
                : 'bg-white text-violet-600 border-violet-100 group-hover:scale-110 group-hover:rotate-3'
            }`}
          >
            {isReadingFiles ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <UploadCloud size={26} />
            )}
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900">
              {isMainDropActive
                ? 'Drop your file(s) right here!'
                : 'Drag & Drop any file here to save in a Draft'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Or click to browse PDF, Word, Excel, Photos &amp; documents — you can also drop files directly onto any draft card below.
            </p>
          </div>
        </div>

        {uploadNotice && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs"
          >
            <CheckCircle2 size={13} />
            <span>{uploadNotice}</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drafts or uploaded filenames..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(
              [
                { key: 'all', label: `All (${drafts.length})` },
                { key: 'pinned', label: `Pinned (${stats.pinnedCount})` },
                {
                  key: 'with_files',
                  label: `With Files (${drafts.filter((d) => (d.files?.length || 0) > 0).length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterMode(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                  filterMode === tab.key
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cute Draft Cards Grid */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-gradient-to-b from-white to-violet-50/30 rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 text-violet-500 flex items-center justify-center mx-auto">
            <Sparkles size={26} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {drafts.length === 0 ? 'Your Draft Box is empty & ready!' : 'No drafts match your search'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create a cute draft note or drag and drop any file above to store it cleanly.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => openNewDraftModal([])}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Plus size={15} />
              <span>Create First Draft</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDrafts.map((draft) => {
            const theme = DRAFT_THEMES[draft.color_tag || 'sky'] || DRAFT_THEMES.sky;
            const isCardDropTarget = dragOverDraftId === draft.id;

            return (
              <div
                key={draft.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverDraftId(draft.id);
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  setDragOverDraftId((prev) => (prev === draft.id ? null : prev));
                }}
                onDrop={(e) => handleDropOntoExistingCard(e, draft)}
                className={`group relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
                  isCardDropTarget
                    ? 'border-violet-500 ring-2 ring-violet-400/40 scale-[1.01] shadow-xl bg-violet-50/70'
                    : `${theme.border} ${theme.cardBg} shadow-xs hover:shadow-lg hover:-translate-y-0.5`
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full ${theme.bubble} group-hover:scale-125 transition-transform duration-500`}
                />

                {/* Card Header */}
                <div className="relative space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl border shadow-2xs flex items-center justify-center shrink-0 ${theme.iconBg}`}
                      >
                        <FileText size={17} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {draft.title}
                        </h3>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{draft.author_name || 'Executive'}</span>
                          <span>·</span>
                          <span>
                            {new Date(draft.updated_at || draft.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTogglePin(draft.id)}
                        title={draft.is_pinned ? 'Unpin draft' : 'Pin draft to top'}
                        className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                          draft.is_pinned
                            ? 'bg-amber-100 text-amber-600'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-white/80'
                        }`}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditDraftModal(draft)}
                        title="Edit draft & add files"
                        className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-white/80 rounded-xl cursor-pointer transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(draft)}
                        title="Delete draft"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded-xl cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Draft Notes */}
                  {draft.content ? (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line line-clamp-4">
                      {draft.content}
                    </p>
                  ) : (
                    <p className="text-[11px] italic text-slate-400">
                      File-only draft · drag &amp; drop more files onto this card anytime.
                    </p>
                  )}
                </div>

                {/* Attached Files List */}
                <div className="relative space-y-2 pt-2 border-t border-slate-900/5">
                  {draft.files && draft.files.length > 0 ? (
                    <div className="space-y-1.5">
                      {draft.files.map((file) => {
                        const previewable = canPreviewInModal(file);
                        return (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border ${theme.chipBg} transition-colors`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (previewable) setPreviewFile(file);
                              }}
                              className={`flex items-center gap-2 min-w-0 flex-1 text-left ${
                                previewable ? 'cursor-pointer group/file' : 'cursor-default'
                              }`}
                              title={previewable ? `Click to view ${file.name}` : file.name}
                            >
                              {isImageDraftFile(file) ? (
                                <img
                                  src={file.data_url}
                                  alt={file.name}
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                getFileIcon(file.mime_type, file.name)
                              )}
                              <div className="min-w-0">
                                <div
                                  className={`text-xs font-bold text-slate-800 truncate ${
                                    previewable ? 'group-hover/file:text-violet-700' : ''
                                  }`}
                                >
                                  {file.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {formatFileSize(file.size_bytes)}
                                  {isPdfDraftFile(file)
                                    ? ' · PDF'
                                    : isExcelDraftFile(file)
                                    ? ' · Excel Viewer'
                                    : ''}
                                </div>
                              </div>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              {previewable && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewFile(file)}
                                  title="Open Viewer"
                                  className="px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Eye size={12} />
                                  <span>View</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => triggerDraftFileDownload(file)}
                                title={`Download ${file.name}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>No files attached yet</span>
                      <button
                        type="button"
                        onClick={() => openEditDraftModal(draft)}
                        className="font-bold text-violet-600 hover:underline cursor-pointer"
                      >
                        + Attach file
                      </button>
                    </div>
                  )}

                  {isCardDropTarget && (
                    <div className="text-center text-[11px] font-extrabold text-violet-700 py-1">
                      Drop to attach file(s) to this draft!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT DRAFT MODAL */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/80 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                  <FolderHeart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingDraft ? 'Edit Draft & Files' : 'Create Cute Draft'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Write your draft note and drag &amp; drop files to keep inside.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDraftModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700">Draft Title *</label>
                  <input
                    type="text"
                    value={draftForm.title}
                    onChange={(e) => setDraftForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Quotations, Tender Documents, Monthly Plan..."
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block">Card Color</label>
                  <div className="flex items-center gap-2 mt-2">
                    {(Object.keys(DRAFT_THEMES) as DraftColorTag[]).map((colorKey) => {
                      const th = DRAFT_THEMES[colorKey];
                      const active = draftForm.color_tag === colorKey;
                      return (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => setDraftForm((p) => ({ ...p, color_tag: colorKey }))}
                          title={th.label}
                          className={`w-6 h-6 rounded-full ${th.dot} cursor-pointer transition-transform ${
                            active ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Draft Note / Details</label>
                <textarea
                  rows={4}
                  value={draftForm.content}
                  onChange={(e) => setDraftForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write anything you want to remember or keep with your files..."
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                />
              </div>

              {/* Modal Drag & Drop Upload Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsModalDropActive(true);
                }}
                onDragLeave={() => setIsModalDropActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsModalDropActive(false);
                  handleModalFilesAdded(e.dataTransfer.files);
                }}
                onClick={() => modalFileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
                  isModalDropActive
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-violet-400 bg-slate-50/70'
                }`}
              >
                <input
                  ref={modalFileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => {
                    handleModalFilesAdded(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <UploadCloud size={22} className="text-violet-600" />
                  <div className="text-xs font-bold text-slate-800">
                    Drag &amp; Drop files here, or click to upload
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports PDF, Excel, Word, Images &amp; more (up to 4 MB per document)
                  </div>
                </div>
              </div>

              {/* Attached files preview inside modal */}
              {draftForm.files.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {draftForm.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file.mime_type, file.name)}
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({formatFileSize(file.size_bytes)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftForm((p) => ({
                            ...p,
                            files: p.files.filter((f) => f.id !== file.id),
                          }))
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftForm.is_pinned}
                  onChange={(e) => setDraftForm((p) => ({ ...p, is_pinned: e.target.checked }))}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>Pin this draft to the top</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    (!draftForm.title.trim() &&
                      !draftForm.content.trim() &&
                      draftForm.files.length === 0)
                  }
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingDraft ? 'Save Draft' : 'Create Draft'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DRAFT CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Delete Draft?</h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Delete <span className="font-bold text-slate-900">{deleteTarget.title}</span> and its{' '}
              {deleteTarget.files?.length || 0} attached file(s)?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                <span>Delete Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUILT-IN FILE VIEWER MODAL (PDF, Excel/CSV, Images & Text) */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewer Top Bar */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getFileIcon(previewFile.mime_type, previewFile.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 truncate">
                    {previewFile.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatFileSize(previewFile.size_bytes)}
                    {isPdfDraftFile(previewFile)
                      ? ' · PDF Document'
                      : isExcelDraftFile(previewFile)
                      ? ' · Excel Spreadsheet Viewer'
                      : isImageDraftFile(previewFile)
                      ? ' · Image Viewer'
                      : ' · Text Viewer'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                {isImageDraftFile(previewFile) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImgZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                      className="p-2 rounded-xl hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-600 px-1">
                      {Math.round(imgZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setImgZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                      className="p-2 rounded-xl hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgRotate((r) => (r + 90) % 360)}
                      className="p-2 rounded-xl hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                      title="Rotate 90°"
                    >
                      <RotateCw size={15} />
                    </button>
                  </>
                )}

                {previewBlob.objectUrl && (isPdfDraftFile(previewFile) || isImageDraftFile(previewFile)) && (
                  <a
                    href={previewBlob.objectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Open in Tab</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => triggerDraftFileDownload(previewFile)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Viewer Content Area */}
            <div className="flex-1 overflow-auto bg-slate-100">
              {isImageDraftFile(previewFile) ? (
                <div className="min-h-[360px] h-[74vh] flex items-center justify-center p-4 overflow-auto">
                  <img
                    src={previewBlob.objectUrl || previewFile.data_url}
                    alt={previewFile.name}
                    style={{
                      transform: `scale(${imgZoom}) rotate(${imgRotate}deg)`,
                      transformOrigin: 'center center',
                    }}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-md transition-transform duration-150"
                  />
                </div>
              ) : isPdfDraftFile(previewFile) ? (
                <div className="flex flex-col h-[76vh]">
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-900">
                    <span>
                      Viewing PDF via safe Blob stream. If your browser blocks inline PDF frames, click{' '}
                      <strong>Open in Tab</strong> or <strong>Download</strong>.
                    </span>
                    {previewBlob.objectUrl && (
                      <a
                        href={previewBlob.objectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-extrabold text-violet-700 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        <span>Open Full PDF</span>
                      </a>
                    )}
                  </div>
                  {previewBlob.objectUrl ? (
                    <object
                      data={previewBlob.objectUrl}
                      type="application/pdf"
                      className="w-full flex-1 bg-white"
                    >
                      <iframe
                        src={previewBlob.objectUrl}
                        title={previewFile.name}
                        className="w-full h-full bg-white border-0"
                      />
                    </object>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-500 p-8">
                      Could not create PDF preview stream. Please use Download above.
                    </div>
                  )}
                </div>
              ) : isExcelDraftFile(previewFile) && parsedExcelWorkbook ? (
                <div className="flex flex-col h-[76vh] bg-white">
                  {parsedExcelWorkbook.error ? (
                    <div className="p-8 text-center text-xs text-rose-600 font-semibold">
                      Could not parse Excel workbook: {parsedExcelWorkbook.error}
                    </div>
                  ) : parsedExcelWorkbook.sheets.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      This workbook has no readable sheets.
                    </div>
                  ) : (
                    (() => {
                      const safeIdx = Math.min(activeSheetIdx, parsedExcelWorkbook.sheets.length - 1);
                      const currentSheet = parsedExcelWorkbook.sheets[safeIdx];
                      const q = excelSearch.trim().toLowerCase();
                      const visibleRows = q
                        ? currentSheet.rows.filter((row, rowIdx) =>
                            rowIdx === 0 ||
                            row.some((cell) => cell.toLowerCase().includes(q))
                          )
                        : currentSheet.rows;

                      return (
                        <>
                          {/* Excel Sheet Tabs & Search */}
                          <div className="px-4 py-2.5 border-b border-slate-200 bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {parsedExcelWorkbook.sheets.map((sh, idx) => (
                                <button
                                  key={sh.name}
                                  type="button"
                                  onClick={() => setActiveSheetIdx(idx)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                    safeIdx === idx
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400'
                                  }`}
                                >
                                  {sh.name}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-bold text-emerald-800 tabular-nums">
                                {currentSheet.rows.length} rows × {currentSheet.colCount} cols
                              </span>
                              <div className="relative">
                                <Search
                                  size={13}
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                  type="text"
                                  value={excelSearch}
                                  onChange={(e) => setExcelSearch(e.target.value)}
                                  placeholder="Search rows..."
                                  className="pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 w-44"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Spreadsheet Grid */}
                          <div className="flex-1 overflow-auto">
                            {visibleRows.length === 0 ? (
                              <div className="p-10 text-center text-xs text-slate-500">
                                This sheet is empty.
                              </div>
                            ) : (
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-300">
                                  <tr>
                                    <th className="px-2.5 py-2 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200 bg-slate-100 w-12">
                                      #
                                    </th>
                                    {Array.from({ length: currentSheet.colCount }).map((_, cIdx) => (
                                      <th
                                        key={cIdx}
                                        className="px-3 py-2 font-mono text-[11px] font-bold text-slate-600 border-r border-slate-200 whitespace-nowrap"
                                      >
                                        {getExcelColName(cIdx)}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {visibleRows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className={
                                        rIdx === 0
                                          ? 'bg-emerald-50/60 font-bold text-slate-900'
                                          : rIdx % 2 === 1
                                          ? 'bg-white hover:bg-sky-50/40'
                                          : 'bg-slate-50/50 hover:bg-sky-50/40'
                                      }
                                    >
                                      <td className="px-2.5 py-2 text-center font-mono text-[11px] text-slate-400 border-r border-slate-200 bg-slate-50/80 select-none">
                                        {rIdx + 1}
                                      </td>
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="px-3 py-2 border-r border-slate-200 whitespace-nowrap max-w-[260px] truncate text-slate-800"
                                          title={cell}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              ) : parsedTextContent !== null ? (
                <div className="p-5 h-[72vh] overflow-auto bg-white">
                  <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap break-words">
                    {parsedTextContent}
                  </pre>
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-slate-500">
                  Preview unavailable for this file type. Click Download above to open locally.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
