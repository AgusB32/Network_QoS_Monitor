import { create } from 'zustand';
import { NetworkStateSnapshot, TelephonyCellInfo } from '../../domain/models/network';
import { GeoPoint } from '../../domain/models/session';
import { container } from '../../core/container';
import { PermissionsManager, PermissionStatusSummary } from '../../infrastructure/permissions/PermissionsManager';

interface NetworkStoreState {
  // Estado de red
  networkState: NetworkStateSnapshot;
  telephony: TelephonyCellInfo;
  currentLocation: GeoPoint | null;
  permissions: PermissionStatusSummary;
  isInitializing: boolean;

  // Acciones
  initialize: () => Promise<void>;
  refreshNetworkState: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  requestPermissions: () => Promise<void>;
}

const initialNetworkState: NetworkStateSnapshot = {
  isConnected: false,
  isInternetReachable: null,
  type: 'UNKNOWN',
  isWifi: false,
  isCellular: false,
};

const initialTelephony: TelephonyCellInfo = {
  carrierName: null,
  networkType: 'UNKNOWN',
  rssiDbm: null,
};

export const useNetworkStore = create<NetworkStoreState>((set, get) => ({
  networkState: initialNetworkState,
  telephony: initialTelephony,
  currentLocation: null,
  permissions: {
    location: false,
    phoneState: false,
    notifications: false,
  },
  isInitializing: true,

  initialize: async () => {
    // 1. Cargar estado de permisos inicial
    const perms = await PermissionsManager.checkAll();

    // 2. Cargar estado de red inicial
    const netState = await container.networkStateProvider.getCurrentState();

    // 3. Cargar datos de telefonía
    const telephony = await container.telephonyProvider.getCellInfo();

    // 4. Suscribirse a cambios continuos de conectividad
    container.networkStateProvider.subscribe((updatedNetState) => {
      set({ networkState: updatedNetState });
    });

    set({
      networkState: netState,
      telephony,
      permissions: perms,
      isInitializing: false,
    });

    // 5. Cargar localización si el permiso está disponible
    if (perms.location) {
      get().refreshLocation();
    }
  },

  refreshNetworkState: async () => {
    const netState = await container.networkStateProvider.getCurrentState();
    const telephony = await container.telephonyProvider.getCellInfo();
    set({ networkState: netState, telephony });
  },

  refreshLocation: async () => {
    const loc = await container.locationProvider.getCurrentLocation();
    if (loc) {
      set({ currentLocation: loc });
    }
  },

  requestPermissions: async () => {
    await PermissionsManager.requestLocation();
    await PermissionsManager.requestPhoneState();
    const updatedPerms = await PermissionsManager.checkAll();
    set({ permissions: updatedPerms });

    if (updatedPerms.location) {
      await get().refreshLocation();
    }
    await get().refreshNetworkState();
  },
}));
