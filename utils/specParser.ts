/**
 * Intelligent Technical Specifications Parser
 * Automatically parses unstructured paragraphs, bullet points, spec sheets,
 * and tables into structured key-value specifications.
 */

export interface ParsedSpecResult {
  specs: Record<string, string>;
  count: number;
}

export function parseTechnicalSpecsFromText(rawText: string): ParsedSpecResult {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { specs: {}, count: 0 };
  }

  const text = rawText.trim();
  const specs: Record<string, string> = {};

  // 1. Check if user pasted a raw JSON block
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        for (const [k, v] of Object.entries(parsed)) {
          if (v !== null && v !== undefined && !k.startsWith('_')) {
            const cleanKey = k.trim();
            const cleanVal = typeof v === 'object' ? JSON.stringify(v) : String(v).trim();
            if (cleanKey && cleanVal) {
              specs[cleanKey] = cleanVal;
            }
          }
        }
        if (Object.keys(specs).length > 0) {
          return { specs, count: Object.keys(specs).length };
        }
      }
    } catch {
      // Continue to text parser
    }
  }

  // 2. Pre-process text: normalize line breaks and handle semicolon-separated specs on same line
  // If line contains multiple "Key: Value; Key: Value", split into distinct lines
  let normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Split lines
  const rawLines = normalized.split('\n');
  const lines: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line contains multiple "Key: Value; Key2: Value2"
    if (trimmed.includes(';') && (trimmed.match(/:/g) || []).length > 1) {
      const segments = trimmed.split(';').map(s => s.trim()).filter(Boolean);
      lines.push(...segments);
    } else {
      lines.push(trimmed);
    }
  }

  // 3. Handle Markdown tables: | Metric | Value |
  const isTable = lines.some(l => l.startsWith('|') && l.endsWith('|') && l.includes('|'));
  if (isTable) {
    for (const line of lines) {
      if (line.includes('---')) continue;
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        const k = cells[0].replace(/^[\*\-_#\s]+|[\*\-_#\s]+$/g, '');
        const v = cells.slice(1).join(' ').trim();
        if (
          k &&
          v &&
          !k.toLowerCase().includes('specification') &&
          !k.toLowerCase().includes('parameter') &&
          !k.toLowerCase().includes('metric') &&
          !v.toLowerCase().includes('value')
        ) {
          specs[k] = v;
        }
      }
    }
    if (Object.keys(specs).length > 0) {
      return { specs, count: Object.keys(specs).length };
    }
  }

  // 4. Line-by-line intelligent parsing with lookahead and continuation
  let currentKey = '';
  let currentValue = '';

  const commitPair = () => {
    if (currentKey && currentValue) {
      const cleanKey = currentKey
        .replace(/^[\s•\-\*\d+\.\)\>\[\]]+/g, '') // remove leading bullets or numbers
        .replace(/[:\-–—\s]+$/g, '')              // remove trailing colons/dashes
        .replace(/^[#\s]+/, '')                   // remove markdown heading hashes
        .trim();

      const cleanVal = currentValue
        .replace(/^[:\-–—\s]+/g, '')              // remove leading separator artifacts
        .trim();

      // Only store if key is reasonable length (not an entire essay) and not a pure system metadata key
      if (cleanKey && cleanVal && cleanKey.length >= 2 && cleanKey.length <= 95 && !cleanKey.startsWith('_')) {
        specs[cleanKey] = cleanVal;
      }
    }
    currentKey = '';
    currentValue = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Helper: is next line a new definition?
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    const nextLineHasDef =
      nextLine.includes(':') ||
      nextLine.endsWith(':') ||
      nextLine.includes(' - ') ||
      nextLine.includes(' – ') ||
      nextLine.includes(' — ') ||
      nextLine.includes('\t');

    // Pattern 1: Line ends with a colon -> e.g. "Application Concentration (VAH Requirements):"
    if (line.endsWith(':') && line.length <= 95) {
      commitPair();
      currentKey = line.slice(0, -1).trim();
      continue;
    }

    // Pattern 2: Line contains a colon separating key and value -> "Key: Value"
    if (line.includes(':')) {
      const colonIdx = line.indexOf(':');
      const possibleKey = line.slice(0, colonIdx).trim();
      const possibleVal = line.slice(colonIdx + 1).trim();

      // Ensure key is plausible (e.g. not a URL like "https://..." and not a 200-char paragraph)
      const isUrlProtocol = possibleKey.toLowerCase() === 'http' || possibleKey.toLowerCase() === 'https';
      if (!isUrlProtocol && possibleKey.length >= 2 && possibleKey.length <= 95 && !possibleKey.includes('. ')) {
        commitPair();
        currentKey = possibleKey;
        currentValue = possibleVal;
        continue;
      }
    }

    // Pattern 3: Line contains separator " - ", " – ", " — ", or tab "\t"
    let sep = '';
    if (line.includes('\t')) sep = '\t';
    else if (line.includes(' — ')) sep = ' — ';
    else if (line.includes(' – ')) sep = ' – ';
    else if (line.includes(' - ')) sep = ' - ';

    if (sep) {
      const parts = line.split(sep);
      const k = parts[0].trim();
      const v = parts.slice(1).join(sep).trim();
      if (k.length >= 2 && k.length <= 95 && v.length > 0 && !k.includes('. ')) {
        commitPair();
        currentKey = k;
        currentValue = v;
        continue;
      }
    }

    // Pattern 4: If we have an active key waiting for a value, this line is the value!
    if (currentKey && !currentValue) {
      currentValue = line;
      continue;
    }

    // Pattern 5: Continuation of the current value (e.g. multi-line explanation)
    // Only continue if the current line does not look like a new independent section header
    if (currentKey && currentValue) {
      // If this line has no colon and the NEXT line starts a definition, this line is a section header (e.g. "Spectrum of Activity...")
      if (!line.includes(':') && nextLineHasDef && line.length < 80) {
        commitPair();
        // Skip this section header so it doesn't pollute the previous spec
        continue;
      }
      currentValue = `${currentValue} ${line}`;
      continue;
    }
  }

  // Commit any pending pair at the end
  commitPair();

  return {
    specs,
    count: Object.keys(specs).length,
  };
}
