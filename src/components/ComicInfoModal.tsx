import React from 'react';
import { X, BookOpen, User, Calendar, FileText, HardDrive, Layers, Globe, Tag } from 'lucide-react';
import { ComicBook } from '../types';

interface ComicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  comic: ComicBook | null;
}

export const ComicInfoModal: React.FC<ComicInfoModalProps> = ({
  isOpen,
  onClose,
  comic,
}) => {
  if (!isOpen || !comic) return null;

  const meta = comic.metadata;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-comic-info"
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Detalles del Cómic</h3>
              <p className="text-xs text-zinc-400">Información y metadatos ComicInfo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-36 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
              {comic.coverBlobUrl ? (
                <img src={comic.coverBlobUrl} alt={comic.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <BookOpen className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                Formato {comic.format}
              </span>
              <h2 className="text-base font-bold text-white leading-tight mt-1">{comic.title}</h2>
              {meta?.series && (
                <p className="text-xs text-zinc-400">Serie: <span className="text-zinc-200">{meta.series} {meta.number ? `#${meta.number}` : ''}</span></p>
              )}
              {meta?.publisher && (
                <p className="text-xs text-zinc-400">Editorial: <span className="text-zinc-200">{meta.publisher}</span></p>
              )}
              {meta?.year && (
                <p className="text-xs text-zinc-400">Año: <span className="text-zinc-200">{meta.year}</span></p>
              )}
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Total de páginas</span>
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {comic.totalPages} páginas
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Tamaño de archivo</span>
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                {formatFileSize(comic.fileSize)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Origen del archivo</span>
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                {comic.sourceType === 'cloud' ? 'Descargado de la nube' : 'Archivo local'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Archivo original</span>
              <span className="font-semibold text-zinc-200 truncate block" title={comic.filename}>
                {comic.filename}
              </span>
            </div>
          </div>

          {/* Extended ComicInfo Metadata */}
          {meta && (meta.writer || meta.penciller || meta.genre || meta.summary) && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs">
              <h4 className="font-semibold text-zinc-300 border-b border-zinc-850 pb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Metadatos ComicInfo</span>
              </h4>

              {meta.writer && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 min-w-16">Guionista:</span>
                  <span className="text-zinc-200 font-medium">{meta.writer}</span>
                </div>
              )}

              {meta.penciller && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 min-w-16">Dibujante:</span>
                  <span className="text-zinc-200 font-medium">{meta.penciller}</span>
                </div>
              )}

              {meta.genre && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 min-w-16">Género:</span>
                  <span className="text-zinc-200">{meta.genre}</span>
                </div>
              )}

              {meta.summary && (
                <div className="pt-1.5">
                  <span className="text-zinc-500 block mb-1">Sinopsis:</span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed bg-zinc-900 p-2.5 rounded-lg">
                    {meta.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
