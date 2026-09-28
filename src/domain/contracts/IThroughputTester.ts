import { ThroughputProgress, ThroughputResult } from '../models/qos';

export interface ThroughputOptions {
  downloadBytes?: number; // Tamaño de payload de descarga (default: 5MB)
  uploadBytes?: number; // Tamaño de payload de subida (default: 2MB)
  timeoutMs?: number; // Timeout general (default: 15000ms)
  onProgress?: (progress: ThroughputProgress) => void;
}

export interface IThroughputTester {
  /**
   * Ejecuta el test de descarga y subida contra un servidor de referencia y calcula throughput en Mbps.
   */
  measureThroughput(serverBaseUrl: string, options?: ThroughputOptions): Promise<ThroughputResult>;

  /**
   * Cancela la prueba en ejecución si está activa.
   */
  abort(): void;
}
