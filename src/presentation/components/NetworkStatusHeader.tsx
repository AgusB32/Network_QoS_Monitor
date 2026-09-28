import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { NetworkStateSnapshot, TelephonyCellInfo } from '../../domain/models/network';

interface NetworkStatusHeaderProps {
  networkState: NetworkStateSnapshot;
  telephony: TelephonyCellInfo;
}

export const NetworkStatusHeader: React.FC<NetworkStatusHeaderProps> = ({
  networkState,
  telephony,
}) => {
  const getTechnologyColor = () => {
    switch (networkState.type) {
      case '5G_NR':
        return Colors.cellular5G;
      case '4G_LTE':
        return Colors.cellular4G;
      case '3G':
        return Colors.cellular3G;
      case 'WIFI':
        return Colors.wifi;
      default:
        return Colors.none;
    }
  };

  const isOnline = networkState.isConnected;
  const techColor = getTechnologyColor();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.statusIndicatorRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? Colors.excellent : Colors.critical },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'CONECTADO' : 'SIN CONEXIÓN'}
          </Text>
        </View>

        <View style={[styles.techBadge, { borderColor: techColor }]}>
          <Text style={[styles.techText, { color: techColor }]}>
            {networkState.type.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.column}>
          <Text style={styles.label}>OPERADOR / RED</Text>
          <Text style={styles.mainInfo}>
            {telephony.carrierName || (networkState.isWifi ? 'Red Wi-Fi' : 'No detectado')}
          </Text>
        </View>

        <View style={[styles.column, styles.alignRight]}>
          <Text style={styles.label}>SEÑAL CELULAR</Text>
          <Text style={styles.mainInfo}>
            {telephony.rssiDbm !== null ? `${telephony.rssiDbm} dBm` : 'N/A'}
          </Text>
        </View>
      </View>

      {networkState.details?.ipAddress && (
        <View style={styles.footerRow}>
          <Text style={styles.ipText}>IP: {networkState.details.ipAddress}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    ...Typography.badge,
    color: Colors.textSecondary,
  },
  techBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  techText: {
    ...Typography.badge,
    fontSize: 11,
    fontWeight: '800',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  mainInfo: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ipText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
});
