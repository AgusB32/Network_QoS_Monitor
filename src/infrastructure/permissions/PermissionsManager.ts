import { Platform, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';

export interface PermissionStatusSummary {
  location: boolean;
  phoneState: boolean;
  notifications: boolean;
}

export class PermissionsManager {
  /**
   * Consulta el estado de todos los permisos requeridos por la aplicación.
   */
  public static async checkAll(): Promise<PermissionStatusSummary> {
    const locationStatus = await this.checkLocation();
    const phoneStatus = await this.checkPhoneState();
    const notifStatus = true; // Por defecto

    return {
      location: locationStatus,
      phoneState: phoneStatus,
      notifications: notifStatus,
    };
  }

  /**
   * Verifica permiso de localización.
   */
  public static async checkLocation(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch {
      return false;
    }
  }

  /**
   * Solicita permiso de localización.
   */
  public static async requestLocation(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch {
      return false;
    }
  }

  /**
   * Verifica permiso de lectura de estado telefónico (en Android).
   */
  public static async checkPhoneState(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // En iOS se accede vía CoreTelephony sin este permiso específico
    }

    try {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      );
    } catch {
      return false;
    }
  }

  /**
   * Solicita permiso de lectura telefónica en Android con diálogo informativo.
   */
  public static async requestPhoneState(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Permiso de Estado de Red Celular',
          message:
            'Network QoS Monitor necesita acceder a los datos de la red celular para identificar el operador y medir los niveles de señal (RSSI/RSRP).',
          buttonNeutral: 'Preguntar luego',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[PermissionsManager] Error requesting READ_PHONE_STATE:', err);
      return false;
    }
  }
}
