import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  statusColor?: string;
  badgeText?: string;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  statusColor = Colors.primary,
  badgeText,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badgeText && (
          <View style={[styles.badge, { backgroundColor: `${statusColor}25` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{badgeText}</Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    ...Typography.badge,
    fontSize: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...Typography.metricMedium,
    fontWeight: '800',
  },
  unit: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    marginLeft: 6,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
