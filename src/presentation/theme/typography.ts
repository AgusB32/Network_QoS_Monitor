import { TextStyle } from 'react-native';

export const Typography: { [key: string]: TextStyle } = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  metricLarge: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  metricMedium: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricSmall: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
};
