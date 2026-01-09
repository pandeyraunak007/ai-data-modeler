import { DataModel } from '@/types/model';

// Use pako for compression (lightweight zlib implementation)
// We'll use native browser APIs for base64 encoding

/**
 * Simple LZW-based compression for URL encoding
 * More reliable than CompressionStream for cross-browser compatibility
 */
function compress(str: string): string {
  const dict: { [key: string]: number } = {};
  const data = (str + '').split('');
  const out: number[] = [];
  let currChar: string;
  let phrase = data[0];
  let code = 256;

  for (let i = 0; i < 256; i++) {
    dict[String.fromCharCode(i)] = i;
  }

  for (let i = 1; i < data.length; i++) {
    currChar = data[i];
    if (dict[phrase + currChar] != null) {
      phrase += currChar;
    } else {
      out.push(dict[phrase]);
      dict[phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  out.push(dict[phrase]);

  // Convert to string
  return out.map((code) => String.fromCharCode(code)).join('');
}

/**
 * Decompress LZW-compressed string
 */
function decompress(str: string): string {
  const dict: { [key: number]: string } = {};
  const data = (str + '').split('');
  let currChar = data[0];
  let oldPhrase = currChar;
  const out = [currChar];
  let code = 256;
  let phrase: string;

  for (let i = 0; i < 256; i++) {
    dict[i] = String.fromCharCode(i);
  }

  for (let i = 1; i < data.length; i++) {
    const currCode = data[i].charCodeAt(0);
    if (currCode < 256) {
      phrase = data[i];
    } else {
      phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
    }
    out.push(phrase);
    currChar = phrase.charAt(0);
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  return out.join('');
}

/**
 * Convert string to URL-safe base64
 */
function stringToBase64Url(str: string): string {
  // Use encodeURIComponent to handle unicode, then base64 encode
  const utf8 = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))
  );
  const base64 = btoa(utf8);
  // Make URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert URL-safe base64 to string
 */
function base64UrlToString(str: string): string {
  // Restore standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  const utf8 = atob(base64);
  // Decode URI component
  return decodeURIComponent(
    utf8
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Create a minimal model for sharing (strip unnecessary data)
 */
function createShareableModel(model: DataModel): object {
  return {
    n: model.name,
    d: model.description,
    db: model.targetDatabase,
    e: model.entities.map((entity) => ({
      i: entity.id,
      n: entity.name,
      pn: entity.physicalName,
      d: entity.description,
      c: entity.category,
      x: Math.round(entity.x),
      y: Math.round(entity.y),
      w: entity.width,
      h: entity.height,
      a: entity.attributes.map((attr) => ({
        i: attr.id,
        n: attr.name,
        t: attr.type,
        pk: attr.isPrimaryKey || undefined,
        fk: attr.isForeignKey || undefined,
        rq: attr.isRequired || undefined,
        uq: attr.isUnique || undefined,
        ix: attr.isIndexed || undefined,
        df: attr.defaultValue || undefined,
      })),
    })),
    r: model.relationships.map((rel) => ({
      i: rel.id,
      n: rel.name,
      t: rel.type,
      si: rel.sourceEntityId,
      ti: rel.targetEntityId,
      sc: rel.sourceCardinality,
      tc: rel.targetCardinality,
      sa: rel.sourceAttribute,
      ta: rel.targetAttribute,
    })),
  };
}

/**
 * Restore full model from shareable format
 */
function restoreFromShareableModel(data: any): DataModel {
  return {
    id: `shared-${Date.now()}`,
    name: data.n || 'Shared Model',
    description: data.d || '',
    targetDatabase: data.db || 'postgresql',
    notation: 'crowsfoot',
    entities: (data.e || []).map((entity: any) => ({
      id: entity.i,
      name: entity.n,
      physicalName: entity.pn || entity.n?.toLowerCase().replace(/\s+/g, '_'),
      description: entity.d || '',
      category: entity.c || 'standard',
      x: entity.x || 0,
      y: entity.y || 0,
      width: entity.w || 200,
      height: entity.h || 100,
      attributes: (entity.a || []).map((attr: any) => ({
        id: attr.i,
        name: attr.n,
        type: attr.t,
        isPrimaryKey: !!attr.pk,
        isForeignKey: !!attr.fk,
        isRequired: !!attr.rq,
        isUnique: !!attr.uq,
        isIndexed: !!attr.ix,
        defaultValue: attr.df,
      })),
    })),
    relationships: (data.r || []).map((rel: any) => ({
      id: rel.i,
      name: rel.n,
      type: rel.t || 'non-identifying',
      sourceEntityId: rel.si,
      targetEntityId: rel.ti,
      sourceCardinality: rel.sc || '1',
      targetCardinality: rel.tc || 'M',
      sourceAttribute: rel.sa,
      targetAttribute: rel.ta,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Encode a model to a shareable URL hash
 */
export function encodeModelToUrl(model: DataModel): string {
  const shareableModel = createShareableModel(model);
  const jsonStr = JSON.stringify(shareableModel);
  const compressed = compress(jsonStr);
  const encoded = stringToBase64Url(compressed);
  return encoded;
}

/**
 * Decode a model from a URL hash
 */
export function decodeModelFromUrl(encoded: string): DataModel | null {
  try {
    const compressed = base64UrlToString(encoded);
    const jsonStr = decompress(compressed);
    const shareableModel = JSON.parse(jsonStr);
    return restoreFromShareableModel(shareableModel);
  } catch (error) {
    console.error('Failed to decode model from URL:', error);
    return null;
  }
}

/**
 * Generate a shareable URL for a model
 */
export function generateShareUrl(model: DataModel): string {
  const encoded = encodeModelToUrl(model);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/workspace?share=${encoded}`;
}

/**
 * Check if URL contains a shared model and extract it
 */
export function extractSharedModel(): DataModel | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const shareData = params.get('share');

  if (!shareData) return null;

  return decodeModelFromUrl(shareData);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Estimate the size of the encoded URL
 */
export function estimateUrlSize(model: DataModel): number {
  const shareableModel = createShareableModel(model);
  const jsonStr = JSON.stringify(shareableModel);
  // Rough estimate: compressed is usually 30-50% of original, then base64 adds ~33%
  return Math.ceil(jsonStr.length * 0.5 * 1.33);
}

/**
 * Check if a model is too large to share via URL (>8KB encoded is risky)
 */
export function isModelTooLargeForUrl(model: DataModel): boolean {
  return estimateUrlSize(model) > 8000;
}
