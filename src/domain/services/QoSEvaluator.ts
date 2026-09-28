import { HostQoSResult, QoSRating, QoSSummary, ThroughputResult } from '../models/qos';
import { TelephonyCellInfo } from '../models/network';

export class QoSEvaluator {
  /**
   * Evalúa los resultados de latencia, pérdida, throughput y señal para producir un score compuesto 0-100 y diagnóstico.
   */
  public static evaluate(
    latencyResults: HostQoSResult[],
    throughput: ThroughputResult | null,
    telephony?: TelephonyCellInfo
  ): QoSSummary {
    const diagnostics: string[] = [];

    if (latencyResults.length === 0) {
      return {
        overallScore: 0,
        rating: 'CRITICAL',
        averageLatencyMs: 0,
        averageJitterMs: 0,
        averagePacketLossPercent: 100,
        diagnostics: ['Sin mediciones de latencia disponibles.'],
      };
    }

    // Promedios entre todos los hosts sondeados
    const totalAvgLatency =
      latencyResults.reduce((acc, h) => acc + h.avgRttMs, 0) / latencyResults.length;
    const totalAvgJitter =
      latencyResults.reduce((acc, h) => acc + h.jitterMs, 0) / latencyResults.length;
    const totalLoss =
      latencyResults.reduce((acc, h) => acc + h.packetLossPercent, 0) / latencyResults.length;

    // Sub-puntuaciones (0 - 100 cada una)
    // 1. Latencia: <30ms = 100, 100ms = 70, 200ms = 40, >500ms = 0
    let latencyScore = Math.max(0, Math.min(100, 100 - (totalAvgLatency - 25) * 0.25));

    // 2. Jitter: <10ms = 100, 30ms = 70, 60ms = 40, >100ms = 0
    let jitterScore = Math.max(0, Math.min(100, 100 - (totalAvgJitter - 5) * 1.5));

    // 3. Pérdida: 0% = 100, 5% = 50, >15% = 0
    let lossScore = Math.max(0, Math.min(100, 100 - totalLoss * 7));

    // 4. Señal Celular (si está disponible): > -75 dBm = 100, -115 dBm = 10
    let signalScore = 80; // default neutral
    if (telephony?.rssiDbm !== null && telephony?.rssiDbm !== undefined) {
      const rssi = telephony.rssiDbm;
      signalScore = Math.max(0, Math.min(100, ((rssi + 120) / 50) * 100));
    }

    // Ponderación
    let overallScore = Math.round(
      latencyScore * 0.4 + jitterScore * 0.25 + lossScore * 0.25 + signalScore * 0.1
    );
    overallScore = Math.max(0, Math.min(100, overallScore));

    // Diagnósticos
    if (totalLoss > 10) {
      diagnostics.push(`Alta pérdida de paquetes (${totalLoss.toFixed(1)}%). Posible congestión o mala cobertura.`);
    } else if (totalLoss > 0) {
      diagnostics.push(`Pérdida leve de paquetes detectada (${totalLoss.toFixed(1)}%).`);
    }

    if (totalAvgLatency > 150) {
      diagnostics.push(`Latencia elevada (${totalAvgLatency.toFixed(0)} ms). Puede afectar aplicaciones interactivas en tiempo real.`);
    } else if (totalAvgLatency < 40) {
      diagnostics.push(`Excelente tiempo de respuesta de red (${totalAvgLatency.toFixed(0)} ms).`);
    }

    if (totalAvgJitter > 30) {
      diagnostics.push(`Jitter inestable (${totalAvgJitter.toFixed(1)} ms). Experiencia degradada en VoIP o videollamadas.`);
    }

    if (throughput) {
      if (throughput.downloadMbps >= 25) {
        diagnostics.push(`Throughput de bajada sobresaliente (${throughput.downloadMbps.toFixed(1)} Mbps).`);
      } else if (throughput.downloadMbps < 3) {
        diagnostics.push(`Throughput bajo (${throughput.downloadMbps.toFixed(1)} Mbps). Podría experimentar buffering en streaming.`);
      }
    }

    // Rating
    let rating: QoSRating = 'EXCELLENT';
    if (overallScore < 30 || totalLoss > 20) {
      rating = 'CRITICAL';
    } else if (overallScore < 50 || totalLoss > 8) {
      rating = 'POOR';
    } else if (overallScore < 70) {
      rating = 'FAIR';
    } else if (overallScore < 85) {
      rating = 'GOOD';
    }

    return {
      overallScore,
      rating,
      averageLatencyMs: Number(totalAvgLatency.toFixed(1)),
      averageJitterMs: Number(totalAvgJitter.toFixed(1)),
      averagePacketLossPercent: Number(totalLoss.toFixed(1)),
      downloadSpeedMbps: throughput?.downloadMbps,
      uploadSpeedMbps: throughput?.uploadMbps,
      diagnostics,
    };
  }
}
