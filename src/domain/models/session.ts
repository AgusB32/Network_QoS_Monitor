import { NetworkTechnology, TelephonyCellInfo, NetworkStateSnapshot } from './network';
import { HostQoSResult, ThroughputResult, QoSSummary } from './qos';

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

export interface MeasurementSession {
  id: string;
  timestamp: number; // UTC millisecond epoch
  durationMs: number;
  isBackground: boolean;
  networkState: NetworkStateSnapshot;
  telephony: TelephonyCellInfo;
  location: GeoPoint | null;
  latencyResults: HostQoSResult[];
  throughput: ThroughputResult | null;
  qosSummary: QoSSummary;
}

export interface SessionFilter {
  startDate?: number;
  endDate?: number;
  networkType?: NetworkTechnology;
  carrierName?: string;
  minQoSScore?: number;
  maxQoSScore?: number;
  geoBoundingBox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number; // 0.0 - 1.0 (calidad de señal o score QoS normalizado)
  carrier?: string;
  networkType?: NetworkTechnology;
}
