import * as Location from 'expo-location';
import { ILocationProvider } from '../../domain/contracts/ILocationProvider';
import { GeoPoint } from '../../domain/models/session';

export class ExpoLocationAdapter implements ILocationProvider {
  public async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch {
      return false;
    }
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch {
      return false;
    }
  }

  public async getCurrentLocation(): Promise<GeoPoint | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return null;
      }

      const isEnabled = await this.isLocationEnabled();
      if (!isEnabled) {
        return null;
      }

      // Obtener posición con precisión balanceada para rapidez y bajo consumo de batería
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? 0,
        altitude: loc.coords.altitude,
        speed: loc.coords.speed,
        heading: loc.coords.heading,
        timestamp: loc.timestamp,
      };
    } catch (err) {
      console.warn('[ExpoLocationAdapter] Error fetching location:', err);
      return null;
    }
  }
}
