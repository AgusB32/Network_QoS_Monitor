export interface LatencySample {
  sequence: number;
  timestamp: number;
  rttMs: number;
  success: boolean;
  error?: string;
}

export interface HostQoSResult {
  host: string;
  port: number;
  resolvedIp?: string;
  samplesSent: number;
  samplesReceived: number;
  packetLossPercent: number;
  minRttMs: number;
  avgRttMs: number;
  maxRttMs: number;
  jitterMs: number; // Computed per RFC 3550
  samples: LatencySample[];
}

export interface ThroughputProgress {
  phase: 'idle' | 'download' | 'upload' | 'completed' | 'error';
  currentMbps: number;
  bytesTransferred: number;
  totalBytesTarget: number;
  progressPercent: number; // 0 to 100
}

export interface ThroughputResult {
  downloadMbps: number;
  uploadMbps: number;
  downloadBytesTransferred: number;
  uploadBytesTransferred: number;
  durationMs: number;
  serverUrl: string;
}

export type QoSRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export interface QoSSummary {
  overallScore: number; // 0 - 100
  rating: QoSRating;
  averageLatencyMs: number;
  averageJitterMs: number;
  averagePacketLossPercent: number;
  downloadSpeedMbps?: number;
  uploadSpeedMbps?: number;
  diagnostics: string[];
}
