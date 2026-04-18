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

// Hardkodowane dane przykładowe dla profilu zużycia/produkcji
const MOCK_ENERGY_PROFILE = {
  meterUpdateDate: '18.04.2026, 14:00',
  dailyConsumption: 14.2, // kWh
  ownProduction: 8.5, // kWh (np. z paneli fotowoltaicznych)
  predictedTomorrow: 16.0, // kWh
  weatherImpact: 'Wzrost o 12% – nadchodzi ochłodzenie i zachmurzenie (spadek produkcji solarnej).',
  // 24-godzinny wykres zużycia (np. co godzinę od 00:00 do 23:00)
  hourlyChart: [
    1.2, 1.0, 0.9, 0.8, 1.0, 1.5, 3.2, 4.5, // 00:00 - 07:00
    3.0, 2.5, 2.0, 2.2, 2.5, 2.4, 2.1, 2.8, // 08:00 - 15:00
    4.0, 5.5, 7.2, 6.8, 5.0, 3.5, 2.0, 1.5  // 16:00 - 23:00
  ]
};

export default function DetailSheet({ visible, facility, province, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 500,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  }, [visible]);

  if (!visible && !facility && !province) return null;

  // Widok szczegółów konkretnego obiektu (np. Dom, Farma Wiatrowa)
  if (facility) {
    const config = FACILITY_TYPE_CONFIG[facility.type] || { color: '#00bcd4', label: 'Inne' };
    const weather = getCurrentWeather();
    const metrics = computeFacilityMetrics(facility, weather, ENERGY_FACILITIES);
    
    // Maksymalna wartość do skalowania wykresu słupkowego
    const maxChartValue = Math.max(...MOCK_ENERGY_PROFILE.hourlyChart);

    return (
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[styles.typeBadge, { backgroundColor: config.color + '25' }]}>
              <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{facility.name}</Text>
          <Text style={styles.meterDate}>Ostatnia aktualizacja licznika: {MOCK_ENERGY_PROFILE.meterUpdateDate}</Text>

          {/* Statystyki Dzienne (Zużycie / Produkcja) */}
          <View style={styles.metricsGrid}>
            <MetricCard 
              label="Zużycie (Dziś)" 
              value={`${MOCK_ENERGY_PROFILE.dailyConsumption} kWh`} 
              color={Colors.accentRose} 
            />
            {/* Pokazujemy produkcję głównie dla domów z panelami lub farm */}
            <MetricCard 
              label="Produkcja własna" 
              value={`${MOCK_ENERGY_PROFILE.ownProduction} kWh`} 
              color={Colors.accentEmerald} 
            />
            <MetricCard 
              label="Prognoza (Jutro)" 
              value={`${MOCK_ENERGY_PROFILE.predictedTomorrow} kWh`} 
              color={Colors.accentAmber} 
            />
          </View>

          {/* Analiza AI / Pogodowa */}
          <View style={styles.aiPredictionBox}>
            <View style={styles.aiPredictionHeader}>
              <Ionicons name="sparkles" size={14} color={Colors.accentCyan} />
              <Text style={styles.aiPredictionTitle}>Prąduś AI Przewiduje</Text>
            </View>
            <Text style={styles.aiPredictionText}>{MOCK_ENERGY_PROFILE.weatherImpact}</Text>
          </View>

          {/* Wykres Dzienny */}
          <Text style={styles.sectionTitle}>Zużycie w ciągu doby (24h)</Text>
          <View style={styles.chartContainer}>
            {MOCK_ENERGY_PROFILE.hourlyChart.map((value, index) => {
              const heightPercentage = (value / maxChartValue) * 100;
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { height: `${heightPercentage}%`, backgroundColor: config.color }]} />
                  </View>
                  {/* Pokazuj etykietę co 4 godziny dla przejrzystości */}
                  {index % 4 === 0 ? (
                    <Text style={styles.barLabel}>{index}</Text>
                  ) : (
                    <Text style={styles.barLabel}> </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Pogoda (Oryginalna sekcja) */}
          <Text style={styles.sectionTitle}>Obecna Pogoda</Text>
          <View style={styles.weatherRow}>
            <WeatherGauge label="Wiatr" value={weather.windSpeed} max={25} unit="m/s" color={Colors.accentCyan} />
            <WeatherGauge label="Słońce" value={Math.round(weather.sunshineIndex * 100)} max={100} unit="%" color={Colors.solar} />
            <WeatherGauge label="Deszcz" value={Math.round(weather.rainProbability * 100)} max={100} unit="%" color={Colors.hydro} />
          </View>
          
        </ScrollView>
      </Animated.View>
    );
  }

  // Widok województwa
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
        <Text style={styles.subtitle}>{pData?.capital ?? ''} · Województwo</Text>
        <Text style={styles.tapHint}>Dotknij pinezki, aby zobaczyć szczegóły zużycia</Text>
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
    maxHeight: 550, // Zwiększono, by pomieścić wykres
    borderTopWidth: 1,
    borderColor: Colors.borderSubtle,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  scrollContent: {
    paddingBottom: 32,
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
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginBottom: Spacing.sm, lineHeight: 20 },
  meterDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.lg },
  tapHint: { fontSize: FontSize.sm, color: Colors.textMuted, fontStyle: 'italic', marginTop: Spacing.md },
  
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xl,
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
  
  aiPredictionBox: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  aiPredictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiPredictionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accentCyan },
  aiPredictionText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  /* Sekcja Wykresu */
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: Spacing.sm,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    width: '3.5%', 
  },
  barBackground: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 6,
  },

  weatherRow: { flexDirection: 'row', gap: Spacing.sm },
  gauge: { flex: 1 },
  gaugeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginBottom: 4 },
  gaugeBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  gaugeBarFill: { height: 4, borderRadius: 2 },
  gaugeValue: { fontSize: FontSize.xs, fontWeight: '700', marginTop: 4 },
});