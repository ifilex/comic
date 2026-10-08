import React from 'react';
import { BookOpen, FolderOpen, Cloud, Library, Settings, Maximize, Minimize } from 'lucide-react';

interface NavbarProps {
  onOpenLocal: () => void;
  onOpenCloud: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  activeView: 'library' | 'reader';
  currentComicTitle?: string;
  hasComicsInLibrary: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLocal,
  onOpenCloud,
  onOpenLibrary,
  onOpenSettings,
  onToggleFullscreen,
  isFullscreen,
  activeView,
  currentComicTitle,
  hasComicsInLibrary,
}) => {
  return (
    <header
      id="app-header"
      className="h-14 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none text-zinc-100"
    >
      {/* Brand / Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          id="btn-nav-home"
          onClick={onOpenLibrary}
          className="flex items-center gap-2 text-zinc-100 hover:text-white font-semibold tracking-tight transition-colors focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline font-bold text-sm md:text-base tracking-wide bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Lector CBR & CBZ
          </span>
        </button>

        {activeView === 'reader' && currentComicTitle && (
          <div className="flex items-center gap-2 min-w-0 pl-2 border-l border-zinc-800">
            <span className="text-xs sm:text-sm text-zinc-300 font-medium truncate max-w-[140px] sm:max-w-[260px] md:max-w-[400px]">
              {currentComicTitle}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          id="btn-nav-open-local"
          onClick={onOpenLocal}
          title="Abrir archivo local (CBR, CBZ, ZIP, RAR)"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/60 transition-all shadow-sm active:scale-95"
        >
          <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <span className="hidden xs:inline sm:inline">Abrir</span>
        </button>

        <button
          id="btn-nav-open-cloud"
          onClick={onOpenCloud}
          title="Abrir cómic desde la nube o URL"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/60 transition-all shadow-sm active:scale-95"
        >
          <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
          <span className="hidden xs:inline sm:inline">Nube</span>
        </button>

        {hasComicsInLibrary && (
          <button
            id="btn-nav-library"
            onClick={onOpenLibrary}
            title="Ver biblioteca de cómics guardados"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 border ${
              activeView === 'library'
                ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/40'
                : 'bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 border-zinc-700/60'
            }`}
          >
            <Library className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>
        )}

        <button
          id="btn-nav-settings"
          onClick={onOpenSettings}
          title="Ajustes y atajos"
          className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          id="btn-nav-fullscreen"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors active:scale-95 hidden xs:flex"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
