import { INetworkStateProvider } from '../domain/contracts/INetworkStateProvider';
import { ILocationProvider } from '../domain/contracts/ILocationProvider';
import { ITelephonyProvider } from '../domain/contracts/ITelephonyProvider';
import { IMeasurementRepository } from '../domain/contracts/IMeasurementRepository';
import { ILatencyProbe } from '../domain/contracts/ILatencyProbe';
import { IThroughputTester } from '../domain/contracts/IThroughputTester';

import { NetInfoAdapter } from '../infrastructure/network-state/NetInfoAdapter';
import { ExpoLocationAdapter } from '../infrastructure/location/ExpoLocationAdapter';
import { NativeTelephonyProvider } from '../infrastructure/telephony/NativeTelephonyProvider';
import { MemoryMeasurementRepository } from '../infrastructure/persistence/MemoryMeasurementRepository';
import { TcpSocketLatencyProbe } from '../infrastructure/probes/TcpSocketLatencyProbe';
import { HttpThroughputTester } from '../infrastructure/probes/HttpThroughputTester';

/**
 * ServiceContainer centraliza la inyección de dependencias para cumplir con el principio de Inversión de Dependencias (DIP).
 * Las capas de aplicación y presentación dependen de contratos (interfaces), no de implementaciones concretas.
 */
class ServiceContainer {
  private static instance: ServiceContainer;

  public readonly networkStateProvider: INetworkStateProvider;
  public readonly locationProvider: ILocationProvider;
  public readonly latencyProbe: ILatencyProbe;
  public readonly throughputTester: IThroughputTester;
  public telephonyProvider: ITelephonyProvider;
  public measurementRepository: IMeasurementRepository;

  private constructor() {
    this.networkStateProvider = new NetInfoAdapter();
    this.locationProvider = new ExpoLocationAdapter();
    this.latencyProbe = new TcpSocketLatencyProbe();
    this.throughputTester = new HttpThroughputTester();
    this.telephonyProvider = new NativeTelephonyProvider();
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
