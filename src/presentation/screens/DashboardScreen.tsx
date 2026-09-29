import React, { useEffect } from 'react';
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
import { useNetworkStore } from '../state/useNetworkStore';
import { useMeasurementStore } from '../state/useMeasurementStore';
import { NetworkStatusHeader } from '../components/NetworkStatusHeader';
import { MetricCard } from '../components/MetricCard';
import { PermissionBanner } from '../components/PermissionBanner';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const {
    networkState,
    telephony,
    permissions,
    isInitializing,
    initialize,
    refreshNetworkState,
    requestPermissions,
  } = useNetworkStore();

  const { latestSession, isRunning, runMeasurement } = useMeasurementStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleStartMeasurement = () => {
    navigation.navigate('Resultados');
    if (!isRunning) {
      runMeasurement();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Superior */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Network QoS Monitor</Text>
            <Text style={styles.appSubtitle}>Telemetría y Diagnóstico Móvil</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshNetworkState}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>

        {isInitializing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Iniciando adaptadores de red...</Text>
          </View>
        ) : (
          <>
            {/* Banner de Permisos */}
            <PermissionBanner
              permissions={permissions}
              onRequestPermissions={requestPermissions}
            />

            {/* Cabecera de Estado de Conexión en Vivo */}
            <NetworkStatusHeader networkState={networkState} telephony={telephony} />

            {/* Botón Principal "Medir Ahora" */}
            <TouchableOpacity
              style={styles.measureButton}
              onPress={handleStartMeasurement}
              activeOpacity={0.85}
            >
              <View style={styles.measurePulseCircle} />
              <View style={{ flex: 1 }}>
                <Text style={styles.measureButtonTitle}>
                  {isRunning ? 'MEDICIÓN EN PROCESO...' : 'INICIAR TEST DE QOS'}
                </Text>
                <Text style={styles.measureButtonSubtitle}>
                  RTT, Jitter RFC 3550, Throughput & GPS
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta de Resumen de Última Medición */}
            {latestSession && (
              <>
                <Text style={styles.sectionTitle}>ÚLTIMA MEDICIÓN REALIZADA</Text>
                <View style={styles.lastSessionCard}>
                  <View style={styles.lastSessionHeader}>
                    <Text style={styles.lastSessionTitle}>Puntuación QoS</Text>
                    <View style={styles.lastSessionScoreBadge}>
                      <Text style={styles.lastSessionScoreText}>
                        {latestSession.qosSummary.overallScore} / 100
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.lastSessionMetrics}>
                    RTT: {latestSession.qosSummary.averageLatencyMs} ms | Jitter: {latestSession.qosSummary.averageJitterMs} ms | Bajada: {latestSession.throughput ? `${latestSession.throughput.downloadMbps} Mbps` : 'N/D'}
                  </Text>
                </View>
              </>
            )}

            {/* Métricas Rápidas del Entorno */}
            <Text style={styles.sectionTitle}>ESTADO DEL DISPOSITIVO</Text>

            <View style={styles.metricsGrid}>
              <MetricCard
                title="TIPO DE RED"
                value={networkState.type.replace('_', ' ')}
                subtitle={networkState.isWifi ? 'Banda Ancha Inalámbrica' : 'Enlace Celular'}
                statusColor={networkState.isConnected ? Colors.primary : Colors.critical}
                style={styles.halfCard}
              />

              <MetricCard
                title={networkState.isWifi ? 'ENLACE LOCAL' : 'SEÑAL CELULAR'}
                value={
                  telephony.rssiDbm !== null
                    ? `${telephony.rssiDbm}`
                    : networkState.isWifi
                    ? 'Wi-Fi'
                    : 'N/A'
                }
                unit={telephony.rssiDbm !== null ? 'dBm' : undefined}
                subtitle={
                  telephony.rssiDbm !== null
                    ? telephony.rssiDbm > -85
                      ? 'Nivel óptimo'
                      : 'Nivel moderado'
                    : networkState.isWifi
                    ? 'dBm aplica en datos celulares'
                    : 'Restricción de sandbox iOS'
                }
                statusColor={
                  telephony.rssiDbm !== null
                    ? telephony.rssiDbm > -85
                      ? Colors.excellent
                      : Colors.fair
                    : networkState.isWifi
                    ? Colors.wifi
                    : Colors.textMuted
                }
                style={styles.halfCard}
              />
            </View>

            <MetricCard
              title="HOSTS DE SONDAJE CONFIGURADOS"
              value="3 Hosts Activos"
              subtitle="Cloudflare (1.1.1.1), Google (8.8.8.8), Cloudflare (1.0.0.1)"
              badgeText="TCP Multi-Host"
              statusColor={Colors.secondary}
            />

            <MetricCard
              title="MOTOR DE PROCESAMIENTO"
              value="Clean Architecture (SOLID)"
              subtitle="Orquestación desacoplada, sondas concurrentes y persistencia"
              badgeText="V1.0 - FCyT"
              statusColor={Colors.good}
            />
          </>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  appTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  appSubtitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  refreshButton: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshButtonText: {
    ...Typography.badge,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    marginTop: 16,
  },
  measureButton: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.borderHighlight,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  measurePulseCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.secondary,
    marginRight: 16,
  },
  measureButtonTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  measureButtonSubtitle: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    marginTop: 2,
  },
  lastSessionCard: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  lastSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastSessionTitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lastSessionScoreBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lastSessionScoreText: {
    ...Typography.badge,
    color: Colors.excellent,
    fontWeight: '800',
  },
  lastSessionMetrics: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48.5%',
  },
});
