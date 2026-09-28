import { MeasurementSession, SessionFilter, HeatmapPoint } from '../models/session';

export interface IMeasurementRepository {
  /**
   * Inicializa la base de datos y ejecuta migraciones si es necesario.
   */
  initialize(): Promise<void>;

  /**
   * Guarda una nueva sesión de medición.
   */
  saveSession(session: MeasurementSession): Promise<void>;

  /**
   * Obtiene una sesión por su identificador único UUID.
   */
  getSessionById(id: string): Promise<MeasurementSession | null>;

  /**
   * Lista sesiones con soporte de filtros (rango de fechas, tecnología de red, etc.).
   */
  getSessions(filter?: SessionFilter): Promise<MeasurementSession[]>;

  /**
   * Obtiene puntos geoespaciales agregados para renderizar el heatmap de cobertura.
   */
  getHeatmapPoints(): Promise<HeatmapPoint[]>;

  /**
   * Elimina una sesión del historial.
   */
  deleteSession(id: string): Promise<void>;

  /**
   * Limpia todo el historial de mediciones.
   */
  clearAllSessions(): Promise<void>;

  /**
   * Retorna el recuento total de mediciones registradas.
   */
  countSessions(): Promise<number>;
}
