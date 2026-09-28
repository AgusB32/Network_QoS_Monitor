import { GeoPoint } from '../models/session';

export interface ILocationProvider {
  /**
   * Solicita permisos de ubicación (primer plano / segundo plano).
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Obtiene las coordenadas GPS actuales con alta precisión.
   */
  getCurrentLocation(): Promise<GeoPoint | null>;

  /**
   * Indica si los servicios de localización están habilitados en el dispositivo.
   */
  isLocationEnabled(): Promise<boolean>;
}
