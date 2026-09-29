import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { NetworkTechnology } from '../../domain/models/network';
import { useMeasurementStore } from '../state/useMeasurementStore';
import { useNetworkStore } from '../state/useNetworkStore';

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = () => {
  const { history } = useMeasurementStore();
  const { currentLocation } = useNetworkStore();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | NetworkTechnology>('ALL');
  const mapRef = useRef<MapView | null>(null);

  const filterOptions: Array<{ label: string; value: 'ALL' | NetworkTechnology }> = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Wi-Fi', value: 'WIFI' },
    { label: '4G LTE', value: '4G_LTE' },
    { label: '5G NR', value: '5G_NR' },
  ];

  const geoSessions = history.filter((s) => {
    if (!s.location) return false;
    if (selectedFilter === 'ALL') return true;
    return s.networkState.type === selectedFilter;
  });

  const getPointColor = (score: number) => {
    if (score >= 80) return Colors.excellent;
    if (score >= 50) return Colors.fair;
    return Colors.critical;
  };

  // Coordenada de referencia para centrar el mapa (última sesión o ubicación actual)
  const referenceCoords = geoSessions[0]?.location || currentLocation || {
    latitude: -33.03138,
    longitude: -59.00525,
  };

  // Animar hacia las coordenadas más recientes cuando haya nuevas mediciones
  useEffect(() => {
    if (mapRef.current && referenceCoords) {
      mapRef.current.animateToRegion(
        {
          latitude: referenceCoords.latitude,
          longitude: referenceCoords.longitude,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        },
        1000
      );
    }
  }, [referenceCoords.latitude, referenceCoords.longitude]);

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

      {/* Contenedor del Mapa Real (react-native-maps) */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          userInterfaceStyle="dark"
          initialRegion={{
            latitude: referenceCoords.latitude,
            longitude: referenceCoords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {geoSessions.map((s) => {
            const color = getPointColor(s.qosSummary.overallScore);
            const lat = s.location!.latitude;
            const lon = s.location!.longitude;

            return (
              <React.Fragment key={s.id}>
                {/* Capa de calor / radio de cobertura alrededor del punto */}
                <Circle
                  center={{ latitude: lat, longitude: lon }}
                  radius={250}
                  fillColor={`${color}30`}
                  strokeColor={color}
                  strokeWidth={1.5}
                />
                <Circle
                  center={{ latitude: lat, longitude: lon }}
                  radius={100}
                  fillColor={`${color}60`}
                  strokeColor="transparent"
                />

                {/* Marcador interactivo del punto medido */}
                <Marker
                  coordinate={{ latitude: lat, longitude: lon }}
                  title={`${s.qosSummary.overallScore} pts • ${s.networkState.type}`}
                  description={`RTT: ${s.qosSummary.averageLatencyMs}ms | ${s.telephony.carrierName || 'Wi-Fi'}`}
                  pinColor={color}
                />
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Overlay informativo sobre el mapa */}
        <View style={styles.mapInfoCard}>
          <View style={styles.mapInfoHeader}>
            <Text style={styles.mapInfoTitle}>Capa de Cobertura Activa</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {geoSessions.length} {geoSessions.length === 1 ? 'PUNTO GPS' : 'PUNTOS GPS'}
              </Text>
            </View>
          </View>
          <Text style={styles.mapInfoDesc}>
            {geoSessions.length >= 5
              ? 'Densidad suficiente: Visualizando gradientes de cobertura.'
              : 'Mostrando marcadores georreferenciados con auras de intensidad.'}
          </Text>
        </View>
      </View>

      {/* Lista de Puntos Georreferenciados Recientes */}
      <View style={styles.pointsListContainer}>
        <Text style={styles.pointsListTitle}>MEDICIONES GEORREFERENCIADAS</Text>
        <ScrollView style={styles.pointsScroll} showsVerticalScrollIndicator={false}>
          {geoSessions.length === 0 ? (
            <Text style={styles.noPointsText}>
              No hay mediciones con GPS en este filtro. Activa la ubicación y ejecuta una medición.
            </Text>
          ) : (
            geoSessions.map((s) => {
              const color = getPointColor(s.qosSummary.overallScore);
              return (
                <View key={s.id} style={styles.pointRow}>
                  <View style={[styles.pointDot, { backgroundColor: color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pointCoords}>
                      Lat: {s.location?.latitude.toFixed(5)}, Lon: {s.location?.longitude.toFixed(5)}
                    </Text>
                    <Text style={styles.pointDetails}>
                      {s.networkState.type.replace('_', ' ')} • {s.telephony.carrierName || 'Wi-Fi'} • {s.qosSummary.averageLatencyMs} ms
                    </Text>
                  </View>
                  <Text style={[styles.pointScore, { color }]}>
                    {s.qosSummary.overallScore} pts
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
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
    height: 250,
    marginHorizontal: 16,
    backgroundColor: '#070A10',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  mapInfoCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(21, 29, 44, 0.92)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mapInfoTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  pointsBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pointsBadgeText: {
    ...Typography.badge,
    color: Colors.primary,
    fontSize: 10,
  },
  mapInfoDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  pointsListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pointsListTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  pointsScroll: {
    flex: 1,
  },
  noPointsText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  pointRow: {
    backgroundColor: Colors.surfaceCard,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  pointCoords: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  pointDetails: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
  },
  pointScore: {
    ...Typography.bodySmall,
    fontWeight: '800',
  },
  legendContainer: {
    padding: 14,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    marginBottom: 6,
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
