import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Download, 
  Loader2, 
  AlertCircle, 
  Link, 
  FileText, 
  CheckCircle2,
  HardDrive,
  Globe
} from 'lucide-react';
import { CloudDownloadProgress } from '../types';

interface CloudImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportUrl: (url: string) => Promise<void>;
  downloadProgress: CloudDownloadProgress | null;
}

export const CloudImportModal: React.FC<CloudImportModalProps> = ({
  isOpen,
  onClose,
  onImportUrl,
  downloadProgress,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'url' | 'presets'>('url');

  if (!isOpen) return null;

  const isDownloading = downloadProgress && (downloadProgress.status === 'downloading' || downloadProgress.status === 'extracting');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Por favor introduce un enlace válido');
      return;
    }
    setError(null);
    try {
      await onImportUrl(cleanUrl);
    } catch (err: any) {
      setError(err.message || 'Error al descargar el cómic desde la nube');
    }
  };

  const setPresetUrl = (presetUrl: string) => {
    setUrl(presetUrl);
    setSelectedTab('url');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-cloud-import"
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Abrir desde la nube</h3>
              <p className="text-xs text-zinc-400">Descarga y lee archivos CBR o CBZ remotos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-950 border border-zinc-850 mb-4">
            <button
              onClick={() => setSelectedTab('url')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                selectedTab === 'url'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Enlace / URL
            </button>
            <button
              onClick={() => setSelectedTab('presets')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                selectedTab === 'presets'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Servicios compatibles
            </button>
          </div>

          {selectedTab === 'url' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  URL del archivo o enlace público
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Link className="w-4 h-4" />
                  </div>
                  <input
                    id="input-cloud-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isDownloading}
                    placeholder="https://ejemplo.com/comic.cbr o enlace de Google Drive / Dropbox"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/70 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Soporta enlaces directos (.cbr, .cbz, .zip, .rar), Google Drive, Dropbox, OneDrive y WebDAV.
                </p>
              </div>

              {/* Download Progress Display */}
              {downloadProgress && downloadProgress.status !== 'idle' && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      ) : downloadProgress.status === 'error' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="font-medium text-zinc-200">{downloadProgress.message}</span>
                    </div>
                    <span className="text-sky-400 font-bold">{downloadProgress.progress}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        downloadProgress.status === 'error' ? 'bg-red-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${downloadProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDownloading}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-cloud-download"
                  disabled={isDownloading || !url.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-950/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Descargando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar y Leer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Presets & Guide */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Google Drive</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Haz clic derecho en el archivo en Drive &gt; <em>Compartir</em> &gt; Cambia el acceso a <em>"Cualquier persona con el enlace"</em> y pega aquí el enlace generado.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dropbox</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Crea un enlace para compartir en Dropbox y pégalo directamente. La aplicación lo convertirá automáticamente para descarga directa.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enlace directo HTTP / HTTPS</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Cualquier servidor web, CDN, repositorio o almacenamiento propio que aloje archivos .cbr, .cbz, .zip o .rar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
