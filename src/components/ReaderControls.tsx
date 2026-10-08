import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Info, 
  Settings, 
  Maximize, 
  Minimize, 
  LayoutList, 
  Columns2, 
  Rows3, 
  Eye, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Sliders
} from 'lucide-react';
import { ReaderSettings, ReadingMode, ReadingDirection, PageFit, ColorFilter } from '../types';

interface ReaderControlsProps {
  isVisible: boolean;
  onBackToLibrary: () => void;
  title: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: ReaderSettings) => void;
  onOpenThumbnails: () => void;
  onOpenBookmarks: () => void;
  onOpenInfo: () => void;
  onOpenSettings: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  isVisible,
  onBackToLibrary,
  title,
  currentPage,
  totalPages,
  onPageChange,
  onPrevPage,
  onNextPage,
  settings,
  onUpdateSettings,
  onOpenThumbnails,
  onOpenBookmarks,
  onOpenInfo,
  onOpenSettings,
  isBookmarked,
  onToggleBookmark,
  isFullscreen,
  onToggleFullscreen,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleModeChange = (mode: ReadingMode) => {
    onUpdateSettings({ ...settings, mode });
  };

  const handleDirectionToggle = () => {
    onUpdateSettings({
      ...settings,
      direction: settings.direction === 'ltr' ? 'rtl' : 'ltr',
    });
  };

  const handleFitChange = (fit: PageFit) => {
    onUpdateSettings({ ...settings, fit });
  };

  const handleFilterChange = (filter: ColorFilter) => {
    onUpdateSettings({ ...settings, filter });
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Bar */}
      <div className={`absolute top-0 inset-x-0 bg-gradient-to-b from-zinc-950/95 via-zinc-950/80 to-transparent pt-safe pb-6 px-3 sm:px-5 flex items-center justify-between pointer-events-auto transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            id="reader-btn-back"
            onClick={onBackToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 text-xs sm:text-sm font-medium shadow-md transition-all active:scale-95"
            title="Volver a la biblioteca"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>

          <h2 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md pl-2 border-l border-zinc-800" title={title}>
            {title}
          </h2>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom controls on desktop/tablets */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={onZoomOut}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              title="Reducir zoom (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-zinc-300 px-1 min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              title="Aumentar zoom (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={onResetZoom}
                className="p-1.5 text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-zinc-800"
                title="Restablecer zoom (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Página guardada' : 'Guardar marcador'}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-zinc-900/90 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onOpenBookmarks}
            title="Ver todos los marcadores"
            className="p-2 rounded-xl bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenInfo}
            title="Información del cómic"
            className="p-2 rounded-xl bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Ajustes de lectura"
            className="p-2 rounded-xl bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
            className="p-2 rounded-xl bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95 hidden xs:flex"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/85 to-transparent pb-safe pt-6 px-3 sm:px-6 pointer-events-auto transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5 pb-2">
          {/* Slider & Page Indicator */}
          <div className="flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md p-2.5 rounded-2xl border border-zinc-800/90 shadow-xl">
            <button
              onClick={settings.direction === 'rtl' ? onNextPage : onPrevPage}
              disabled={currentPage <= 0}
              className="p-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Página anterior (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Slider */}
            <div className="flex-1 flex items-center gap-2">
              <input
                id="reader-page-slider"
                type="range"
                min="0"
                max={Math.max(0, totalPages - 1)}
                value={currentPage}
                onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="min-w-16 text-center">
              <span className="text-xs font-bold text-white">
                {currentPage + 1}
              </span>
              <span className="text-[11px] text-zinc-400"> / {totalPages}</span>
            </div>

            <button
              onClick={settings.direction === 'rtl' ? onPrevPage : onNextPage}
              disabled={currentPage >= totalPages - 1}
              className="p-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Página siguiente (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Mode & Filter Selectors */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-zinc-900/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-800/90 shadow-xl text-xs">
            {/* View Mode (Single, Double, Webtoon) */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
              <button
                onClick={() => handleModeChange('single')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  settings.mode === 'single' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Página individual"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Individual</span>
              </button>

              <button
                onClick={() => handleModeChange('double')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  settings.mode === 'double' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Doble página (D)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Doble</span>
              </button>

              <button
                onClick={() => handleModeChange('webtoon')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  settings.mode === 'webtoon' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Webtoon / Desplazamiento vertical (V)"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Webtoon</span>
              </button>
            </div>

            {/* Reading Direction (Manga RTL vs LTR) */}
            <button
              onClick={handleDirectionToggle}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all ${
                settings.direction === 'rtl'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-850 hover:bg-zinc-800'
              }`}
              title="Alternar sentido de lectura (M)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{settings.direction === 'rtl' ? 'Manga (RTL)' : 'Occidental (LTR)'}</span>
            </button>

            {/* Fit option */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
              <button
                onClick={() => handleFitChange('contain')}
                className={`px-2 py-1 rounded-lg ${settings.fit === 'contain' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}
              >
                Pantalla
              </button>
              <button
                onClick={() => handleFitChange('width')}
                className={`px-2 py-1 rounded-lg ${settings.fit === 'width' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}
              >
                Ancho
              </button>
              <button
                onClick={() => handleFitChange('height')}
                className={`px-2 py-1 rounded-lg ${settings.fit === 'height' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'}`}
              >
                Alto
              </button>
            </div>

            {/* Thumbnails Drawer Toggle */}
            <button
              onClick={onOpenThumbnails}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 text-zinc-200 border border-zinc-850 hover:bg-zinc-800 transition-all"
              title="Ver miniaturas de páginas"
            >
              <LayoutList className="w-3.5 h-3.5 text-indigo-400" />
              <span>Páginas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
