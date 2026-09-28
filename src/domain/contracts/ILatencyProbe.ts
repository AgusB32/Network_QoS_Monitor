import { HostQoSResult } from '../models/qos';

export interface ProbeOptions {
  count?: number; // Número de muestras por host (default: 5)
  timeoutMs?: number; // Timeout por muestra (default: 3000ms)
  intervalMs?: number; // Pausa entre muestras (default: 200ms)
  onSampleReceived?: (host: string, sampleIndex: number, rttMs: number | null) => void;
}

export interface ILatencyProbe {
  /**
   * Identificador único de la sonda (ej. 'tcp-socket', 'icmp', 'http-head')
   */
  readonly name: string;

  /**
   * Ejecuta la sonda de latencia contra el host y puerto especificados.
   * Calcula RTT min, max, avg, jitter y pérdida de paquetes.
   */
  measureHost(host: string, port: number, options?: ProbeOptions): Promise<HostQoSResult>;
}
