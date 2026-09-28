import { TelephonyCellInfo } from '../models/network';

export interface ITelephonyProvider {
  /**
   * Indica si la plataforma soporta acceso a telemetría celular nativa.
   */
  isSupported(): boolean;

  /**
   * Solicita permisos necesarios para leer telefonía (ej. READ_PHONE_STATE, ACCESS_FINE_LOCATION).
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Obtiene la información actual de la celda, operador, tipo de red y nivel de señal (RSSI/RSRP en dBm).
   */
  getCellInfo(): Promise<TelephonyCellInfo>;

  /**
   * Suscribe a cambios en la calidad de señal celular.
   */
  subscribeToSignalStrength?(callback: (info: TelephonyCellInfo) => void): () => void;
}
