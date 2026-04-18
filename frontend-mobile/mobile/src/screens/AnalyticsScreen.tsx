import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { ENERGY_FACILITIES, FACILITY_TYPE_CONFIG, type FacilityType } from '../data/energyFacilities';

export default function AnalyticsScreen() {
  // Aggregate stats
  const totalCapacity = ENERGY_FACILITIES.reduce((sum, f) => sum + f.capacityMW, 0);
  const byType: Record<string, { count: number; capacity: number }> = {};
  ENERGY_FACILITIES.forEach(f => {
    if (!byType[f.type]) byType[f.type] = { count: 0, capacity: 0 };
    byType[f.type].count++;
    byType[f.type].capacity += f.capacityMW;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgPrimary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Energy Overview</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Total */}
        <View style={styles.totalCard}>
          <Ionicons name="flash" size={28} color={Colors.accentCyan} />
          <Text style={styles.totalValue}>{Math.round(totalCapacity).toLocaleString()} MW</Text>
          <Text style={styles.totalLabel}>Total Installed Capacity</Text>
          <Text style={styles.totalSub}>{ENERGY_FACILITIES.length} facilities tracked</Text>
        </View>

        {/* By type */}
        <Text style={styles.sectionTitle}>By Facility Type</Text>
        {(Object.keys(byType) as FacilityType[]).map(type => {
          const config = FACILITY_TYPE_CONFIG[type];
          const data = byType[type];
          const pct = Math.round((data.capacity / totalCapacity) * 100);
          return (
            <View key={type} style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: config.color }]} />
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>{config.label}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: config.color }]} />
                </View>
              </View>
              <View style={styles.typeStats}>
                <Text style={styles.typeValue}>{data.count}</Text>
                <Text style={styles.typeLabel}>{Math.round(data.capacity)} MW</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    paddingTop: 48, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  content: { padding: Spacing.xl },
  totalCard: {
    backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.borderSubtle,
    borderRadius: Radius.lg, padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.xl,
  },
  totalValue: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  totalLabel: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 2 },
  totalSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md, backgroundColor: Colors.bgGlass, borderRadius: Radius.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderSubtle },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  typeInfo: { flex: 1 },
  typeName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  barBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  typeStats: { alignItems: 'flex-end' },
  typeValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  typeLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
});
