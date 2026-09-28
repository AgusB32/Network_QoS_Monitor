import React, { useState } from 'react';
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
import { DEFAULT_PROBE_HOSTS } from '../../core/constants';

interface ResultsScreenProps {
  navigation: any;
  route?: any;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('Listo para iniciar');

  // Valores de ejemplo predefinidos (se conectarán dinámicamente al MeasurementOrchestrator en Fase 3)
  const [hasResults, setHasResults] = useState(false);
  const [overallScore, setOverallScore] = useState(88);
  const [avgLatency, setAvgLatency] = useState(24.5);
  const [jitter, setJitter] = useState(3.2);
  const [packetLoss, setPacketLoss] = useState(0.0);
  const [downloadSpeed, setDownloadSpeed] = useState(48.2);
  const [uploadSpeed, setUploadSpeed] = useState(18.6);

  const startTest = async () => {
    setIsRunning(true);
    setProgressStage('1/3 Ejecutando sondas TCP de latencia contra 3 hosts...');
    setTimeout(() => {
      setProgressStage('2/3 Midiendo Throughput de descarga y subida...');
      setTimeout(() => {
        setProgressStage('3/3 Correlacionando coordenadas GPS y celda...');
        setTimeout(() => {
          setIsRunning(false);
          setHasResults(true);
          setProgressStage('Medición completada');
        }, 1000);
      }, 1200);
    }, 1200);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.excellent;
    if (score >= 60) return Colors.fair;
    return Colors.critical;
  };

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
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.progressText}>{progressStage}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={startTest}
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
            <Text style={[styles.scoreValue, { color: getScoreColor(overallScore) }]}>
              {overallScore}
            </Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: `${getScoreColor(overallScore)}20` },
            ]}
          >
            <Text
              style={[
                styles.ratingText,
                { color: getScoreColor(overallScore) },
              ]}
            >
              CALIDAD EXCELENTE
            </Text>
          </View>
        </View>

        {/* Grilla de Métricas de Latencia y Jitter */}
        <Text style={styles.sectionHeader}>MÉTRICAS DE RETARDO & ESTABILIDAD</Text>
        <View style={styles.grid}>
          <MetricCard
            title="LATENCIA (RTT PROMEDIO)"
            value={avgLatency}
            unit="ms"
            subtitle="Mín: 18.2 ms | Máx: 32.1 ms"
            statusColor={Colors.primary}
            style={styles.halfCard}
          />
          <MetricCard
            title="JITTER (RFC 3550)"
            value={jitter}
            unit="ms"
            subtitle="Variación de retardo inter-paquete"
            statusColor={Colors.secondary}
            style={styles.halfCard}
          />
        </View>

        <View style={styles.grid}>
          <MetricCard
            title="PÉRDIDA DE PAQUETES"
            value={`${packetLoss}%`}
            subtitle="0 paquetes perdidos de 15 enviados"
            statusColor={packetLoss === 0 ? Colors.excellent : Colors.critical}
            style={styles.halfCard}
          />
          <MetricCard
            title="SERVIDORES SONDEADOS"
            value={`${DEFAULT_PROBE_HOSTS.length}`}
            unit="hosts"
            subtitle="Cloudflare, Google, Quad9"
            statusColor={Colors.good}
            style={styles.halfCard}
          />
        </View>

        {/* Métricas de Throughput */}
        <Text style={styles.sectionHeader}>ANCHO DE BANDA EFECTIVO (THROUGHPUT)</Text>
        <View style={styles.grid}>
          <MetricCard
            title="VELOCIDAD DE BAJADA"
            value={downloadSpeed}
            unit="Mbps"
            subtitle="Descarga sostenida 5 MB"
            statusColor={Colors.excellent}
            style={styles.halfCard}
          />
          <MetricCard
            title="VELOCIDAD DE SUBIDA"
            value={uploadSpeed}
            unit="Mbps"
            subtitle="Subida sostenida 2 MB"
            statusColor={Colors.secondary}
            style={styles.halfCard}
          />
        </View>

        {/* Diagnóstico de Experiencia (QoE) */}
        <Text style={styles.sectionHeader}>DIAGNÓSTICO AUTOMÁTICO</Text>
        <View style={styles.diagnosticCard}>
          <Text style={styles.diagnosticItem}>
            ✓ Streaming 4K / UHD: Compatible con fluidez óptima.
          </Text>
          <Text style={styles.diagnosticItem}>
            ✓ VoIP y Videollamadas: Excelente estabilidad y bajo retardo.
          </Text>
          <Text style={styles.diagnosticItem}>
            ✓ Juegos en tiempo real: Latencia apta para multijugador competitivo.
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginLeft: 10,
    fontWeight: '600',
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
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48.5%',
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
