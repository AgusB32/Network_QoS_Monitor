import { container } from '../../core/container';
import { CONFIG, DEFAULT_PROBE_HOSTS } from '../../core/constants';
import { HostQoSResult, ThroughputProgress, ThroughputResult } from '../../domain/models/qos';
import { MeasurementSession } from '../../domain/models/session';
import { QoSEvaluator } from '../../domain/services/QoSEvaluator';

export interface MeasurementProgressUpdate {
  stage: 'latency' | 'throughput' | 'telemetry' | 'saving' | 'completed';
  message: string;
  percent: number; // 0 - 100
  currentLatencyResults?: HostQoSResult[];
  throughputProgress?: ThroughputProgress;
}

export interface RunMeasurementOptions {
  hosts?: Array<{ host: string; port: number; label?: string }>;
  backendUrl?: string;
  isBackground?: boolean;
  onProgress?: (update: MeasurementProgressUpdate) => void;
}

export class RunMeasurementSessionUseCase {
  public async execute(options?: RunMeasurementOptions): Promise<MeasurementSession> {
    const startTime = Date.now();
    const onProgress = options?.onProgress;
    const isBackground = options?.isBackground ?? false;
    const hostsToProbe = options?.hosts ?? DEFAULT_PROBE_HOSTS;
    const backendUrl = options?.backendUrl ?? CONFIG.DEFAULT_BACKEND_URL;

    // 1. Fase de Latencia y Jitter (TCP Sockets contra hosts configurables)
    onProgress?.({
      stage: 'latency',
      message: `Ejecutando sondas TCP de latencia contra ${hostsToProbe.length} hosts...`,
      percent: 15,
    });

    const latencyResults: HostQoSResult[] = [];
    for (let i = 0; i < hostsToProbe.length; i++) {
      const target = hostsToProbe[i];
      const result = await container.latencyProbe.measureHost(target.host, target.port, {
        count: CONFIG.DEFAULT_PROBE_SAMPLES,
        timeoutMs: CONFIG.DEFAULT_PROBE_TIMEOUT_MS,
        intervalMs: CONFIG.DEFAULT_PROBE_INTERVAL_MS,
      });
      latencyResults.push(result);

      onProgress?.({
        stage: 'latency',
        message: `Sondeado ${target.label || target.host} (${i + 1}/${hostsToProbe.length})`,
        percent: 15 + Math.round(((i + 1) / hostsToProbe.length) * 35),
        currentLatencyResults: [...latencyResults],
      });
    }

    // 2. Fase de Throughput (Descarga y Subida en Mbps)
    let throughput: ThroughputResult | null = null;
    if (!isBackground) {
      onProgress?.({
        stage: 'throughput',
        message: 'Midiendo Throughput (descarga y subida)...',
        percent: 55,
      });

      try {
        throughput = await container.throughputTester.measureThroughput(backendUrl, {
          downloadBytes: CONFIG.DEFAULT_DOWNLOAD_BYTES,
          uploadBytes: CONFIG.DEFAULT_UPLOAD_BYTES,
          onProgress: (tpProgress) => {
            onProgress?.({
              stage: 'throughput',
              message:
                tpProgress.phase === 'download'
                  ? `Descargando carga de prueba (${tpProgress.currentMbps} Mbps)...`
                  : `Subiendo carga de prueba (${tpProgress.currentMbps} Mbps)...`,
              percent: 55 + Math.round(tpProgress.progressPercent * 0.25),
              throughputProgress: tpProgress,
            });
          },
        });
      } catch (err) {
        console.warn('[RunMeasurementSessionUseCase] Throughput test error:', err);
      }
    }

    // 3. Fase de Telemetría Celular, Red y Ubicación GPS
    onProgress?.({
      stage: 'telemetry',
      message: 'Adquiriendo estado de red, celda celular y GPS...',
      percent: 85,
    });

    const [networkState, telephony, location] = await Promise.all([
      container.networkStateProvider.getCurrentState(),
      container.telephonyProvider.getCellInfo(),
      container.locationProvider.getCurrentLocation(),
    ]);

    // 4. Evaluación de Calidad de Servicio (QoS & QoE)
    const qosSummary = QoSEvaluator.evaluate(latencyResults, throughput, telephony);

    // 5. Creación de la Entidad de Sesión
    const session: MeasurementSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      isBackground,
      networkState,
      telephony,
      location,
      latencyResults,
      throughput,
      qosSummary,
    };

    // 6. Persistencia
    onProgress?.({
      stage: 'saving',
      message: 'Guardando sesión en repositorio local...',
      percent: 95,
    });

    await container.measurementRepository.saveSession(session);

    onProgress?.({
      stage: 'completed',
      message: 'Medición completada exitosamente',
      percent: 100,
    });

    return session;
  }
}
