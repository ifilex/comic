import React, { useState } from 'react';
import { X, Bookmark as BookmarkIcon, Trash2, Plus, Calendar, ArrowRight } from 'lucide-react';
import { Bookmark, ComicPage } from '../types';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  currentPage: number;
  onAddBookmark: (note?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onJumpToPage: (pageIndex: number) => void;
  pages: ComicPage[];
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  currentPage,
  onAddBookmark,
  onDeleteBookmark,
  onJumpToPage,
  pages,
}) => {
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBookmark(note.trim() || undefined);
    setNote('');
    setIsAdding(false);
  };

  const isCurrentBookmarked = bookmarks.some(b => b.pageIndex === currentPage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-bookmarks"
        className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookmarkIcon className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Marcadores</h3>
              <p className="text-xs text-zinc-400">{bookmarks.length} guardados en este cómic</p>
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
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Quick add current page */}
          {!isAdding ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="text-xs text-zinc-300">
                <span>Página actual: <strong className="text-white">Pág. {currentPage + 1}</strong></span>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                disabled={isCurrentBookmarked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCurrentBookmarked
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold shadow-md active:scale-95'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCurrentBookmarked ? 'Ya guardada' : 'Marcar página actual'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>Guardar marcador en Pág. {currentPage + 1}</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota o descripción (opcional)..."
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {/* List of bookmarks */}
          {bookmarks.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              <BookmarkIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-50" />
              <p>No tienes marcadores guardados en este cómic.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark) => {
                const pageThumbnail = pages[bookmark.pageIndex]?.blobUrl;
                return (
                  <div
                    key={bookmark.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div
                      onClick={() => {
                        onJumpToPage(bookmark.pageIndex);
                        onClose();
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-14 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                        {pageThumbnail && (
                          <img src={pageThumbnail} alt={`Página ${bookmark.pageNumber}`} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400">
                            Página {bookmark.pageNumber}
                          </span>
                          {bookmark.pageIndex === currentPage && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-indigo-300">
                              Actual
                            </span>
                          )}
                        </div>
                        {bookmark.note && (
                          <p className="text-xs text-zinc-300 truncate mt-0.5">{bookmark.note}</p>
                        )}
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(bookmark.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onJumpToPage(bookmark.pageIndex);
                          onClose();
                        }}
                        title="Ir a esta página"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-900 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBookmark(bookmark.id)}
                        title="Eliminar marcador"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
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
    </div>
  );
};
