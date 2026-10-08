import React, { useState, useEffect, useRef } from 'react';
import { 
  ComicBook, 
  ComicPage, 
  ReaderSettings, 
  Bookmark, 
  CloudDownloadProgress 
} from './types';
import { 
  getAllComics, 
  saveComic, 
  updateComicProgress, 
  deleteComic, 
  clearAllComics, 
  getComicFileBlob, 
  getBookmarksByComic, 
  saveBookmark, 
  deleteBookmark, 
  getSavedSettings, 
  saveSettings, 
  defaultSettings 
} from './lib/db';
import { extractComic, revokeComicPages } from './lib/comicExtractor';
import { fetchComicFromCloud } from './lib/cloudFetcher';
import { Navbar } from './components/Navbar';
import { EmptyState } from './components/EmptyState';
import { LibraryView } from './components/LibraryView';
import { ComicReader } from './components/ComicReader';
import { CloudImportModal } from './components/CloudImportModal';
import { ComicInfoModal } from './components/ComicInfoModal';
import { SettingsModal } from './components/SettingsModal';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function App() {
  // App views
  const [activeView, setActiveView] = useState<'empty' | 'library' | 'reader'>('empty');
  
  // Library state
  const [comics, setComics] = useState<ComicBook[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  // Active comic & pages in reader
  const [activeComic, setActiveComic] = useState<ComicBook | null>(null);
  const [activePages, setActivePages] = useState<ComicPage[]>([]);
  const [activeBookmarks, setActiveBookmarks] = useState<Bookmark[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState<{ percent: number; message: string } | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudDownloadProgress, setCloudDownloadProgress] = useState<CloudDownloadProgress | null>(null);
  const [infoComic, setInfoComic] = useState<ComicBook | null>(null);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);

  // Hidden File Inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Load comics and settings from IndexedDB on startup
  useEffect(() => {
    async function initApp() {
      try {
        const [savedComics, savedSettings] = await Promise.all([
          getAllComics(),
          getSavedSettings(),
        ]);
        setComics(savedComics);
        setSettings(savedSettings);
        if (savedComics.length > 0) {
          setActiveView('library');
        } else {
          setActiveView('empty');
        }
      } catch (err) {
        console.error('Failed to initialize local database:', err);
      } finally {
        setIsLoadingLibrary(false);
      }
    }

    initApp();
  }, []);

  // Update Settings
  const handleUpdateSettings = async (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Fullscreen helper
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Process and open a comic file (File or Blob)
  const processAndOpenComic = async (
    fileOrBlob: File | Blob,
    sourceType: 'local' | 'cloud' = 'local',
    sourceUrl?: string
  ) => {
    setIsExtracting(true);
    setExtractionError(null);
    setExtractProgress({ percent: 10, message: 'Preparando archivo...' });

    try {
      const filename = fileOrBlob instanceof File ? fileOrBlob.name : (sourceUrl?.split('/').pop() || 'comic.cbz');
      const cleanTitle = filename.replace(/\.(cbz|cbr|zip|rar)$/i, '').replace(/[-_]/g, ' ');

      const extracted = await extractComic(
        fileOrBlob,
        filename,
        (percent, message) => setExtractProgress({ percent, message })
      );

      const comicId = 'comic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const comic: ComicBook = {
        id: comicId,
        title: extracted.metadata?.title || cleanTitle,
        filename,
        format: extracted.format,
        fileSize: fileOrBlob.size,
        totalPages: extracted.totalPages,
        currentPage: 0,
        coverBlobUrl: extracted.coverBlobUrl,
        coverBlob: extracted.coverBlob,
        dateAdded: Date.now(),
        lastReadDate: Date.now(),
        isCompleted: false,
        metadata: extracted.metadata,
        sourceType,
        sourceUrl,
      };

      // Save to IndexedDB
      await saveComic(comic, fileOrBlob);

      // Clean previously loaded pages if any
      revokeComicPages(activePages);

      // Set active comic and open reader
      setActiveComic(comic);
      setActivePages(extracted.pages);
      setActiveBookmarks([]);
      setActiveView('reader');

      // Refresh library list
      const updatedComics = await getAllComics();
      setComics(updatedComics);
    } catch (err: any) {
      console.error('Error processing comic:', err);
      setExtractionError(err.message || 'No se pudo leer el archivo. Verifica que sea un archivo CBR, CBZ o ZIP válido.');
    } finally {
      setIsExtracting(false);
      setExtractProgress(null);
    }
  };

  // Open an already existing comic from library
  const handleSelectComic = async (comic: ComicBook) => {
    setIsExtracting(true);
    setExtractionError(null);
    setExtractProgress({ percent: 20, message: 'Cargando cómic guardado...' });

    try {
      const cachedBlob = await getComicFileBlob(comic.id);
      if (!cachedBlob) {
        throw new Error('El archivo del cómic no se encuentra en la caché local. Vuelve a abrir el archivo original.');
      }

      const extracted = await extractComic(
        cachedBlob,
        comic.filename,
        (percent, message) => setExtractProgress({ percent, message })
      );

      // Clean previous pages
      revokeComicPages(activePages);

      // Load bookmarks
      const bookmarks = await getBookmarksByComic(comic.id);

      setActiveComic(comic);
      setActivePages(extracted.pages);
      setActiveBookmarks(bookmarks);
      setActiveView('reader');

      // Update last read date
      await updateComicProgress(comic.id, comic.currentPage);
      const updatedComics = await getAllComics();
      setComics(updatedComics);
    } catch (err: any) {
      console.error('Error opening saved comic:', err);
      setExtractionError(err.message || 'Error al abrir el cómic.');
    } finally {
      setIsExtracting(false);
      setExtractProgress(null);
    }
  };

  // Handle local file input selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processAndOpenComic(file, 'local');
      e.target.value = '';
    }
  };

  // Handle folder import
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      // Check if files are direct images or contains cbr/cbz
      const comicFile = files.find(f => f.name.toLowerCase().endsWith('.cbz') || f.name.toLowerCase().endsWith('.cbr') || f.name.toLowerCase().endsWith('.zip'));
      if (comicFile) {
        processAndOpenComic(comicFile, 'local');
      } else {
        // Build a zip from images
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of files) {
          const relativePath = (f as any).webkitRelativePath || f.name;
          zip.file(relativePath, f);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const firstPath = (files[0] as any).webkitRelativePath;
        const folderName = firstPath ? firstPath.split('/')[0] : 'Carpeta de Cómic';
        const fileObj = new File([zipBlob], `${folderName}.cbz`, { type: 'application/x-cbz' });
        processAndOpenComic(fileObj, 'local');
      }
      e.target.value = '';
    }
  };

  // Handle drag and drop files
  const handleFileDrop = (files: FileList | File[]) => {
    if (files.length > 0) {
      const file = files[0];
      processAndOpenComic(file, 'local');
    }
  };

  // Handle Cloud URL Import
  const handleCloudImport = async (url: string) => {
    try {
      const result = await fetchComicFromCloud(url, (progress) => {
        setCloudDownloadProgress(progress);
      });

      setIsCloudModalOpen(false);
      setCloudDownloadProgress(null);

      const file = new File([result.blob], result.filename, { type: result.blob.type });
      await processAndOpenComic(file, 'cloud', url);
    } catch (err) {
      // Handled by modal progress state
      throw err;
    }
  };

  // Page change in reader
  const handlePageChange = async (newPage: number) => {
    if (activeComic) {
      await updateComicProgress(activeComic.id, newPage);
      setActiveComic({
        ...activeComic,
        currentPage: newPage,
        lastReadDate: Date.now(),
      });
    }
  };

  // Bookmarks
  const handleAddBookmark = async (pageIndex: number, note?: string) => {
    if (!activeComic) return;
    const bookmark: Bookmark = {
      id: 'bm_' + Date.now(),
      comicId: activeComic.id,
      pageIndex,
      pageNumber: pageIndex + 1,
      note,
      createdAt: Date.now(),
      thumbnailUrl: activePages[pageIndex]?.blobUrl,
    };
    await saveBookmark(bookmark);
    setActiveBookmarks(prev => [...prev, bookmark]);
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    await deleteBookmark(bookmarkId);
    setActiveBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  // Delete Comic
  const handleDeleteComic = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Deseas eliminar este cómic de tu biblioteca?')) {
      await deleteComic(id);
      const updated = await getAllComics();
      setComics(updated);
      if (activeComic?.id === id) {
        revokeComicPages(activePages);
        setActiveComic(null);
        setActivePages([]);
        setActiveView(updated.length > 0 ? 'library' : 'empty');
      } else if (updated.length === 0) {
        setActiveView('empty');
      }
    }
  };

  // Clear all
  const handleClearAll = async () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar toda tu biblioteca y caché local?')) {
      revokeComicPages(activePages);
      await clearAllComics();
      setComics([]);
      setActiveComic(null);
      setActivePages([]);
      setActiveView('empty');
    }
  };

  const handleBackToLibrary = () => {
    setActiveView(comics.length > 0 ? 'library' : 'empty');
  };

  return (
    <div id="comic-app-root" className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Hidden File Input Pickers */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".cbr,.cbz,.zip,.rar,application/vnd.comicbook+zip,application/x-cbr,application/x-cbz,application/zip,application/x-rar-compressed"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderSelect}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />

      {/* Main Navbar (hidden during active reading, reader has its own full HUD) */}
      {activeView !== 'reader' && (
        <Navbar
          onOpenLocal={() => fileInputRef.current?.click()}
          onOpenCloud={() => setIsCloudModalOpen(true)}
          onOpenLibrary={() => setActiveView(comics.length > 0 ? 'library' : 'empty')}
          onOpenSettings={() => setIsGlobalSettingsOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          activeView={activeView}
          currentComicTitle={activeComic?.title}
          hasComicsInLibrary={comics.length > 0}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {/* Loading Library State */}
        {isLoadingLibrary ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-950">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : activeView === 'reader' && activeComic && activePages.length > 0 ? (
          /* Active Comic Reader View */
          <ComicReader
            comic={activeComic}
            pages={activePages}
            initialPage={activeComic.currentPage || 0}
            onBackToLibrary={handleBackToLibrary}
            onPageChange={handlePageChange}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            bookmarks={activeBookmarks}
            onAddBookmark={handleAddBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            onClearStorage={handleClearAll}
          />
        ) : activeView === 'library' && comics.length > 0 ? (
          /* Library View */
          <LibraryView
            comics={comics}
            onSelectComic={handleSelectComic}
            onDeleteComic={handleDeleteComic}
            onClearAll={handleClearAll}
            onOpenLocal={() => fileInputRef.current?.click()}
            onOpenCloud={() => setIsCloudModalOpen(true)}
            onShowInfo={(c) => setInfoComic(c)}
          />
        ) : (
          /* Clean Empty State Landing View */
          <EmptyState
            onOpenLocal={() => fileInputRef.current?.click()}
            onOpenCloud={() => setIsCloudModalOpen(true)}
            onOpenFolder={() => folderInputRef.current?.click()}
            onFileDrop={handleFileDrop}
            recentComics={comics}
            onSelectComic={handleSelectComic}
            onDeleteComic={handleDeleteComic}
            onClearAll={handleClearAll}
          />
        )}

        {/* Global Archive Extraction Loading Overlay */}
        {isExtracting && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {extractProgress?.message || 'Procesando archivo CBR/CBZ...'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              Descomprimiendo y optimizando imágenes para lectura fluida
            </p>
            {extractProgress && (
              <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${extractProgress.percent}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Extraction Error Dialog */}
        {extractionError && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-red-800/80 p-5 shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Error al abrir el cómic</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{extractionError}</p>
              <button
                onClick={() => setExtractionError(null)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Cloud Import Modal */}
      <CloudImportModal
        isOpen={isCloudModalOpen}
        onClose={() => {
          setIsCloudModalOpen(false);
          setCloudDownloadProgress(null);
        }}
        onImportUrl={handleCloudImport}
        downloadProgress={cloudDownloadProgress}
      />

      {/* Comic Info Modal */}
      <ComicInfoModal
        isOpen={!!infoComic}
        onClose={() => setInfoComic(null)}
        comic={infoComic}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearStorage={handleClearAll}
      />
    </div>
  );
}
