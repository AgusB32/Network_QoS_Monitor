import { IMeasurementRepository } from '../../domain/contracts/IMeasurementRepository';
import { HeatmapPoint, MeasurementSession, SessionFilter } from '../../domain/models/session';

export class MemoryMeasurementRepository implements IMeasurementRepository {
  private sessions: MeasurementSession[] = [];

  public async initialize(): Promise<void> {
    // Inicialización en memoria
  }

  public async saveSession(session: MeasurementSession): Promise<void> {
    // Inserta al inicio (más reciente primero)
    this.sessions = [session, ...this.sessions.filter((s) => s.id !== session.id)];
  }

  public async getSessionById(id: string): Promise<MeasurementSession | null> {
    return this.sessions.find((s) => s.id === id) || null;
  }

  public async getSessions(filter?: SessionFilter): Promise<MeasurementSession[]> {
    let result = [...this.sessions];

    if (!filter) {
      return result;
    }

    if (filter.networkType) {
      result = result.filter((s) => s.networkState.type === filter.networkType);
    }

    if (filter.startDate) {
      result = result.filter((s) => s.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      result = result.filter((s) => s.timestamp <= filter.endDate!);
    }

    if (filter.minQoSScore !== undefined) {
      result = result.filter((s) => s.qosSummary.overallScore >= filter.minQoSScore!);
    }

    if (filter.maxQoSScore !== undefined) {
      result = result.filter((s) => s.qosSummary.overallScore <= filter.maxQoSScore!);
    }

    return result;
  }

  public async getHeatmapPoints(): Promise<HeatmapPoint[]> {
    return this.sessions
      .filter((s) => s.location !== null)
      .map((s) => ({
        latitude: s.location!.latitude,
        longitude: s.location!.longitude,
        weight: Math.max(0.1, s.qosSummary.overallScore / 100),
        carrier: s.telephony.carrierName || undefined,
        networkType: s.networkState.type,
      }));
  }

  public async deleteSession(id: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.id !== id);
  }

  public async clearAllSessions(): Promise<void> {
    this.sessions = [];
  }

  public async countSessions(): Promise<number> {
    return this.sessions.length;
  }
}
