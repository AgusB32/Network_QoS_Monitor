import { MeasurementSession } from '../models/session';

export interface IExportService {
  /**
   * Exporta las sesiones dadas en formato JSON estructurado.
   */
  exportToJson(sessions: MeasurementSession[]): string;

  /**
   * Exporta las sesiones dadas en formato CSV tabular.
   */
  exportToCsv(sessions: MeasurementSession[]): string;

  /**
   * Comparte el archivo exportado mediante el diálogo nativo del sistema operativo.
   */
  shareExport(content: string, filename: string, mimeType: string): Promise<boolean>;
}
