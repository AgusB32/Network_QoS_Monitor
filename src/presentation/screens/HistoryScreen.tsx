import React, { useEffect, useState } from 'react';
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
import { useMeasurementStore } from '../state/useMeasurementStore';
import { NetworkTechnology } from '../../domain/models/network';

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  const { history, loadHistory, deleteSession } = useMeasurementStore();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | NetworkTechnology>('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const filterOptions: Array<{ label: string; value: 'ALL' | NetworkTechnology }> = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Wi-Fi', value: 'WIFI' },
    { label: '4G LTE', value: '4G_LTE' },
    { label: '5G NR', value: '5G_NR' },
  ];

  const filteredHistory = history.filter((session) => {
    if (selectedFilter === 'ALL') return true;
    return session.networkState.type === selectedFilter;
  });

  const handleExportJson = async () => {
    if (filteredHistory.length === 0) {
      Alert.alert('Sin datos', 'No hay sesiones registradas para exportar.');
      return;
    }
    try {
      const jsonContent = JSON.stringify(filteredHistory, null, 2);
      await Share.share({
        message: jsonContent,
        title: 'Exportación QoS - JSON',
      });
    } catch (err: any) {
      Alert.alert('Error al exportar', err.message);
    }
  };

  const handleExportCsv = async () => {
    if (filteredHistory.length === 0) {
      Alert.alert('Sin datos', 'No hay sesiones registradas para exportar.');
      return;
    }
    try {
      const header =
        'id,timestamp,networkType,carrier,rssiDbm,avgLatencyMs,jitterMs,packetLoss,downloadMbps,uploadMbps,score,lat,lon\n';
      const rows = filteredHistory
        .map((s) =>
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
        )
        .join('\n');

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

        {/* Filtros de Red (RF-09) */}
        <View style={styles.filterRow}>
          {filterOptions.map((opt) => {
            const isActive = selectedFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Lista de Sesiones */}
        <Text style={styles.sectionTitle}>
          SESIONES REGISTRADAS ({filteredHistory.length})
        </Text>

        {filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Sin mediciones registradas</Text>
            <Text style={styles.emptySubtitle}>
              Ejecuta una medición desde la pantalla de Inicio o Resultados para registrar el historial.
            </Text>
          </View>
        ) : (
          filteredHistory.map((item) => {
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
                  <View style={{ flex: 1 }}>
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
                    <Text style={styles.metricVal}>
                      {item.qosSummary.averageLatencyMs} ms
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Jitter</Text>
                    <Text style={styles.metricVal}>
                      {item.qosSummary.averageJitterMs} ms
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Pérdida</Text>
                    <Text style={styles.metricVal}>
                      {item.qosSummary.averagePacketLossPercent}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Bajada</Text>
                    <Text style={styles.metricVal}>
                      {item.throughput ? `${item.throughput.downloadMbps} M` : 'N/D'}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationFooter}>
                  <Text style={styles.locationText}>
                    {item.location
                      ? `GPS: ${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`
                      : 'Sin coordenadas GPS'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteSession(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
    marginBottom: 16,
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  emptyContainer: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
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
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    ...Typography.bodySmall,
    color: Colors.critical,
    fontSize: 11,
    fontWeight: '600',
  },
});
