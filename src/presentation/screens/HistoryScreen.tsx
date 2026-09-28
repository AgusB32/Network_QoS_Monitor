import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { MeasurementSession } from '../../domain/models/session';

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  // Lista de sesiones de muestra (se poblarán automáticamente desde IMeasurementRepository)
  const [sessions, setSessions] = useState<MeasurementSession[]>([
    {
      id: 'session-001',
      timestamp: Date.now() - 3600000,
      durationMs: 4500,
      isBackground: false,
      networkState: {
        isConnected: true,
        isInternetReachable: true,
        type: 'WIFI',
        isWifi: true,
        isCellular: false,
        details: { ipAddress: '192.168.1.45', ssid: 'Fibertel-WiFi' },
      },
      telephony: {
        carrierName: 'Claro AR',
        networkType: '4G_LTE',
        rssiDbm: -78,
      },
      location: {
        latitude: -32.484,
        longitude: -58.232,
        accuracy: 12,
        timestamp: Date.now() - 3600000,
      },
      latencyResults: [],
      throughput: {
        downloadMbps: 54.2,
        uploadMbps: 21.0,
        downloadBytesTransferred: 5242880,
        uploadBytesTransferred: 2097152,
        durationMs: 3200,
        serverUrl: 'http://10.0.2.2:3000',
      },
      qosSummary: {
        overallScore: 92,
        rating: 'EXCELLENT',
        averageLatencyMs: 22.4,
        averageJitterMs: 2.8,
        averagePacketLossPercent: 0,
        diagnostics: ['Conexión de alto rendimiento.'],
      },
    },
    {
      id: 'session-002',
      timestamp: Date.now() - 86400000,
      durationMs: 5100,
      isBackground: true,
      networkState: {
        isConnected: true,
        isInternetReachable: true,
        type: '4G_LTE',
        isWifi: false,
        isCellular: true,
      },
      telephony: {
        carrierName: 'Personal',
        networkType: '4G_LTE',
        rssiDbm: -98,
      },
      location: {
        latitude: -32.481,
        longitude: -58.235,
        accuracy: 18,
        timestamp: Date.now() - 86400000,
      },
      latencyResults: [],
      throughput: null,
      qosSummary: {
        overallScore: 71,
        rating: 'GOOD',
        averageLatencyMs: 46.1,
        averageJitterMs: 8.4,
        averagePacketLossPercent: 1.2,
        diagnostics: ['Muestreo periódico en segundo plano.'],
      },
    },
  ]);

  const handleExportJson = async () => {
    try {
      const jsonContent = JSON.stringify(sessions, null, 2);
      await Share.share({
        message: jsonContent,
        title: 'Exportación QoS - JSON',
      });
    } catch (err: any) {
      Alert.alert('Error al exportar', err.message);
    }
  };

  const handleExportCsv = async () => {
    try {
      const header = 'id,timestamp,networkType,carrier,rssiDbm,avgLatencyMs,jitterMs,packetLoss,downloadMbps,uploadMbps,score,lat,lon\n';
      const rows = sessions.map((s) =>
        [
          s.id,
          new Date(s.timestamp).toISOString(),
          s.networkState.type,
          s.telephony.carrierName || 'N/A',
          s.telephony.rssiDbm ?? '',
          s.qosSummary.averageLatencyMs,
          s.qosSummary.averageJitterMs,
          s.qosSummary.averagePacketLossPercent,
          s.throughput?.downloadMbps ?? '',
          s.throughput?.uploadMbps ?? '',
          s.qosSummary.overallScore,
          s.location?.latitude ?? '',
          s.location?.longitude ?? '',
        ].join(',')
      ).join('\n');

      await Share.share({
        message: header + rows,
        title: 'Exportación QoS - CSV',
      });
    } catch (err: any) {
      Alert.alert('Error al exportar', err.message);
    }
  };

  const getBadgeColor = (score: number) => {
    if (score >= 80) return Colors.excellent;
    if (score >= 60) return Colors.fair;
    return Colors.critical;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Historial de Sesiones</Text>
          <Text style={styles.subtitle}>Registro Cronológico & Exportación</Text>
        </View>

        {/* Botones de Exportación (RF-08) */}
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportJson}
            activeOpacity={0.8}
          >
            <Text style={styles.exportButtonText}>EXPORTAR JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, styles.exportCsvButton]}
            onPress={handleExportCsv}
            activeOpacity={0.8}
          >
            <Text style={[styles.exportButtonText, styles.exportCsvText]}>EXPORTAR CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Sesiones */}
        <Text style={styles.sectionTitle}>SESIONES GUARDADAS ({sessions.length})</Text>

        {sessions.map((item) => {
          const badgeColor = getBadgeColor(item.qosSummary.overallScore);
          const dateStr = new Date(item.timestamp).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <View key={item.id} style={styles.sessionCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardDate}>{dateStr}</Text>
                  <Text style={styles.cardNetwork}>
                    {item.networkState.type.replace('_', ' ')} •{' '}
                    {item.telephony.carrierName || 'Wi-Fi'}
                  </Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: `${badgeColor}20` }]}>
                  <Text style={[styles.scoreBadgeText, { color: badgeColor }]}>
                    {item.qosSummary.overallScore} / 100
                  </Text>
                </View>
              </View>

              <View style={styles.cardMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>RTT Prom.</Text>
                  <Text style={styles.metricVal}>{item.qosSummary.averageLatencyMs} ms</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Jitter</Text>
                  <Text style={styles.metricVal}>{item.qosSummary.averageJitterMs} ms</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Pérdida</Text>
                  <Text style={styles.metricVal}>{item.qosSummary.averagePacketLossPercent}%</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Bajada</Text>
                  <Text style={styles.metricVal}>
                    {item.throughput ? `${item.throughput.downloadMbps} M` : 'N/D'}
                  </Text>
                </View>
              </View>

              {item.location && (
                <View style={styles.locationFooter}>
                  <Text style={styles.locationText}>
                    GPS: {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)} (±
                    {item.location.accuracy.toFixed(0)}m)
                  </Text>
                  {item.isBackground && (
                    <View style={styles.bgBadge}>
                      <Text style={styles.bgBadgeText}>BACKGROUND</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  exportButton: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  exportButtonText: {
    ...Typography.badge,
    color: Colors.primary,
  },
  exportCsvButton: {
    borderColor: Colors.secondary,
  },
  exportCsvText: {
    color: Colors.secondary,
  },
  sectionTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  sessionCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardDate: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  cardNetwork: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreBadgeText: {
    ...Typography.badge,
    fontSize: 12,
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10,
  },
  metricVal: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  bgBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bgBadgeText: {
    ...Typography.badge,
    color: '#A78BFA',
    fontSize: 9,
  },
});
