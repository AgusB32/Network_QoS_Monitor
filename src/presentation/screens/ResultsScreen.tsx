import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { MetricCard } from '../components/MetricCard';
import { useMeasurementStore } from '../state/useMeasurementStore';

interface ResultsScreenProps {
  navigation: any;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = () => {
  const { isRunning, progress, latestSession, runMeasurement } = useMeasurementStore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.excellent;
    if (score >= 60) return Colors.fair;
    return Colors.critical;
  };

  const score = latestSession?.qosSummary.overallScore ?? 0;
  const rating = latestSession?.qosSummary.rating ?? 'SIN DATOS';
  const hasResults = Boolean(latestSession);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Resultados de Calidad</Text>
          <Text style={styles.subtitle}>Parámetros de Servicio (QoS)</Text>
        </View>

        {/* Panel de Acción y Progreso */}
        <View style={styles.controlPanel}>
          {isRunning ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.progressText}>
                  {progress?.message || 'Iniciando medición...'}
                </Text>
              </View>

              {/* Barra de progreso */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress?.percent || 10}%` },
                  ]}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => runMeasurement()}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>
                {hasResults ? 'REPETIR TEST COMPLETO' : 'INICIAR TEST AHORA'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Score Principal de QoS */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>PUNTUACIÓN GLOBAL DE RED</Text>
          <View style={styles.scoreRow}>
            <Text
              style={[
                styles.scoreValue,
                { color: hasResults ? getScoreColor(score) : Colors.textMuted },
              ]}
            >
              {hasResults ? score : '--'}
            </Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <View
            style={[
              styles.ratingBadge,
              {
                backgroundColor: hasResults
                  ? `${getScoreColor(score)}20`
                  : 'rgba(255, 255, 255, 0.05)',
              },
            ]}
          >
            <Text
              style={[
                styles.ratingText,
                { color: hasResults ? getScoreColor(score) : Colors.textMuted },
              ]}
            >
              {hasResults ? `CALIDAD ${rating}` : 'PRESIONA INICIAR TEST'}
            </Text>
          </View>
        </View>

        {/* Grilla de Métricas de Latencia y Jitter */}
        <Text style={styles.sectionHeader}>MÉTRICAS DE RETARDO & ESTABILIDAD</Text>
        <View style={styles.grid}>
          <MetricCard
            title="LATENCIA (RTT PROMEDIO)"
            value={hasResults ? `${latestSession?.qosSummary.averageLatencyMs}` : '--'}
            unit="ms"
            subtitle="Estadística multi-host"
            statusColor={Colors.primary}
            style={styles.halfCard}
          />
          <MetricCard
            title="JITTER (RFC 3550)"
            value={hasResults ? `${latestSession?.qosSummary.averageJitterMs}` : '--'}
            unit="ms"
            subtitle="Variación inter-paquete"
            statusColor={Colors.secondary}
            style={styles.halfCard}
          />
        </View>

        <View style={styles.grid}>
          <MetricCard
            title="PÉRDIDA DE PAQUETES"
            value={hasResults ? `${latestSession?.qosSummary.averagePacketLossPercent}%` : '--%'}
            subtitle="Sondas TCP respondidas"
            statusColor={
              latestSession?.qosSummary.averagePacketLossPercent === 0
                ? Colors.excellent
                : Colors.critical
            }
            style={styles.halfCard}
          />
          <MetricCard
            title="HOSTS SONDEADOS"
            value={hasResults ? `${latestSession?.latencyResults.length}` : '3'}
            unit="hosts"
            subtitle="Cloudflare, Google, Cloudflare Sec."
            statusColor={Colors.good}
            style={styles.halfCard}
          />
        </View>

        {/* Desglose por Host */}
        {hasResults && latestSession && latestSession.latencyResults.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>DESGLOSE INDIVIDUAL POR HOST</Text>
            {latestSession.latencyResults.map((hr, idx) => (
              <View key={idx} style={styles.hostRow}>
                <View>
                  <Text style={styles.hostName}>{hr.host}:{hr.port}</Text>
                  <Text style={styles.hostSub}>
                    Mín: {hr.minRttMs}ms | Prom: {hr.avgRttMs}ms | Máx: {hr.maxRttMs}ms
                  </Text>
                </View>
                <View style={styles.hostStats}>
                  <Text style={styles.hostJitter}>Jitter: {hr.jitterMs}ms</Text>
                  <Text style={[styles.hostLoss, { color: hr.packetLossPercent > 0 ? Colors.critical : Colors.excellent }]}>
                    {hr.packetLossPercent}% pérdida
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Métricas de Throughput */}
        <Text style={styles.sectionHeader}>ANCHO DE BANDA EFECTIVO (THROUGHPUT)</Text>
        {latestSession?.throughput?.serverUrl ? (
          <Text style={styles.serverInfoBadge}>
            Servidor: {latestSession.throughput.serverUrl}
          </Text>
        ) : null}
        <View style={styles.grid}>
          <MetricCard
            title="VELOCIDAD DE BAJADA"
            value={
              latestSession?.throughput
                ? `${latestSession.throughput.downloadMbps}`
                : hasResults
                ? 'N/D'
                : '--'
            }
            unit="Mbps"
            subtitle="Descarga sostenida"
            statusColor={Colors.excellent}
            style={styles.halfCard}
          />
          <MetricCard
            title="VELOCIDAD DE SUBIDA"
            value={
              latestSession?.throughput
                ? `${latestSession.throughput.uploadMbps}`
                : hasResults
                ? 'N/D'
                : '--'
            }
            unit="Mbps"
            subtitle="Subida sostenida"
            statusColor={Colors.secondary}
            style={styles.halfCard}
          />
        </View>

        {/* Diagnóstico de Experiencia (QoE) */}
        <Text style={styles.sectionHeader}>DIAGNÓSTICO AUTOMÁTICO</Text>
        <View style={styles.diagnosticCard}>
          {hasResults && latestSession?.qosSummary.diagnostics.length ? (
            latestSession.qosSummary.diagnostics.map((diag, index) => (
              <Text key={index} style={styles.diagnosticItem}>
                • {diag}
              </Text>
            ))
          ) : (
            <Text style={styles.diagnosticItem}>
              Ejecuta una medición para obtener el análisis inteligente de tu conexión.
            </Text>
          )}
        </View>
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
  controlPanel: {
    marginBottom: 20,
  },
  progressContainer: {
    backgroundColor: Colors.surfaceCard,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginLeft: 10,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    ...Typography.badge,
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: 13,
  },
  scoreContainer: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  scoreLabel: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    ...Typography.metricLarge,
    fontSize: 54,
    fontWeight: '900',
  },
  scoreMax: {
    ...Typography.h2,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  ratingBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    ...Typography.badge,
    fontSize: 11,
  },
  sectionHeader: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 0.8,
  },
  serverInfoBadge: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48.5%',
  },
  hostRow: {
    backgroundColor: Colors.surfaceCard,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  hostSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  hostStats: {
    alignItems: 'flex-end',
  },
  hostJitter: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: '600',
  },
  hostLoss: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  diagnosticCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diagnosticItem: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
