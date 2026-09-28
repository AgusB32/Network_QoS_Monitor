import { requireOptionalNativeModule } from 'expo-modules-core';
import { TelephonyCellInfo } from '../../src/domain/models/network';

interface NativeTelephonyModule {
  isSupported(): Promise<boolean>;
  getCellularInfo(): Promise<TelephonyCellInfo>;
}

const TelephonyInfo = requireOptionalNativeModule<NativeTelephonyModule>('TelephonyInfo');

export const NativeTelephony = {
  isSupported: async (): Promise<boolean> => {
    if (!TelephonyInfo) return false;
    try {
      return await TelephonyInfo.isSupported();
    } catch {
      return false;
    }
  },

  getCellularInfo: async (): Promise<TelephonyCellInfo> => {
    if (!TelephonyInfo) {
      return {
        carrierName: null,
        networkType: 'UNKNOWN',
        rssiDbm: null,
      };
    }
    try {
      return await TelephonyInfo.getCellularInfo();
    } catch (err) {
      console.warn('[NativeTelephony] Error fetching cellular info:', err);
      return {
        carrierName: null,
        networkType: 'UNKNOWN',
        rssiDbm: null,
      };
    }
  },
};
