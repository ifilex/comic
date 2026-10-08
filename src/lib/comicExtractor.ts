import JSZip from 'jszip';
import { createExtractorFromData } from 'node-unrar-js';
import { ComicPage, ComicMetadata } from '../types';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.tiff', '.jfif'];

// Natural alphanumeric sort so "page-2.jpg" comes before "page-10.jpg"
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export interface ExtractedComic {
  pages: ComicPage[];
  metadata?: ComicMetadata;
  coverBlobUrl: string;
  coverBlob: Blob;
  format: 'cbz' | 'cbr' | 'zip' | 'rar' | 'folder';
  totalPages: number;
}

function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  // Filter out system files, hidden mac files, thumbnails
  if (lower.startsWith('__macosx/') || lower.includes('/.ds_store') || lower.startsWith('.')) {
    return false;
  }
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

/**
 * Parses ComicInfo.xml metadata if present
 */
function parseComicInfoXml(xmlText: string): ComicMetadata {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    
    const getText = (tag: string) => doc.querySelector(tag)?.textContent?.trim() || undefined;
    const getNum = (tag: string) => {
      const val = doc.querySelector(tag)?.textContent?.trim();
      return val ? parseInt(val, 10) : undefined;
    };

    return {
      title: getText('Title'),
      series: getText('Series'),
      number: getText('Number'),
      volume: getText('Volume'),
      summary: getText('Summary') || getText('Notes'),
      writer: getText('Writer'),
      penciller: getText('Penciller') || getText('Artist'),
      year: getNum('Year'),
      month: getNum('Month'),
      pageCount: getNum('PageCount'),
      publisher: getText('Publisher'),
      genre: getText('Genre'),
      languageISO: getText('LanguageISO'),
    };
  } catch (err) {
    console.warn('Failed to parse ComicInfo.xml:', err);
    return {};
  }
}

/**
 * Extracts comic pages and metadata from a ZIP / CBZ archive
 */
async function extractFromZip(arrayBuffer: ArrayBuffer): Promise<ExtractedComic> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(arrayBuffer);

  let comicInfoXml: string | undefined;
  const imageEntries: { name: string; zipObject: JSZip.JSZipObject }[] = [];

  loadedZip.forEach((relativePath, zipObject) => {
    if (zipObject.dir) return;

    const lower = relativePath.toLowerCase();
    if (lower.endsWith('comicinfo.xml')) {
      // Async extract metadata
      zipObject.async('text').then(text => {
        comicInfoXml = text;
      }).catch(() => {});
    }

    if (isImageFile(relativePath)) {
      imageEntries.push({ name: relativePath, zipObject });
    }
  });

  if (imageEntries.length === 0) {
    throw new Error('No se encontraron imágenes válidas dentro del archivo ZIP/CBZ.');
  }

  // Sort image entries in natural reading order
  imageEntries.sort((a, b) => collator.compare(a.name, b.name));

  // Extract all pages as Blobs
  const pages: ComicPage[] = [];
  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const mimeType = getMimeType(entry.name);
    const blob = await entry.zipObject.async('blob');
    const typedBlob = new Blob([blob], { type: mimeType });
    const blobUrl = URL.createObjectURL(typedBlob);

    pages.push({
      index: i,
      filename: entry.name.split('/').pop() || entry.name,
      blobUrl,
      blob: typedBlob,
    });
  }

  const metadata = comicInfoXml ? parseComicInfoXml(comicInfoXml) : undefined;
  const coverBlob = pages[0].blob || new Blob();
  const coverBlobUrl = pages[0].blobUrl;

  return {
    pages,
    metadata,
    coverBlobUrl,
    coverBlob,
    format: 'cbz',
    totalPages: pages.length,
  };
}

/**
 * Extracts comic pages from a RAR / CBR archive using node-unrar-js or fallback
 */
