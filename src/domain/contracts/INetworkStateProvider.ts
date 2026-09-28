import { NetworkStateSnapshot } from '../models/network';

export interface INetworkStateProvider {
  /**
   * Obtiene una captura instantánea del estado de la red (WiFi, Celular, Sin conexión, etc.).
   */
  getCurrentState(): Promise<NetworkStateSnapshot>;

  /**
   * Suscribe a cambios continuos en la conectividad del dispositivo.
   */
  subscribe(listener: (state: NetworkStateSnapshot) => void): () => void;
}
