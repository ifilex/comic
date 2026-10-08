import React from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Sliders, 
  Eye, 
  Touchpad, 
  Keyboard, 
  HardDrive, 
  RotateCcw, 
  Trash2 
} from 'lucide-react';
import { ReaderSettings, ReadingMode, ReadingDirection, PageFit, ColorFilter } from '../types';
import { defaultSettings } from '../lib/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: ReaderSettings) => void;
  onClearStorage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearStorage,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    onUpdateSettings(defaultSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-reader-settings"
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Preferencias de Lectura</h3>
              <p className="text-xs text-zinc-400">Personaliza la experiencia según tu dispositivo</p>
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
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Section: Reading Mode & Layout */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modo y Orientación</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1.5">Modo de visualización</label>
                <select
                  value={settings.mode}
                  onChange={(e) => handleChange('mode', e.target.value as ReadingMode)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="single">Página Individual</option>
                  <option value="double">Doble Página (Tablets/PC)</option>
                  <option value="webtoon">Webtoon (Scroll vertical)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1.5">Sentido de lectura</label>
                <select
                  value={settings.direction}
                  onChange={(e) => handleChange('direction', e.target.value as ReadingDirection)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ltr">Occidental (Izquierda a Derecha)</option>
                  <option value="rtl">Manga / Oriental (Derecha a Izquierda)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs text-zinc-300 mb-1.5">Ajuste de página</label>
                <select
                  value={settings.fit}
                  onChange={(e) => handleChange('fit', e.target.value as PageFit)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="contain">Ajustar a Pantalla (Recomendado)</option>
                  <option value="width">Ajustar al Ancho</option>
                  <option value="height">Ajustar al Alto</option>
                  <option value="original">Tamaño Original (100%)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 self-end">
                <span className="text-xs text-zinc-300">Portada individual en doble página</span>
                <input
                  type="checkbox"
                  checked={settings.firstPageIsCover}
                  onChange={(e) => handleChange('firstPageIsCover', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 cursor-pointer"
                >
                </input>
              </div>
            </div>
          </div>

          {/* Section: Visual Adjustments & Filters */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filtros y Brillo</span>
            </h4>

            <div>
              <label className="block text-xs text-zinc-300 mb-1.5">Filtro de color</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'none', label: 'Normal' },
                  { id: 'sepia', label: 'Sepia' },
                  { id: 'dark', label: 'Noche' },
                  { id: 'grayscale', label: 'Gris' },
                  { id: 'high-contrast', label: 'Contraste' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleChange('filter', f.id as ColorFilter)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      settings.filter === f.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Brillo</span>
                  <span className="text-zinc-400">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.brightness}
                  onChange={(e) => handleChange('brightness', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Contraste</span>
                  <span className="text-zinc-400">{settings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.contrast}
                  onChange={(e) => handleChange('contrast', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section: Touch & UI Controls */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Touchpad className="w-3.5 h-3.5 text-sky-400" />
              <span>Controles Táctiles y Ocultación</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-300">Ocultar controles automáticamente</span>
                <input
                  type="checkbox"
                  checked={settings.autoHideControls}
                  onChange={(e) => handleChange('autoHideControls', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-300">Invertir zonas de toque</span>
                <input
                  type="checkbox"
                  checked={settings.invertTapZones}
                  onChange={(e) => handleChange('invertTapZones', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Storage & Reset */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-850 text-xs">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer ajustes</span>
            </button>

            <button
              onClick={onClearStorage}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar caché y biblioteca</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
