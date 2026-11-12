import { ExpenseAttachment, TaDaClaim } from '../types';

export function normalizeClaimReceipts(
  claim: Partial<TaDaClaim> & { receipt_urls?: string[] }
): ExpenseAttachment[] {
  const result: ExpenseAttachment[] = [];

  if (Array.isArray(claim?.bills_receipts)) {
    const rawItems: unknown[] = claim.bills_receipts;
    rawItems.forEach((item, idx) => {
      if (typeof item === 'string' && item.trim()) {
        result.push({ name: `Receipt #${idx + 1}`, url: item.trim() });
      } else if (item && typeof item === 'object') {
        const obj = item as Partial<ExpenseAttachment>;
        if (typeof obj.url === 'string' && obj.url.trim()) {
          result.push({
            name: (typeof obj.name === 'string' && obj.name.trim() ? obj.name : `Receipt #${idx + 1}`).trim(),
            url: obj.url.trim(),
          });
        }
      }
    });
  }

  if (Array.isArray(claim?.receipt_urls)) {
    claim.receipt_urls.forEach((url, idx) => {
      if (typeof url === 'string' && url.trim()) {
        const trimmed = url.trim();
        if (!result.some((existing) => existing.url === trimmed)) {
          result.push({ name: `Receipt #${result.length + idx + 1}`, url: trimmed });
        }
      }
    });
  }

  return result;
}

export function isPdfReceipt(att: ExpenseAttachment): boolean {
  const url = (att.url || '').toLowerCase();
  const name = (att.name || '').toLowerCase();
  return (
    url.startsWith('data:application/pdf') ||
    /\.pdf(\?|#|$)/i.test(url) ||
    /\.pdf$/i.test(name)
  );
}

export function isImageReceipt(att: ExpenseAttachment): boolean {
  if (isPdfReceipt(att)) return false;
  const url = (att.url || '').toLowerCase();
  const name = (att.name || '').toLowerCase();
  if (url.startsWith('data:image/')) return true;
  if (/\.(jpeg|jpg|png|gif|webp|bmp|svg|avif|jfif)(\?|#|$)/i.test(url)) return true;
  if (/\.(jpeg|jpg|png|gif|webp|bmp|svg|avif|jfif)$/i.test(name)) return true;
  if (url.startsWith('blob:')) return true;
  return false;
}

export function createSafeBlobUrl(url: string): { objectUrl: string; isRevocable: boolean } {
  if (!url) return { objectUrl: '', isRevocable: false };
  if (!url.startsWith('data:')) {
    return { objectUrl: url, isRevocable: false };
  }

  try {
    const commaIdx = url.indexOf(',');
    if (commaIdx === -1) return { objectUrl: url, isRevocable: false };

    const header = url.slice(0, commaIdx);
    const body = url.slice(commaIdx + 1);
    const mimeMatch = header.match(/data:([^;]+)/i);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const isBase64 = /;base64/i.test(header);

    let bytes: Uint8Array;
    if (isBase64) {
      const binary = atob(body.replace(/\s/g, ''));
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else {
      const decoded = decodeURIComponent(body);
      bytes = new TextEncoder().encode(decoded);
    }

    const blob = new Blob([bytes], { type: mime });
    return { objectUrl: URL.createObjectURL(blob), isRevocable: true };
  } catch (err) {
    console.warn('Failed to convert data URL to blob URL:', err);
    return { objectUrl: url, isRevocable: false };
  }
}

export function downloadReceiptFile(att: ExpenseAttachment): void {
  const { objectUrl, isRevocable } = createSafeBlobUrl(att.url);
  if (!objectUrl) return;

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = att.name || 'tada-receipt';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (isRevocable) {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read file contents.'));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

export async function compressReceiptFile(file: File): Promise<ExpenseAttachment> {
  const isImage =
    file.type.startsWith('image/') ||
    /\.(jpeg|jpg|png|gif|webp|bmp|heic|heif|jfif)$/i.test(file.name);

  if (!isImage) {
    const dataUrl = await readFileAsDataUrl(file);
    return { name: file.name, url: dataUrl };
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  if (file.size <= 280 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
    return { name: file.name, url: rawDataUrl };
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
          resolve({ name: file.name, url: rawDataUrl });
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let compressed = canvas.toDataURL('image/jpeg', 0.82);
        if (compressed.length > 480 * 1024) {
          compressed = canvas.toDataURL('image/jpeg', 0.68);
        }

        const safeName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        resolve({
          name: compressed.length < rawDataUrl.length ? safeName : file.name,
          url: compressed.length < rawDataUrl.length ? compressed : rawDataUrl,
        });
      } catch {
        resolve({ name: file.name, url: rawDataUrl });
      }
    };
    img.onerror = () => resolve({ name: file.name, url: rawDataUrl });
    img.src = rawDataUrl;
  });
}
