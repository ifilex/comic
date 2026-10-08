import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ComicBook, Bookmark, ReaderSettings } from '../types';

interface ComicDBSchema extends DBSchema {
  comics: {
    key: string;
    value: ComicBook;
    indexes: { 'by-lastRead': number; 'by-title': string };
  };
  comic_files: {
    key: string;
    value: { id: string; blob: Blob; filename: string };
  };
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-comicId': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'cbr-cbz-comic-reader-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ComicDBSchema>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ComicDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('comics')) {
          const comicStore = db.createObjectStore('comics', { keyPath: 'id' });
          comicStore.createIndex('by-lastRead', 'lastReadDate');
          comicStore.createIndex('by-title', 'title');
        }
        if (!db.objectStoreNames.contains('comic_files')) {
          db.createObjectStore('comic_files', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('by-comicId', 'comicId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export const defaultSettings: ReaderSettings = {
  mode: 'single',
  direction: 'ltr',
  fit: 'contain',
  firstPageIsCover: true,
  filter: 'none',
  brightness: 100,
  contrast: 100,
  autoHideControls: true,
  autoHideDelay: 3.5,
  swipeSensitivity: 50,
  invertTapZones: false,
  keyboardShortcutsEnabled: true,
  webtoonGap: 0,
  preserveZoom: false,
};

// Comic operations
export async function getAllComics(): Promise<ComicBook[]> {
  try {
    const db = await getDB();
    const comics = await db.getAllFromIndex('comics', 'by-lastRead');
    return comics.reverse(); // most recent first
  } catch (err) {
    console.error('Error fetching comics from DB:', err);
    return [];
  }
}

export async function getComicById(id: string): Promise<ComicBook | undefined> {
  const db = await getDB();
  return db.get('comics', id);
}

export async function saveComic(comic: ComicBook, fileBlob?: Blob): Promise<void> {
  const db = await getDB();
  await db.put('comics', comic);
  if (fileBlob) {
    try {
      await db.put('comic_files', {
        id: comic.id,
        blob: fileBlob,
        filename: comic.filename,
      });
    } catch (e) {
      console.warn('Could not cache comic file in IndexedDB (likely quota exceeded):', e);
    }
  }
}

export async function updateComicProgress(id: string, currentPage: number, isCompleted: boolean = false): Promise<void> {
  const db = await getDB();
  const comic = await db.get('comics', id);
  if (comic) {
    comic.currentPage = currentPage;
    comic.lastReadDate = Date.now();
    comic.isCompleted = isCompleted || currentPage >= comic.totalPages - 1;
    await db.put('comics', comic);
  }
}

export async function getComicFileBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    const record = await db.get('comic_files', id);
    return record ? record.blob : null;
  } catch (e) {
    console.error('Error getting comic file blob:', e);
    return null;
  }
}

export async function deleteComic(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('comics', id);
  await db.delete('comic_files', id);
  
  // Also delete associated bookmarks
  const bookmarks = await getBookmarksByComic(id);
  for (const b of bookmarks) {
    await db.delete('bookmarks', b.id);
  }
}

export async function clearAllComics(): Promise<void> {
  const db = await getDB();
  await db.clear('comics');
  await db.clear('comic_files');
  await db.clear('bookmarks');
}

// Bookmarks operations
export async function getBookmarksByComic(comicId: string): Promise<Bookmark[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex('bookmarks', 'by-comicId', comicId);
  } catch (err) {
    console.error('Error getting bookmarks:', err);
    return [];
  }
}

export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  const db = await getDB();
  await db.put('bookmarks', bookmark);
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('bookmarks', id);
}

// Settings operations
export async function getSavedSettings(): Promise<ReaderSettings> {
  try {
    const db = await getDB();
    const saved = await db.get('settings', 'readerSettings');
    return saved ? { ...defaultSettings, ...saved } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: ReaderSettings): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', settings, 'readerSettings');
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}
