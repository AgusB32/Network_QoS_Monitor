import { ITelephonyProvider } from '../../domain/contracts/ITelephonyProvider';
import { TelephonyCellInfo } from '../../domain/models/network';

export class FallbackTelephonyProvider implements ITelephonyProvider {
  public isSupported(): boolean {
    return false; // Módulo fallback
  }

  public async requestPermissions(): Promise<boolean> {
    return true;
  }

  public async getCellInfo(): Promise<TelephonyCellInfo> {
    // Retorna información base cuando el hardware o el módulo nativo aún no está enlazado
    return {
      carrierName: 'Red Celular / Wi-Fi',
      networkType: 'UNKNOWN',
      rssiDbm: null,
      rsrpDbm: null,
      rsrqDb: null,
      cellId: null,
      mcc: null,
      mnc: null,
    };
  }
}
