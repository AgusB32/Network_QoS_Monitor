import { INetworkStateProvider } from '../domain/contracts/INetworkStateProvider';
import { ILocationProvider } from '../domain/contracts/ILocationProvider';
import { ITelephonyProvider } from '../domain/contracts/ITelephonyProvider';
import { IMeasurementRepository } from '../domain/contracts/IMeasurementRepository';

import { NetInfoAdapter } from '../infrastructure/network-state/NetInfoAdapter';
import { ExpoLocationAdapter } from '../infrastructure/location/ExpoLocationAdapter';
import { FallbackTelephonyProvider } from '../infrastructure/telephony/FallbackTelephonyProvider';
import { MemoryMeasurementRepository } from '../infrastructure/persistence/MemoryMeasurementRepository';

/**
 * ServiceContainer centraliza la inyección de dependencias para cumplir con el principio de Inversión de Dependencias (DIP).
 * Las capas de aplicación y presentación dependen de contratos (interfaces), no de implementaciones concretas.
 */
class ServiceContainer {
  private static instance: ServiceContainer;

  public readonly networkStateProvider: INetworkStateProvider;
  public readonly locationProvider: ILocationProvider;
  public telephonyProvider: ITelephonyProvider;
  public measurementRepository: IMeasurementRepository;

  private constructor() {
    this.networkStateProvider = new NetInfoAdapter();
    this.locationProvider = new ExpoLocationAdapter();
    this.telephonyProvider = new FallbackTelephonyProvider();
    this.measurementRepository = new MemoryMeasurementRepository();
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Permite sustituir implementaciones en tiempo de ejecución (útil para tests unitarios o al inicializar módulos nativos).
   */
  public setTelephonyProvider(provider: ITelephonyProvider): void {
    this.telephonyProvider = provider;
  }

  public setMeasurementRepository(repository: IMeasurementRepository): void {
    this.measurementRepository = repository;
  }
}

export const container = ServiceContainer.getInstance();
