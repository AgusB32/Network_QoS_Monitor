import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { PermissionStatusSummary } from '../../infrastructure/permissions/PermissionsManager';

interface PermissionBannerProps {
  permissions: PermissionStatusSummary;
  onRequestPermissions: () => void;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  permissions,
  onRequestPermissions,
}) => {
  const needsLocation = !permissions.location;
  const needsPhone = !permissions.phoneState;

  if (!needsLocation && !needsPhone) {
    return null;
  }

  const missingList: string[] = [];
  if (needsLocation) missingList.push('Ubicación GPS');
  if (needsPhone) missingList.push('Datos Celulares/Operador');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Permisos opcionales pendientes</Text>
        <Text style={styles.description}>
          Para georreferenciar las mediciones y leer la señal celular, habilita:{' '}
          <Text style={styles.highlight}>{missingList.join(' y ')}</Text>.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onRequestPermissions}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Habilitar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.fair,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  highlight: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.fair,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    ...Typography.badge,
    color: Colors.textInverse,
    fontWeight: '800',
  },
});
