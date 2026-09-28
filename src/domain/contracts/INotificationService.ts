export interface DegradationAlertPayload {
  title: string;
  body: string;
  rttMs?: number;
  packetLossPercent?: number;
  networkType?: string;
  timestamp: number;
}

export interface INotificationService {
  initialize(): Promise<void>;
  requestPermissions(): Promise<boolean>;
  notifyDegradation(payload: DegradationAlertPayload): Promise<void>;
  notifyMeasurementCompleted(score: number, avgRtt: number): Promise<void>;
}
