import React, { useState, useMemo } from 'react';
import { 
  Library, 
  Search, 
  Trash2, 
  BookOpen, 
  Play, 
  Info, 
  Plus, 
  Cloud, 
  FolderOpen, 
  SortAsc, 
  Grid, 
  List, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { ComicBook } from '../types';

interface LibraryViewProps {
  comics: ComicBook[];
  onSelectComic: (comic: ComicBook) => void;
  onDeleteComic: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  onOpenLocal: () => void;
  onOpenCloud: () => void;
  onShowInfo: (comic: ComicBook) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  comics,
  onSelectComic,
  onDeleteComic,
  onClearAll,
  onOpenLocal,
  onOpenCloud,
  onShowInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'pages' | 'size'>('recent');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  const filteredComics = useMemo(() => {
    let result = comics.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'recent') return b.lastReadDate - a.lastReadDate;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'pages') return b.totalPages - a.totalPages;
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return 0;
    });

    return result;
  }, [comics, searchQuery, sortBy]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div id="library-view-container" className="flex-1 w-full h-full overflow-y-auto bg-zinc-950 px-4 sm:px-6 py-6 text-zinc-100 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Top Header & Search / Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Library className="w-6 h-6 text-indigo-400" />
              <span>Mi Biblioteca</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {comics.length} {comics.length === 1 ? 'cómic' : 'cómics'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Cómics guardados y leídos en este dispositivo
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenLocal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Abrir Local</span>
            </button>

            <button
              onClick={onOpenCloud}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 text-xs font-medium transition-all"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Desde Nube</span>
            </button>

            {comics.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-850 transition-all text-xs"
                title="Vaciar toda la biblioteca"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search, Sort, View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="library-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o nombre de archivo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sort & Layout */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300">
              <SortAsc className="w-3.5 h-3.5 text-zinc-400" />
              <select
                id="library-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="recent" className="bg-zinc-900">Más recientes</option>
                <option value="title" className="bg-zinc-900">Título (A-Z)</option>
                <option value="pages" className="bg-zinc-900">Nº de Páginas</option>
                <option value="size" className="bg-zinc-900">Tamaño</option>
              </select>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-xl">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Vista en cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Vista en lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Comics List / Grid */}
        {filteredComics.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 bg-zinc-900/40 rounded-2xl border border-zinc-850 p-6">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-300 mb-1">
              {searchQuery ? 'No se encontraron cómics con esa búsqueda' : 'Tu biblioteca está limpia y vacía'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              {searchQuery ? 'Intenta con otro término o limpia la barra de búsqueda.' : 'Abre un cómic local o desde la nube para comenzar a leer.'}
            </p>
            {!searchQuery && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onOpenLocal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md"
                >
                  Abrir Cómic Local
                </button>
                <button
                  onClick={onOpenCloud}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
                >
                  Abrir desde Nube
                </button>
              </div>
            )}
          </div>
        ) : viewLayout === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredComics.map((comic) => {
              const progressPct = Math.round(((comic.currentPage + 1) / Math.max(1, comic.totalPages)) * 100);
              return (
                <div
                  key={comic.id}
                  onClick={() => onSelectComic(comic)}
                  className="group relative flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/20"
                >
                  {/* Cover */}
                  <div className="aspect-[2/3] w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                    {comic.coverBlobUrl ? (
                      <img
                        src={comic.coverBlobUrl}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-zinc-700" />
                    )}

                    {/* Format Badge */}
                    <span className="absolute top-2 left-2 uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-zinc-200 backdrop-blur-sm border border-white/10">
                      {comic.format}
                    </span>

                    {/* Source badge */}
                    {comic.sourceType === 'cloud' && (
                      <span className="absolute top-2 right-2 p-1 rounded bg-black/80 text-sky-400 backdrop-blur-sm">
                        <Cloud className="w-3 h-3" />
                      </span>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowInfo(comic);
                        }}
                        title="Ver detalles"
                        className="p-1.5 rounded-lg bg-black/80 text-zinc-300 hover:text-white backdrop-blur-sm hover:bg-black"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => onDeleteComic(comic.id, e)}
                        title="Eliminar cómic"
                        className="p-1.5 rounded-lg bg-black/80 text-zinc-300 hover:text-red-400 backdrop-blur-sm hover:bg-black"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Play button hover */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800/90">
                      <div
                        className={`h-full transition-all ${
                          comic.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Comic Details */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white line-clamp-2 leading-tight" title={comic.title}>
                      {comic.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-zinc-850">
                      <span>Pág. {comic.currentPage + 1} / {comic.totalPages}</span>
                      <span className={`font-semibold ${comic.isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredComics.map((comic) => {
              const progressPct = Math.round(((comic.currentPage + 1) / Math.max(1, comic.totalPages)) * 100);
              return (
                <div
                  key={comic.id}
                  onClick={() => onSelectComic(comic)}
                  className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-zinc-850/70"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-16 rounded-lg bg-zinc-950 overflow-hidden shrink-0 relative flex items-center justify-center border border-zinc-800">
                      {comic.coverBlobUrl ? (
                        <img src={comic.coverBlobUrl} alt={comic.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-zinc-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {comic.format}
                        </span>
                        <h3 className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-md">
                          {comic.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>{comic.totalPages} páginas</span>
                        <span>•</span>
                        <span>{formatFileSize(comic.fileSize)}</span>
                        <span>•</span>
                        <span>Última lectura: {formatDate(comic.lastReadDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-2">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-semibold text-zinc-300">Pág. {comic.currentPage + 1} / {comic.totalPages}</span>
                      <div className="w-24 h-1.5 rounded-full bg-zinc-800 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${comic.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowInfo(comic);
                      }}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Detalles"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => onDeleteComic(comic.id, e)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
