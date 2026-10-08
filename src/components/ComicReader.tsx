import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ComicBook, ComicPage, ReaderSettings, Bookmark } from '../types';
import { ReaderControls } from './ReaderControls';
import { ThumbnailDrawer } from './ThumbnailDrawer';
import { BookmarksModal } from './BookmarksModal';
import { ComicInfoModal } from './ComicInfoModal';
import { SettingsModal } from './SettingsModal';

interface ComicReaderProps {
  comic: ComicBook;
  pages: ComicPage[];
  initialPage: number;
  onBackToLibrary: () => void;
  onPageChange: (pageIndex: number) => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: ReaderSettings) => void;
  bookmarks: Bookmark[];
  onAddBookmark: (pageIndex: number, note?: string) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onClearStorage: () => void;
}

export const ComicReader: React.FC<ComicReaderProps> = ({
  comic,
  pages,
  initialPage,
  onBackToLibrary,
  onPageChange,
  settings,
  onUpdateSettings,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  onClearStorage,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Modals & Drawers state
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for gestures & auto-hide
  const readerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number; distance: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const webtoonContainerRef = useRef<HTMLDivElement | null>(null);
  const webtoonPageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalPages = pages.length;

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (settings.autoHideControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, settings.autoHideDelay * 1000);
    }
  }, [settings.autoHideControls, settings.autoHideDelay]);

  const showControlsTemporarily = useCallback(() => {
    setIsControlsVisible(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimer]);

  // Page change handler
  const handleGoToPage = useCallback((newIndex: number) => {
    const clamped = Math.max(0, Math.min(totalPages - 1, newIndex));
    setCurrentPage(clamped);
    onPageChange(clamped);
    if (!settings.preserveZoom) {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }

    // If webtoon mode, scroll to that page element
    if (settings.mode === 'webtoon' && webtoonPageRefs.current[clamped]) {
      webtoonPageRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalPages, onPageChange, settings.preserveZoom, settings.mode]);

  const handleNext = useCallback(() => {
    if (settings.mode === 'double') {
      if (settings.firstPageIsCover && currentPage === 0) {
        handleGoToPage(1);
      } else {
        handleGoToPage(currentPage + 2);
      }
    } else {
      handleGoToPage(currentPage + 1);
    }
  }, [currentPage, settings.mode, settings.firstPageIsCover, handleGoToPage]);

  const handlePrev = useCallback(() => {
    if (settings.mode === 'double') {
      if (settings.firstPageIsCover && currentPage <= 2) {
        handleGoToPage(0);
      } else {
        handleGoToPage(currentPage - 2);
      }
    } else {
      handleGoToPage(currentPage - 1);
    }
  }, [currentPage, settings.mode, settings.firstPageIsCover, handleGoToPage]);

  // Keyboard Navigation
  useEffect(() => {
    if (!settings.keyboardShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input or modal is active
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const isRtl = settings.direction === 'rtl';

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          showControlsTemporarily();
          isRtl ? handlePrev() : handleNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          showControlsTemporarily();
          isRtl ? handleNext() : handlePrev();
          break;
        case ' ': // Space bar
          e.preventDefault();
          showControlsTemporarily();
          if (e.shiftKey) {
            isRtl ? handleNext() : handlePrev();
          } else {
            isRtl ? handlePrev() : handleNext();
          }
          break;
        case 'Home':
          e.preventDefault();
          handleGoToPage(0);
          break;
        case 'End':
          e.preventDefault();
          handleGoToPage(totalPages - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          onUpdateSettings({ ...settings, direction: settings.direction === 'ltr' ? 'rtl' : 'ltr' });
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          onUpdateSettings({ ...settings, mode: settings.mode === 'double' ? 'single' : 'double' });
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          onUpdateSettings({ ...settings, mode: settings.mode === 'webtoon' ? 'single' : 'webtoon' });
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          handleToggleBookmark();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'Escape':
          if (isThumbnailsOpen || isBookmarksOpen || isInfoOpen || isSettingsOpen) {
            setIsThumbnailsOpen(false);
            setIsBookmarksOpen(false);
            setIsInfoOpen(false);
            setIsSettingsOpen(false);
          } else {
            onBackToLibrary();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    settings,
    handleNext,
    handlePrev,
    handleGoToPage,
    totalPages,
    isThumbnailsOpen,
    isBookmarksOpen,
    isInfoOpen,
    isSettingsOpen,
    onBackToLibrary,
    onUpdateSettings,
    showControlsTemporarily,
  ]);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(0.75, prev - 0.25);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    showControlsTemporarily();
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile/tablet gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    showControlsTemporarily();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        distance: 0,
      };

      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
      }
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
        time: Date.now(),
        distance,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      const touch = e.touches[0];
      setPanPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartRef.current && touchStartRef.current.distance > 0) {
      // Pinch zoom in action
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDistance / touchStartRef.current.distance;
      setZoomLevel(prev => Math.min(3, Math.max(0.75, prev * ratio)));
      touchStartRef.current.distance = currentDistance;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);

    if (!touchStartRef.current) return;
    const { x: startX, y: startY, time: startTime } = touchStartRef.current;
    const duration = Date.now() - startTime;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    // If zoomed in, don't trigger page swipe
    if (zoomLevel > 1) {
      touchStartRef.current = null;
      return;
    }

    // Double tap detector
    const now = Date.now();
    if (now - lastTapRef.current < 300 && absDiffX < 20 && absDiffY < 20) {
      // Double tap -> Zoom toggle
      if (zoomLevel > 1) {
        handleResetZoom();
      } else {
        setZoomLevel(2);
      }
      lastTapRef.current = 0;
      touchStartRef.current = null;
      return;
    }
    lastTapRef.current = now;

    // Horizontal Swipe detection
    if (absDiffX > settings.swipeSensitivity && absDiffX > absDiffY * 1.5 && duration < 600) {
      const isRtl = settings.direction === 'rtl';
      if (diffX < 0) {
        // Swiped Left
        isRtl ? handlePrev() : handleNext();
      } else {
        // Swiped Right
        isRtl ? handleNext() : handlePrev();
      }
    }

    touchStartRef.current = null;
  };

  // Screen Tap Zones (Left 25%, Center 50%, Right 25%)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDragging || zoomLevel > 1) return;

    const rect = readerContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = clickX / width;

    let leftZone = 0.25;
    let rightZone = 0.75;

    const isRtl = settings.direction === 'rtl';

    if (ratio < leftZone) {
      // Left Zone Tap
      if (settings.invertTapZones) {
        isRtl ? handlePrev() : handleNext();
      } else {
        isRtl ? handleNext() : handlePrev();
      }
    } else if (ratio > rightZone) {
      // Right Zone Tap
      if (settings.invertTapZones) {
        isRtl ? handleNext() : handlePrev();
      } else {
        isRtl ? handlePrev() : handleNext();
      }
    } else {
      // Center Zone Tap: Toggle Controls HUD
      setIsControlsVisible(prev => !prev);
    }
  };

  // Webtoon scroll listener to track current page
  const handleWebtoonScroll = (e: React.UIEvent<HTMLDivElement>) => {
    showControlsTemporarily();
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Find which page is currently in view
    for (let i = 0; i < webtoonPageRefs.current.length; i++) {
      const el = webtoonPageRefs.current[i];
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollTop + containerHeight / 3 >= top && scrollTop + containerHeight / 3 < top + height) {
          if (currentPage !== i) {
            setCurrentPage(i);
            onPageChange(i);
          }
          break;
        }
      }
    }
  };

  // CSS Filters Calculation
  const getFilterStyle = (): React.CSSProperties => {
    let filterString = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
    if (settings.filter === 'sepia') filterString += ' sepia(60%) hue-rotate(-20deg)';
    if (settings.filter === 'dark') filterString += ' invert(92%) hue-rotate(180deg)';
    if (settings.filter === 'grayscale') filterString += ' grayscale(100%)';
    if (settings.filter === 'high-contrast') filterString += ' contrast(140%) brightness(95%)';

    return {
      filter: filterString,
      transition: 'filter 0.2s ease',
    };
  };

  // Image Fit Class
  const getImageFitClass = () => {
    switch (settings.fit) {
      case 'width':
        return 'w-full h-auto max-h-none object-contain';
      case 'height':
        return 'h-full w-auto max-w-none object-contain';
      case 'original':
        return 'max-w-none max-h-none object-none';
      case 'contain':
      default:
        return 'max-h-[96vh] max-w-full object-contain';
    }
  };

  // Bookmarks check
  const isCurrentBookmarked = bookmarks.some(b => b.pageIndex === currentPage);
  const handleToggleBookmark = () => {
    if (isCurrentBookmarked) {
      const match = bookmarks.find(b => b.pageIndex === currentPage);
      if (match) onDeleteBookmark(match.id);
    } else {
      onAddBookmark(currentPage);
    }
  };

  // Double page calculation
  const getDoublePageIndices = (): [number, number | null] => {
    if (settings.firstPageIsCover && currentPage === 0) {
      return [0, null];
    }
    const isOdd = currentPage % 2 !== 0;
    const first = isOdd ? currentPage : Math.max(0, currentPage - 1);
    const second = first + 1 < totalPages ? first + 1 : null;
    return [first, second];
  };

  return (
    <div
      id="comic-reader-viewport"
      ref={readerContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCanvasClick}
      className="relative w-full h-full bg-zinc-950 overflow-hidden flex flex-col select-none touch-none"
    >
      {/* Floating HUD Controls */}
      <ReaderControls
        isVisible={isControlsVisible}
        onBackToLibrary={onBackToLibrary}
        title={comic.title}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleGoToPage}
        onPrevPage={handlePrev}
        onNextPage={handleNext}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onOpenThumbnails={() => setIsThumbnailsOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isBookmarked={isCurrentBookmarked}
        onToggleBookmark={handleToggleBookmark}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      {/* Main Comic Canvas Area */}
      {settings.mode === 'webtoon' ? (
        /* Webtoon Vertical Continuous Scroll */
        <div
          ref={webtoonContainerRef}
          onScroll={handleWebtoonScroll}
          className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-zinc-950 p-0"
          style={{ gap: `${settings.webtoonGap}px` }}
        >
          {pages.map((page, idx) => (
            <div
              key={page.index}
              ref={(el) => (webtoonPageRefs.current[idx] = el)}
              className="w-full max-w-3xl flex items-center justify-center shrink-0"
            >
              <img
                src={page.blobUrl}
                alt={`Página ${idx + 1}`}
                loading={Math.abs(idx - currentPage) < 4 ? 'eager' : 'lazy'}
                style={getFilterStyle()}
                className="w-full h-auto block select-none"
              />
            </div>
          ))}
        </div>
      ) : settings.mode === 'double' ? (
        /* Double Page Spread (Tablets / PC) */
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-4">
          <div
            className="flex items-center justify-center max-w-full max-h-full transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
              cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            {(() => {
              const [page1Idx, page2Idx] = getDoublePageIndices();
              const p1 = pages[page1Idx];
              const p2 = page2Idx !== null ? pages[page2Idx] : null;

              // In Manga RTL, left page is page 2 and right page is page 1
              const leftPage = settings.direction === 'rtl' ? p2 : p1;
              const rightPage = settings.direction === 'rtl' ? p1 : p2;

              return (
                <div className="flex items-center justify-center gap-1 max-w-full max-h-full">
                  {leftPage && (
                    <img
                      src={leftPage.blobUrl}
                      alt={`Página ${leftPage.index + 1}`}
                      style={getFilterStyle()}
                      className={`max-h-[92vh] max-w-[48vw] object-contain shadow-2xl rounded-sm`}
                    />
                  )}
                  {rightPage && (
                    <img
                      src={rightPage.blobUrl}
                      alt={`Página ${rightPage.index + 1}`}
                      style={getFilterStyle()}
                      className={`max-h-[92vh] max-w-[48vw] object-contain shadow-2xl rounded-sm`}
                    />
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Single Page (Default / Mobile / Fit Mode) */
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden p-1 sm:p-3">
          <div
            className="flex items-center justify-center max-w-full max-h-full transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
              cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            {pages[currentPage] && (
              <img
                src={pages[currentPage].blobUrl}
                alt={`Página ${currentPage + 1}`}
                style={getFilterStyle()}
                className={`${getImageFitClass()} shadow-2xl rounded-sm transition-all duration-150`}
              />
            )}
          </div>
        </div>
      )}

      {/* Visual tap zones guide tooltip on bottom edge */}
      <div className={`absolute bottom-1 inset-x-0 flex justify-between px-4 text-[10px] text-zinc-600 pointer-events-none transition-opacity duration-300 ${
        isControlsVisible ? 'opacity-70' : 'opacity-0'
      }`}>
        <span>{settings.direction === 'rtl' ? 'Siguiente (←)' : 'Anterior (←)'}</span>
        <span>Menú de controles (Centro)</span>
        <span>{settings.direction === 'rtl' ? 'Anterior (→)' : 'Siguiente (→)'}</span>
      </div>

      {/* Modals & Drawers */}
      <ThumbnailDrawer
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        pages={pages}
        currentPage={currentPage}
        onSelectPage={handleGoToPage}
        bookmarks={bookmarks}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        currentPage={currentPage}
        onAddBookmark={(note) => onAddBookmark(currentPage, note)}
        onDeleteBookmark={onDeleteBookmark}
        onJumpToPage={handleGoToPage}
        pages={pages}
      />

      <ComicInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        comic={comic}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onClearStorage={onClearStorage}
      />
    </div>
  );
};
