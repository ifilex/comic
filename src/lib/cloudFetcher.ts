import { CloudDownloadProgress } from '../types';

export interface CloudFetchResult {
  blob: Blob;
  filename: string;
  fileSize: number;
}

export async function fetchComicFromCloud(
  url: string,
  onProgress?: (progress: CloudDownloadProgress) => void
): Promise<CloudFetchResult> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new Error('Por favor ingresa una URL válida');
  }

  onProgress?.({
    status: 'downloading',
    progress: 5,
    bytesReceived: 0,
    totalBytes: 0,
    message: 'Conectando con el servidor en la nube...',
  });

  try {
    // Attempt via backend proxy first to avoid CORS issues with cloud services
    const response = await fetch('/api/fetch-cloud', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: trimmedUrl }),
    });

    if (!response.ok) {
      let errorMsg = 'Error al descargar desde la nube';
      try {
        const errorData = await response.json();
        if (errorData?.error) errorMsg = errorData.error;
      } catch {
        errorMsg = `Error HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    const headerFilename = response.headers.get('X-Filename');
    let filename = headerFilename ? decodeURIComponent(headerFilename) : 'comic.cbz';

    // If filename doesn't have extension, guess from URL
    if (!filename.includes('.')) {
      try {
        const urlObj = new URL(trimmedUrl);
        const pathParts = urlObj.pathname.split('/');
        const last = pathParts[pathParts.length - 1];
        if (last && (last.endsWith('.cbz') || last.endsWith('.cbr') || last.endsWith('.zip') || last.endsWith('.rar'))) {
          filename = decodeURIComponent(last);
        } else {
          filename += '.cbz';
        }
      } catch {
        filename += '.cbz';
      }
    }

    // Stream reader for download progress
    const reader = response.body?.getReader();
    if (!reader) {
      const blob = await response.blob();
      return { blob, filename, fileSize: blob.size };
    }

    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedBytes += value.length;

        const percent = totalBytes > 0 
          ? Math.min(95, Math.round((receivedBytes / totalBytes) * 90)) 
          : Math.min(90, Math.round(receivedBytes / (1024 * 1024)));

        onProgress?.({
          status: 'downloading',
          progress: percent,
          bytesReceived: receivedBytes,
          totalBytes,
          message: totalBytes > 0 
            ? `Descargando: ${(receivedBytes / (1024 * 1024)).toFixed(1)} MB de ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
            : `Descargando: ${(receivedBytes / (1024 * 1024)).toFixed(1)} MB recibidos...`,
        });
      }
    }

    const blob = new Blob(chunks, { type: 'application/octet-stream' });

    onProgress?.({
      status: 'extracting',
      progress: 95,
      bytesReceived: receivedBytes,
      totalBytes: receivedBytes,
      message: 'Archivo descargado. Procesando páginas del cómic...',
    });

    return {
      blob,
      filename,
      fileSize: blob.size,
    };
  } catch (err: any) {
    onProgress?.({
      status: 'error',
      progress: 0,
      bytesReceived: 0,
      totalBytes: 0,
      message: 'Falló la descarga',
      error: err.message || 'Error desconocido al descargar',
    });
    throw err;
  }
}
