import { LatencySample } from '../models/qos';

/**
 * Calculador de Jitter y métricas de latencia de acuerdo con RFC 3550 (RTP: A Transport Protocol for Real-Time Applications).
 *
 * Fórmula RFC 3550:
 * D(i, j) = |RTT_j - RTT_i|
 * J_i = J_{i-1} + (|D(i-1, i)| - J_{i-1}) / 16
 */
export class JitterCalculator {
  /**
   * Calcula el jitter estadístico inter-paquete a partir de una serie de muestras de RTT válidas.
   */
  public static computeRfc3550Jitter(samples: LatencySample[]): number {
    const validRtts = samples
      .filter((s) => s.success && s.rttMs >= 0)
      .map((s) => s.rttMs);

    if (validRtts.length < 2) {
      return 0;
    }

    let jitter = 0;
    for (let i = 1; i < validRtts.length; i++) {
      const diff = Math.abs(validRtts[i] - validRtts[i - 1]);
      jitter = jitter + (diff - jitter) / 16.0;
    }

    return Number(jitter.toFixed(2));
  }

  /**
   * Calcula resumen estadístico de RTT: mínimo, promedio, máximo y porcentaje de pérdida.
   */
  public static computeSummary(samples: LatencySample[]): {
    minRtt: number;
    avgRtt: number;
    maxRtt: number;
    lossPercent: number;
    jitter: number;
  } {
    if (samples.length === 0) {
      return { minRtt: 0, avgRtt: 0, maxRtt: 0, lossPercent: 100, jitter: 0 };
    }

    const successfulSamples = samples.filter((s) => s.success && s.rttMs >= 0);
    const sent = samples.length;
    const received = successfulSamples.length;
    const lossPercent = Number((((sent - received) / sent) * 100).toFixed(1));

    if (successfulSamples.length === 0) {
      return { minRtt: 0, avgRtt: 0, maxRtt: 0, lossPercent: 100, jitter: 0 };
    }

    const rtts = successfulSamples.map((s) => s.rttMs);
    const minRtt = Number(Math.min(...rtts).toFixed(2));
    const maxRtt = Number(Math.max(...rtts).toFixed(2));
    const sum = rtts.reduce((acc, curr) => acc + curr, 0);
    const avgRtt = Number((sum / rtts.length).toFixed(2));
    const jitter = this.computeRfc3550Jitter(samples);

    return { minRtt, avgRtt, maxRtt, lossPercent, jitter };
  }
}
