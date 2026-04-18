import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { FACILITY_TYPE_CONFIG, type EnergyFacility } from '../data/energyFacilities';
import { PROVINCE_DATA } from '../data/provinceData';
import { getCurrentWeather, computeFacilityMetrics } from '../data/weatherService';
import { ENERGY_FACILITIES } from '../data/energyFacilities';

interface Props {
  visible: boolean;
  facility: EnergyFacility | null;
  province: string | null;
  onClose: () => void;
}

export default function DetailSheet({ visible, facility, province, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(320)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 320,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  }, [visible]);

  if (!visible && !facility && !province) return null;

  // Facility detail mode
  if (facility) {
    const config = FACILITY_TYPE_CONFIG[facility.type];
    const weather = getCurrentWeather();
    const metrics = computeFacilityMetrics(facility, weather, ENERGY_FACILITIES);

    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={[styles.typeBadge, { backgroundColor: config.color + '25' }]}>
              <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{facility.name}</Text>
          <Text style={styles.subtitle}>{facility.description}</Text>

          {/* Metrics grid */}
          <View style={styles.metricsGrid}>
            <MetricCard label="Output" value={`${metrics.currentOutputMW.toFixed(1)} MW`} color={Colors.accentCyan} />
            <MetricCard label="Efficiency" value={`${metrics.efficiency}%`} color={Colors.accentEmerald} />
            <MetricCard label="Capacity" value={`${facility.capacityMW} MW`} color={Colors.accentPrimary} />
            <MetricCard label="CO₂ Impact" value={`${(metrics.co2Factor * metrics.currentOutputMW).toFixed(1)} t/h`} color={metrics.co2Factor > 0 ? Colors.accentRose : Colors.accentEmerald} />
          </View>

          {/* Weather */}
          <Text style={styles.sectionTitle}>Current Weather</Text>
          <View style={styles.weatherRow}>
            <WeatherGauge label="Wind" value={weather.windSpeed} max={25} unit="m/s" color={Colors.accentCyan} />
            <WeatherGauge label="Sun" value={Math.round(weather.sunshineIndex * 100)} max={100} unit="%" color={Colors.solar} />
            <WeatherGauge label="Rain" value={Math.round(weather.rainProbability * 100)} max={100} unit="%" color={Colors.hydro} />
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // Province summary mode
  if (province) {
    const pData = PROVINCE_DATA[province];
    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{pData?.nameEN ?? province}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{pData?.capital ?? ''} · Province</Text>
        <Text style={styles.tapHint}>Tap a facility pin for details</Text>
      </Animated.View>
    );
  }

  return null;
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function WeatherGauge({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={styles.gauge}>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <View style={styles.gaugeBarBg}>
        <View style={[styles.gaugeBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.gaugeValue, { color }]}>{value}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 24,
    maxHeight: 380,
    borderTopWidth: 1,
    borderColor: Colors.borderSubtle,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
    opacity: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginBottom: Spacing.lg, lineHeight: 20 },
  tapHint: { fontSize: FontSize.sm, color: Colors.textMuted, fontStyle: 'italic', marginTop: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  metricValue: { fontSize: FontSize.lg, fontWeight: '700' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
  weatherRow: { flexDirection: 'row', gap: Spacing.sm },
  gauge: { flex: 1 },
  gaugeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginBottom: 4 },
  gaugeBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  gaugeBarFill: { height: 4, borderRadius: 2 },
  gaugeValue: { fontSize: FontSize.xs, fontWeight: '700', marginTop: 4 },
});
