import React, { useState } from 'react';
import { 
  FolderOpen, 
  Cloud, 
  UploadCloud, 
  FileText, 
  Layers, 
  Smartphone, 
  Tablet, 
  Monitor, 
  BookOpen, 
  Sparkles, 
  Keyboard, 
  HelpCircle,
  Clock,
  Trash2,
  Play
} from 'lucide-react';
import { ComicBook } from '../types';

interface EmptyStateProps {
  onOpenLocal: () => void;
  onOpenCloud: () => void;
  onOpenFolder: () => void;
  onFileDrop: (files: FileList | File[]) => void;
  recentComics: ComicBook[];
  onSelectComic: (comic: ComicBook) => void;
  onDeleteComic: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenLocal,
  onOpenCloud,
  onOpenFolder,
  onFileDrop,
  recentComics,
  onSelectComic,
  onDeleteComic,
  onClearAll,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files);
    }
  };

  return (
    <div
      id="empty-state-view"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 w-full h-full overflow-y-auto bg-zinc-950 px-4 py-8 sm:py-12 flex flex-col items-center justify-start relative text-zinc-100"
    >
      {/* Dragging Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 p-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Suelta tu cómic aquí</h2>
          <p className="text-sm text-indigo-200">Formatos compatibles: .cbr, .cbz, .zip, .rar o imágenes</p>
        </div>
      )}

      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Clean Header Greeting */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lector universal de cómics y manga</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Lector de Cómics CBR & CBZ
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Interfaz limpia, fluida y adaptable. Abre tus cómics desde tu almacenamiento local o directamente desde la nube.
          </p>
        </div>

        {/* Primary Action Drop Zone Card */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Open Local File Card */}
          <button
            id="card-open-local"
            onClick={onOpenLocal}
            className="group relative flex flex-col items-start p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/60 border border-zinc-800 hover:border-indigo-500/50 transition-all duration-200 text-left hover:shadow-lg hover:shadow-indigo-950/20 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">
              Abrir archivo local
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-4 leading-relaxed">
              Selecciona o arrastra cualquier archivo <strong className="text-zinc-200">.CBR</strong>, <strong className="text-zinc-200">.CBZ</strong>, <strong className="text-zinc-200">.ZIP</strong> o <strong className="text-zinc-200">.RAR</strong> desde tu dispositivo.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span>Examinar archivos</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>

          {/* Open from Cloud Card */}
          <button
            id="card-open-cloud"
            onClick={onOpenCloud}
            className="group relative flex flex-col items-start p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/60 border border-zinc-800 hover:border-sky-500/50 transition-all duration-200 text-left hover:shadow-lg hover:shadow-sky-950/20 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 group-hover:text-sky-300 transition-colors">
              Abrir desde la nube
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-4 leading-relaxed">
              Descarga y lee mediante enlace público directo, Google Drive, Dropbox, OneDrive, WebDAV o servidor URL.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-sky-400 font-medium">
              <span>Ingresar enlace</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Secondary helper: Drag & drop reminder & Folder import */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-850 text-xs sm:text-sm text-zinc-400 mb-10">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>También puedes arrastrar archivos directamente sobre esta ventana.</span>
          </div>
          <button
            id="btn-open-folder"
            onClick={onOpenFolder}
            className="text-zinc-300 hover:text-white underline underline-offset-4 flex items-center gap-1.5 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Abrir carpeta con imágenes</span>
          </button>
        </div>

        {/* Recent Comics / Saved Reading History (If any) */}
        {recentComics && recentComics.length > 0 && (
          <div className="w-full mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-semibold text-zinc-200">Continuar leyendo</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {recentComics.length}
                </span>
              </div>
              <button
                id="btn-clear-history"
                onClick={onClearAll}
                title="Limpiar historial"
                className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {recentComics.map((comic) => {
                const progressPct = Math.round(((comic.currentPage + 1) / Math.max(1, comic.totalPages)) * 100);
                return (
                  <div
                    key={comic.id}
                    onClick={() => onSelectComic(comic)}
                    className="group relative flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/60 overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Cover Image */}
                    <div className="aspect-[2/3] w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                      {comic.coverBlobUrl ? (
                        <img
                          src={comic.coverBlobUrl}
                          alt={comic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="w-10 h-10 text-zinc-700" />
                      )}

                      {/* Format tag */}
                      <span className="absolute top-2 left-2 uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-zinc-200 backdrop-blur-sm">
                        {comic.format}
                      </span>

                      {/* Delete button */}
                      <button
                        onClick={(e) => onDeleteComic(comic.id, e)}
                        title="Eliminar de la biblioteca"
                        className="absolute top-2 right-2 p-1 rounded-md bg-black/70 text-zinc-400 hover:text-red-400 hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
                        <div
                          className="h-full bg-indigo-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Comic details */}
                    <div className="p-2.5 flex flex-col flex-1">
                      <h4 className="text-xs sm:text-sm font-medium text-zinc-200 truncate group-hover:text-white" title={comic.title}>
                        {comic.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span>Pág. {comic.currentPage + 1} / {comic.totalPages}</span>
                        <span className="text-indigo-400 font-medium">{progressPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Device & Feature Adaptability Highlights */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-zinc-850">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850/60">
            <div className="p-2 rounded-lg bg-zinc-800 text-indigo-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Móviles & Táctil</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Gestos táctiles de deslizamiento, zonas de toque rápido, modo Webtoon vertical y zoom con dos dedos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850/60">
            <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Tablets & iPads</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Modo doble página con soporte de portada única, navegación por miniaturas y modo Manga (RTL).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850/60">
            <div className="p-2 rounded-lg bg-zinc-800 text-sky-400 shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">PC & Escritorio</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Atajos de teclado completos (flechas, espacio, F para pantalla completa, M para modo manga), rueda de ratón.
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts quick toggle */}
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{showShortcuts ? 'Ocultar atajos de teclado' : 'Ver atajos de teclado y controles'}</span>
          </button>
        </div>

        {showShortcuts && (
          <div className="mt-3 w-full max-w-xl p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Página siguiente</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">→ / Espacio</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Página anterior</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">← / Shift+Espacio</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Pantalla completa</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">F</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Modo Manga (RTL)</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">M</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Modo Doble Página</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">D</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Modo Webtoon (Scroll)</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">V</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Guardar Marcador</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">B</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span>Cerrar cómic / Esc</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-200">Esc</kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
