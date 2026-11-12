import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { ExpenseAttachment, TaDaClaim } from '../../types';
import {
  createSafeBlobUrl,
  downloadReceiptFile,
  isImageReceipt,
  isPdfReceipt,
  normalizeClaimReceipts,
} from '../../utils/receiptHelper';

interface ReceiptPreviewModalProps {
  receipt: ExpenseAttachment | null;
  receipts?: ExpenseAttachment[];
  onClose: () => void;
  onSelectReceipt?: (att: ExpenseAttachment) => void;
  theme?: 'light' | 'dark';
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  receipt,
  receipts = [],
  onClose,
  onSelectReceipt,
  theme = 'light',
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imgError, setImgError] = useState(false);

  const list = receipts.length > 0 ? receipts : receipt ? [receipt] : [];
  const currentIndex = receipt
    ? Math.max(
        0,
        list.findIndex((r) => r.url === receipt.url && r.name === receipt.name)
      )
    : -1;
  const active = receipt || (currentIndex >= 0 ? list[currentIndex] : null);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImgError(false);
  }, [active?.url, active?.name]);

  const blobState = useMemo(() => {
    if (!active?.url) return { objectUrl: '', isRevocable: false };
    return createSafeBlobUrl(active.url);
  }, [active?.url]);

  useEffect(() => {
    return () => {
      if (blobState.isRevocable && blobState.objectUrl) {
        URL.revokeObjectURL(blobState.objectUrl);
      }
    };
  }, [blobState]);

  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && list.length > 1 && onSelectReceipt) {
        onSelectReceipt(list[(currentIndex + 1) % list.length]);
      }
      if (e.key === 'ArrowLeft' && list.length > 1 && onSelectReceipt) {
        onSelectReceipt(list[(currentIndex - 1 + list.length) % list.length]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, currentIndex, list, onClose, onSelectReceipt]);

  if (!active) return null;

  const isDark = theme === 'dark';
  const isPdf = isPdfReceipt(active);
  const isImage = !isPdf && (isImageReceipt(active) || active.url.startsWith('data:'));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-[#0e1422] border-[#232f45] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700'
              }`}
            >
              {isPdf ? <FileText size={16} /> : <Eye size={16} />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{active.name || 'Receipt Preview'}</div>
              {list.length > 1 && (
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Receipt {currentIndex + 1} of {list.length}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {isImage && !imgError && (
              <>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className={`text-xs font-mono px-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Rotate 90°"
                >
                  <RotateCw size={15} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => downloadReceiptFile(active)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download size={13} />
              <span>Download</span>
            </button>

            {blobState.objectUrl && (
              <a
                href={blobState.objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <ExternalLink size={13} />
                <span>Open Tab</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              }`}
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div
          className={`relative flex-1 overflow-auto flex items-center justify-center p-4 min-h-[360px] ${
            isDark ? 'bg-[#070b14]' : 'bg-slate-100'
          }`}
        >
          {list.length > 1 && onSelectReceipt && (
            <>
              <button
                type="button"
                onClick={() => onSelectReceipt(list[(currentIndex - 1 + list.length) % list.length])}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer shadow-lg"
                title="Previous Receipt"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => onSelectReceipt(list[(currentIndex + 1) % list.length])}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer shadow-lg"
                title="Next Receipt"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {isPdf && blobState.objectUrl ? (
            <iframe
              src={blobState.objectUrl}
              title={active.name || 'PDF Receipt'}
              className="w-full h-[70vh] rounded-xl border border-slate-300 bg-white"
            />
          ) : isImage && !imgError ? (
            <img
              src={blobState.objectUrl || active.url}
              alt={active.name || 'Bill Receipt'}
              onError={() => setImgError(true)}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
              className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg transition-transform duration-150 select-none"
            />
          ) : (
            <div className="text-center space-y-3 p-8 max-w-md">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div className="text-sm font-bold">Preview not available inline</div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                This attachment ({active.name}) cannot be rendered as a preview image in the browser, but you can download it directly.
              </p>
              <button
                type="button"
                onClick={() => downloadReceiptFile(active)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download Receipt</span>
              </button>
            </div>
          )}
        </div>

        {list.length > 1 && onSelectReceipt && (
          <div
            className={`px-4 py-2.5 border-t flex items-center gap-2 overflow-x-auto ${
              isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-white'
            }`}
          >
            {list.map((item, idx) => {
              const selected = idx === currentIndex;
              const thumbImg = isImageReceipt(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectReceipt(item)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs shrink-0 cursor-pointer transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-500/15 font-bold'
                      : isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {thumbImg ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-6 h-6 rounded object-cover shrink-0"
                    />
                  ) : (
                    <Paperclip size={13} className="shrink-0" />
                  )}
                  <span className="max-w-[120px] truncate">{item.name || `Receipt ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface ReceiptGalleryProps {
  claim: Partial<TaDaClaim> & { receipt_urls?: string[] };
  theme?: 'light' | 'dark';
  compact?: boolean;
  onPreview: (att: ExpenseAttachment, all: ExpenseAttachment[]) => void;
}

export const ReceiptGallery: React.FC<ReceiptGalleryProps> = ({
  claim,
  theme = 'light',
  compact = false,
  onPreview,
}) => {
  const attachments = useMemo(() => normalizeClaimReceipts(claim), [claim]);
  const [brokenIndexes, setBrokenIndexes] = useState<Record<number, boolean>>({});
  const isDark = theme === 'dark';

  if (attachments.length === 0) {
    return (
      <span className={`italic text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        No receipts
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {attachments.map((att, idx) => {
        const showAsImage =
          !brokenIndexes[idx] &&
          (isImageReceipt(att) || (!isPdfReceipt(att) && att.url.startsWith('data:')));

        if (showAsImage) {
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onPreview(att, attachments)}
              title={`View receipt: ${att.name || `Receipt #${idx + 1}`}`}
              className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer shrink-0 ${
                compact ? 'w-10 h-10' : 'w-14 h-14'
              } ${
                isDark
                  ? 'border-white/15 bg-black/40 hover:border-blue-400'
                  : 'border-slate-200 bg-slate-100 hover:border-blue-500 shadow-xs'
              }`}
            >
              <img
                src={att.url}
                alt={att.name || `Receipt ${idx + 1}`}
                onError={() => setBrokenIndexes((prev) => ({ ...prev, [idx]: true }))}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 flex items-center justify-center transition-colors">
                <Eye size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onPreview(att, attachments)}
            title={`View attachment: ${att.name || `Receipt #${idx + 1}`}`}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-blue-400'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-blue-700'
            }`}
          >
            {isPdfReceipt(att) ? <FileText size={12} /> : <Paperclip size={12} />}
            <span className="max-w-[130px] truncate">{att.name || `Receipt #${idx + 1}`}</span>
            <Eye size={11} />
          </button>
        );
      })}
    </div>
  );
};