async function extractFromRar(arrayBuffer: ArrayBuffer): Promise<ExtractedComic> {
  try {
    const extractor = await createExtractorFromData({ data: arrayBuffer });
    const list = extractor.getFileList();
    const fileHeaders = [...list.fileHeaders];

    const imageHeaders = fileHeaders.filter(h => {
      if (h.flags.directory) return false;
      return isImageFile(h.name);
    });

    if (imageHeaders.length === 0) {
      throw new Error('No se encontraron imágenes válidas dentro del archivo CBR/RAR.');
    }

    imageHeaders.sort((a, b) => collator.compare(a.name, b.name));

    const extracted = extractor.extract({
      files: imageHeaders.map(h => h.name),
    });

    const files = [...extracted.files];
    const pages: ComicPage[] = [];

    // Map extracted files back in sorted order
    for (let i = 0; i < imageHeaders.length; i++) {
      const header = imageHeaders[i];
      const match = files.find(f => f.fileHeader.name === header.name);
      if (match && match.extraction) {
        const mimeType = getMimeType(header.name);
        const blob = new Blob([match.extraction], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        pages.push({
          index: i,
          filename: header.name.split('/').pop() || header.name,
          blobUrl,
          blob,
        });
      }
    }

    if (pages.length === 0) {
      throw new Error('No se pudieron extraer las imágenes del archivo RAR.');
    }

    const coverBlob = pages[0].blob || new Blob();
    const coverBlobUrl = pages[0].blobUrl;

    return {
      pages,
      coverBlobUrl,
      coverBlob,
      format: 'cbr',
      totalPages: pages.length,
    };
  } catch (err: any) {
    console.warn('RAR extraction failed, trying ZIP fallback:', err);
    // Many .cbr files are actually misnamed .cbz files
    return await extractFromZip(arrayBuffer);
  }
}

/**
 * Main entry point to extract any comic file (File or Blob or ArrayBuffer)
 */
export async function extractComic(
  fileOrBlob: File | Blob | ArrayBuffer,
  originalFilename?: string,
  onProgress?: (percent: number, msg: string) => void
): Promise<ExtractedComic> {
  onProgress?.(10, 'Analizando archivo...');

  let arrayBuffer: ArrayBuffer;
  let filename = originalFilename || '';

  if (fileOrBlob instanceof File) {
    filename = fileOrBlob.name;
    arrayBuffer = await fileOrBlob.arrayBuffer();
  } else if (fileOrBlob instanceof Blob) {
    arrayBuffer = await fileOrBlob.arrayBuffer();
  } else {
    arrayBuffer = fileOrBlob;
  }

  onProgress?.(30, 'Descomprimiendo páginas...');

  const lowerName = filename.toLowerCase();
  const isRarByName = lowerName.endsWith('.cbr') || lowerName.endsWith('.rar');

  // Check magic bytes
  const bytes = new Uint8Array(arrayBuffer.slice(0, 8));
  const isZipMagic = bytes[0] === 0x50 && bytes[1] === 0x4b; // PK..
  const isRarMagic = (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21); // Rar!

  let result: ExtractedComic;

  if (isRarMagic || (isRarByName && !isZipMagic)) {
    try {
      result = await extractFromRar(arrayBuffer);
    } catch (e) {
      // Fallback to zip
      result = await extractFromZip(arrayBuffer);
    }
  } else {
    try {
      result = await extractFromZip(arrayBuffer);
    } catch (e) {
      // Fallback to rar if zip failed
      result = await extractFromRar(arrayBuffer);
    }
  }

  onProgress?.(90, 'Generando miniaturas y carátula...');

  // Set proper format
  if (lowerName.endsWith('.cbr')) result.format = 'cbr';
  else if (lowerName.endsWith('.cbz')) result.format = 'cbz';
  else if (lowerName.endsWith('.rar')) result.format = 'rar';
  else if (lowerName.endsWith('.zip')) result.format = 'zip';

  onProgress?.(100, '¡Listo para leer!');
  return result;
}

/**
 * Revokes all object URLs created for comic pages to prevent memory leaks
 */
export function revokeComicPages(pages: ComicPage[]) {
  for (const p of pages) {
    if (p.blobUrl && p.blobUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(p.blobUrl);
      } catch (e) {
        // ignore
      }
    }
  }
}
