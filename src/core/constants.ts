export const DEFAULT_PROBE_HOSTS = [
  { host: '1.1.1.1', port: 53, label: 'Cloudflare Primary DNS' },
  { host: '8.8.8.8', port: 53, label: 'Google Primary DNS' },
  { host: '9.9.9.9', port: 53, label: 'Quad9 Security DNS' },
];

export const CONFIG = {
  // Sondas de Latencia
  DEFAULT_PROBE_SAMPLES: 5,
  DEFAULT_PROBE_TIMEOUT_MS: 3000,
  DEFAULT_PROBE_INTERVAL_MS: 200,

  // Throughput Backend de Referencia
  DEFAULT_BACKEND_URL: 'http://10.0.2.2:3000', // IP por defecto para Android Emulator apuntando a host local
  DEFAULT_DOWNLOAD_BYTES: 5 * 1024 * 1024, // 5 MB
  DEFAULT_UPLOAD_BYTES: 2 * 1024 * 1024, // 2 MB
  THROUGHPUT_TIMEOUT_MS: 15000,

  // Alertas de Degradación (Límites para disparar notificación)
  DEGRADATION_THRESHOLDS: {
    HIGH_LATENCY_MS: 180,
    HIGH_JITTER_MS: 40,
    HIGH_PACKET_LOSS_PERCENT: 15,
    LOW_SCORE: 35,
  },

  // Muestreo en Segundo Plano
  BACKGROUND_FETCH_MIN_INTERVAL_MINUTES: 15,
};
