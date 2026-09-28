export type NetworkTechnology = 'WIFI' | '2G' | '3G' | '4G_LTE' | '5G_NR' | 'ETHERNET' | 'UNKNOWN' | 'NONE';

export interface TelephonyCellInfo {
  carrierName: string | null;
  networkType: NetworkTechnology;
  rssiDbm: number | null; // Received Signal Strength Indication in dBm
  rsrpDbm?: number | null; // Reference Signal Received Power (LTE/5G)
  rsrqDb?: number | null; // Reference Signal Received Quality (LTE/5G)
  sinrDb?: number | null; // Signal-to-Interference-plus-Noise Ratio
  cellId?: number | null;
  tac?: number | null; // Tracking Area Code
  mcc?: string | null; // Mobile Country Code
  mnc?: string | null; // Mobile Network Code
  isRoaming?: boolean;
}

export interface NetworkStateSnapshot {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetworkTechnology;
  isWifi: boolean;
  isCellular: boolean;
  details?: {
    ipAddress?: string;
    subnet?: string;
    frequency?: number;
    ssid?: string;
    strength?: number;
  };
}
