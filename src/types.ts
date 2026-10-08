export type ReadingMode = 'single' | 'double' | 'webtoon';
export type ReadingDirection = 'ltr' | 'rtl'; // Left-to-Right or Right-to-Left (Manga)
export type PageFit = 'contain' | 'width' | 'height' | 'original';
export type ColorFilter = 'none' | 'sepia' | 'dark' | 'grayscale' | 'high-contrast';

export interface ComicPage {
  index: number;
  filename: string;
  blobUrl: string;
  blob?: Blob;
  width?: number;
  height?: number;
}

export interface ComicMetadata {
  title?: string;
  series?: string;
  number?: string;
  volume?: string;
  summary?: string;
  writer?: string;
  penciller?: string;
  year?: number;
  month?: number;
  pageCount?: number;
  publisher?: string;
  genre?: string;
  languageISO?: string;
}

export interface ComicBook {
  id: string;
  title: string;
  filename: string;
  format: 'cbz' | 'cbr' | 'zip' | 'rar' | 'folder';
  fileSize: number;
  totalPages: number;
  currentPage: number;
  coverBlobUrl?: string;
  coverBlob?: Blob;
  dateAdded: number;
  lastReadDate: number;
  isCompleted: boolean;
  metadata?: ComicMetadata;
  sourceType: 'local' | 'cloud';
  sourceUrl?: string;
}

export interface Bookmark {
  id: string;
  comicId: string;
  pageIndex: number;
  pageNumber: number;
  note?: string;
  createdAt: number;
  thumbnailUrl?: string;
}

export interface ReaderSettings {
  mode: ReadingMode;
  direction: ReadingDirection;
  fit: PageFit;
  firstPageIsCover: boolean; // In double page mode, keep first page single
  filter: ColorFilter;
  brightness: number; // 50 to 150 (percentage)
  contrast: number; // 50 to 150 (percentage)
  autoHideControls: boolean;
  autoHideDelay: number; // in seconds
  swipeSensitivity: number;
  invertTapZones: boolean;
  keyboardShortcutsEnabled: boolean;
  webtoonGap: number; // gap between pages in webtoon mode (0, 4, 8, 16px)
  preserveZoom: boolean;
}

export interface CloudDownloadProgress {
  status: 'idle' | 'downloading' | 'extracting' | 'ready' | 'error';
  progress: number; // 0 - 100
  bytesReceived: number;
  totalBytes: number;
  message: string;
  error?: string;
}
