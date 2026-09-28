import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { NetworkTechnology } from '../../domain/models/network';

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = () => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | NetworkTechnology>('ALL');

  const filterOptions: Array<{ label: string; value: 'ALL' | NetworkTechnology }> = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Wi-Fi', value: 'WIFI' },
    { label: '4G LTE', value: '4G_LTE' },
    { label: '5G NR', value: '5G_NR' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de Cobertura</Text>
        <Text style={styles.subtitle}>Georreferenciación & Heatmap Personal</Text>
      </View>

      {/* Selector de Filtros de Red */}
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

      {/* Contenedor del Mapa / Visualizador */}
      <View style={styles.mapContainer}>
        {/* Simulación visual de mapa oscuro con cuadrícula de telemetría */}
        <View style={styles.mapGridOverlay}>
          <View style={styles.radarCenter}>
            <View style={styles.radarRingOuter} />
            <View style={styles.radarRingInner} />
            <View style={styles.radarBlip} />
          </View>
        </View>

        {/* Overlay informativo sobre el mapa */}
        <View style={styles.mapInfoCard}>
          <Text style={styles.mapInfoTitle}>Capa de Cobertura Activa</Text>
          <Text style={styles.mapInfoDesc}>
            Se activará el Heatmap continuo al acumular ≥5 mediciones georreferenciadas.
          </Text>
        </View>
      </View>

      {/* Leyenda de Calidad */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>ESCALA DE CALIDAD / SEÑAL</Text>
        <View style={styles.legendItemsRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.excellent }]} />
            <Text style={styles.legendText}>Excelente (&gt;80)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.fair }]} />
            <Text style={styles.legendText}>Aceptable (50-79)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.critical }]} />
            <Text style={styles.legendText}>Crítica (&lt;50)</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 12,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: '#070A10',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRingOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  radarRingInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
  },
  radarBlip: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  mapInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(21, 29, 44, 0.92)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapInfoTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  mapInfoDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  legendContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  legendItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
