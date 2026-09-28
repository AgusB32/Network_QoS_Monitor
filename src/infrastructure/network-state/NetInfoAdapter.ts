import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { INetworkStateProvider } from '../../domain/contracts/INetworkStateProvider';
import { NetworkStateSnapshot, NetworkTechnology } from '../../domain/models/network';

export class NetInfoAdapter implements INetworkStateProvider {
  public async getCurrentState(): Promise<NetworkStateSnapshot> {
    const state = await NetInfo.fetch();
    return this.mapToSnapshot(state);
  }

  public subscribe(listener: (snapshot: NetworkStateSnapshot) => void): () => void {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      listener(this.mapToSnapshot(state));
    });
    return unsubscribe;
  }

  private mapToSnapshot(state: NetInfoState): NetworkStateSnapshot {
    const isWifi = state.type === NetInfoStateType.wifi;
    const isCellular = state.type === NetInfoStateType.cellular;

    let technology: NetworkTechnology = 'UNKNOWN';
    if (!state.isConnected || state.type === NetInfoStateType.none) {
      technology = 'NONE';
    } else if (isWifi) {
      technology = 'WIFI';
    } else if (state.type === NetInfoStateType.ethernet) {
      technology = 'ETHERNET';
    } else if (isCellular && state.details) {
      const details = state.details as { cellularGeneration?: string };
      if (details.cellularGeneration === '5g') {
        technology = '5G_NR';
      } else if (details.cellularGeneration === '4g') {
        technology = '4G_LTE';
      } else if (details.cellularGeneration === '3g') {
        technology = '3G';
      } else if (details.cellularGeneration === '2g') {
        technology = '2G';
      } else {
        technology = '4G_LTE'; // Celular genérico moderno por defecto
      }
    }

    return {
      isConnected: Boolean(state.isConnected),
      isInternetReachable: state.isInternetReachable,
      type: technology,
      isWifi,
      isCellular,
      details: state.details
        ? {
            ipAddress: (state.details as any).ipAddress,
            subnet: (state.details as any).subnet,
            frequency: (state.details as any).frequency,
            ssid: (state.details as any).ssid,
            strength: (state.details as any).strength,
          }
        : undefined,
    };
  }
}
