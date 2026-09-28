import { create } from 'zustand';
import { MeasurementSession } from '../../domain/models/session';
import {
  MeasurementProgressUpdate,
  RunMeasurementSessionUseCase,
} from '../../application/use-cases/RunMeasurementSessionUseCase';
import { container } from '../../core/container';

interface MeasurementStoreState {
  isRunning: boolean;
  progress: MeasurementProgressUpdate | null;
  latestSession: MeasurementSession | null;
  history: MeasurementSession[];
  error: string | null;

  runMeasurement: () => Promise<MeasurementSession | null>;
  loadHistory: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

const runUseCase = new RunMeasurementSessionUseCase();

export const useMeasurementStore = create<MeasurementStoreState>((set, get) => ({
  isRunning: false,
  progress: null,
  latestSession: null,
  history: [],
  error: null,

  runMeasurement: async () => {
    if (get().isRunning) return null;

    set({ isRunning: true, error: null, progress: null });

    try {
      const session = await runUseCase.execute({
        onProgress: (update) => {
          set({ progress: update });
        },
      });

      // Actualizar historial local
      const updatedHistory = await container.measurementRepository.getSessions();

      set({
        isRunning: false,
        latestSession: session,
        history: updatedHistory,
      });

      return session;
    } catch (err: any) {
      console.error('[useMeasurementStore] Measurement error:', err);
      set({
        isRunning: false,
        error: err.message || 'Error durante la ejecución del test de QoS',
      });
      return null;
    }
  },

  loadHistory: async () => {
    try {
      const sessions = await container.measurementRepository.getSessions();
      set({ history: sessions });
    } catch (err: any) {
      console.error('[useMeasurementStore] Error loading history:', err);
    }
  },

  deleteSession: async (id: string) => {
    try {
      await container.measurementRepository.deleteSession(id);
      await get().loadHistory();
    } catch (err: any) {
      console.error('[useMeasurementStore] Error deleting session:', err);
    }
  },
}));
