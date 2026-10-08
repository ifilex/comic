import React, { useEffect, useRef } from 'react';
import { X, Bookmark as BookmarkIcon } from 'lucide-react';
import { ComicPage, Bookmark } from '../types';

interface ThumbnailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: ComicPage[];
  currentPage: number;
  onSelectPage: (index: number) => void;
  bookmarks: Bookmark[];
}

export const ThumbnailDrawer: React.FC<ThumbnailDrawerProps> = ({
  isOpen,
  onClose,
  pages,
  currentPage,
  onSelectPage,
  bookmarks,
}) => {
  const currentThumbRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen && currentThumbRef.current) {
      currentThumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, currentPage]);

  if (!isOpen) return null;

  const bookmarkedIndices = new Set(bookmarks.map(b => b.pageIndex));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="thumbnail-drawer"
        className="w-full max-w-sm sm:max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-100 animate-slideLeft"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Miniaturas de páginas</h3>
            <p className="text-xs text-zinc-400">{pages.length} páginas en total</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
          {pages.map((page, idx) => {
            const isCurrent = idx === currentPage;
            const isBookmarked = bookmarkedIndices.has(idx);

            return (
              <button
                key={page.index}
                ref={isCurrent ? currentThumbRef : undefined}
                onClick={() => {
                  onSelectPage(idx);
                  onClose();
                }}
                className={`group relative flex flex-col items-center rounded-xl overflow-hidden border transition-all text-left ${
                  isCurrent
                    ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-950/40 shadow-lg'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                }`}
              >
                <div className="aspect-[2/3] w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={page.blobUrl}
                    alt={`Página ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isBookmarked && (
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-amber-500 text-zinc-950 shadow-md">
                      <BookmarkIcon className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>
                <div className="w-full py-1 px-1.5 bg-zinc-900 flex items-center justify-between text-[11px]">
                  <span className={isCurrent ? 'font-bold text-indigo-400' : 'text-zinc-400'}>
                    Pág. {idx + 1}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
