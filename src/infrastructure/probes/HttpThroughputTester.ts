import { IThroughputTester, ThroughputOptions } from '../../domain/contracts/IThroughputTester';
import { ThroughputProgress, ThroughputResult } from '../../domain/models/qos';

export class HttpThroughputTester implements IThroughputTester {
  private activeAbortController: AbortController | null = null;

  // Endpoint público de fallback con CDN global de alta disponibilidad
  private static readonly CLOUDFLARE_BASE_URL = 'https://speed.cloudflare.com';

  public async measureThroughput(
    serverBaseUrl: string,
    options?: ThroughputOptions
  ): Promise<ThroughputResult> {
    const downloadBytes = options?.downloadBytes ?? 5 * 1024 * 1024; // 5 MB
    const uploadBytes = options?.uploadBytes ?? 2 * 1024 * 1024; // 2 MB
    const onProgress = options?.onProgress;

    this.activeAbortController = new AbortController();
    const startTimeOverall = Date.now();

    // 1. Determinar servidor de destino:
    // Intentar primero con el backend de referencia especificado en el PRD.
    // Si no responde en 2 segundos (ej. dispositivo físico fuera de red local o backend apagado),
    // hacer fallback automático a Cloudflare Speedtest Edge para medir ancho de banda 100% real.
    const isReferenceAvailable = await this.checkServerHealth(serverBaseUrl);

    let downloadUrl: string;
    let uploadUrl: string;
    let effectiveServerLabel: string;

    if (isReferenceAvailable) {
      const normalizedUrl = serverBaseUrl.replace(/\/$/, '');
      downloadUrl = `${normalizedUrl}/download?bytes=${downloadBytes}`;
      uploadUrl = `${normalizedUrl}/upload`;
      effectiveServerLabel = `${serverBaseUrl} (Backend Referencia)`;
    } else {
      downloadUrl = `${HttpThroughputTester.CLOUDFLARE_BASE_URL}/__down?bytes=${downloadBytes}`;
      uploadUrl = `${HttpThroughputTester.CLOUDFLARE_BASE_URL}/__up`;
      effectiveServerLabel = 'Cloudflare CDN (Público)';
    }

    // 2. Fase de Descarga
    onProgress?.({
      phase: 'download',
      currentMbps: 0,
      bytesTransferred: 0,
      totalBytesTarget: downloadBytes,
      progressPercent: 10,
    });

    const downloadResult = await this.testDownload(downloadUrl, downloadBytes, onProgress);

    // 3. Fase de Subida
    onProgress?.({
      phase: 'upload',
      currentMbps: downloadResult.mbps,
      bytesTransferred: 0,
      totalBytesTarget: uploadBytes,
      progressPercent: 55,
    });

    const uploadResult = await this.testUpload(uploadUrl, uploadBytes, onProgress);

    const totalDurationMs = Date.now() - startTimeOverall;

    onProgress?.({
      phase: 'completed',
      currentMbps: uploadResult.mbps,
      bytesTransferred: downloadResult.bytes + uploadResult.bytes,
      totalBytesTarget: downloadBytes + uploadBytes,
      progressPercent: 100,
    });

    return {
      downloadMbps: downloadResult.mbps,
      uploadMbps: uploadResult.mbps,
      downloadBytesTransferred: downloadResult.bytes,
      uploadBytesTransferred: uploadResult.bytes,
      durationMs: totalDurationMs,
      serverUrl: effectiveServerLabel,
    };
  }

  public abort(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  /**
   * Verifica de manera rápida si el backend de referencia responde al endpoint /health.
   */
  private async checkServerHealth(serverBaseUrl: string): Promise<boolean> {
    if (!serverBaseUrl) return false;
    try {
      const normalizedUrl = serverBaseUrl.replace(/\/$/, '');
      const healthController = new AbortController();
      const timeoutId = setTimeout(() => healthController.abort(), 2000); // 2 segundos máximo

      const res = await fetch(`${normalizedUrl}/health`, {
        method: 'GET',
        signal: healthController.signal,
      });

      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  private async testDownload(
    url: string,
    targetBytes: number,
    onProgress?: (progress: ThroughputProgress) => void
  ): Promise<{ mbps: number; bytes: number; durationMs: number }> {
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        signal: this.activeAbortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const endTime = performance.now();
      const durationMs = Math.max(1, endTime - startTime);
      const bytes = buffer.byteLength || targetBytes;

      const durationSec = durationMs / 1000.0;
      const mbps = Number(((bytes * 8) / (durationSec * 1_000_000)).toFixed(2));

      onProgress?.({
        phase: 'download',
        currentMbps: mbps,
        bytesTransferred: bytes,
        totalBytesTarget: targetBytes,
        progressPercent: 50,
      });

      return { mbps, bytes, durationMs };
    } catch (err: any) {
      console.warn('[HttpThroughputTester] Test de descarga falló:', err?.message || err);
      // NUNCA devolver números falsos/mockeados. En caso de error de red, retornar 0 Mbps reales.
      return { mbps: 0, bytes: 0, durationMs: 0 };
    }
  }

  private async testUpload(
    url: string,
    payloadSize: number,
    onProgress?: (progress: ThroughputProgress) => void
  ): Promise<{ mbps: number; bytes: number; durationMs: number }> {
    // Generar buffer en memoria
    const dummyData = 'X'.repeat(payloadSize);
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: dummyData,
        cache: 'no-store',
        signal: this.activeAbortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP upload error ${response.status}`);
      }

      const endTime = performance.now();
      const durationMs = Math.max(1, endTime - startTime);
      const durationSec = durationMs / 1000.0;
      const mbps = Number(((payloadSize * 8) / (durationSec * 1_000_000)).toFixed(2));

      onProgress?.({
        phase: 'upload',
        currentMbps: mbps,
        bytesTransferred: payloadSize,
        totalBytesTarget: payloadSize,
        progressPercent: 90,
      });

      return { mbps, bytes: payloadSize, durationMs };
    } catch (err: any) {
      console.warn('[HttpThroughputTester] Test de subida falló:', err?.message || err);
      // NUNCA devolver números falsos/mockeados. En caso de error de red, retornar 0 Mbps reales.
      return { mbps: 0, bytes: 0, durationMs: 0 };
    }
  }
}
