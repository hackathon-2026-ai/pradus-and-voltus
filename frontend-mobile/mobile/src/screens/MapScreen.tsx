import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { Marker, Polygon, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, DARK_MAP_STYLE } from '../theme';
import { ENERGY_FACILITIES, FACILITY_TYPE_CONFIG, type EnergyFacility, type FacilityType } from '../data/energyFacilities';
import { PROVINCE_DATA } from '../data/provinceData';
import DetailSheet from '../components/DetailSheet';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// 1. Dodajemy hardkodowane domy na Śląsku
const HARDCODED_HOUSES: EnergyFacility[] = [
  { id: 'house_zabrze', name: 'Dom Zabrze', type: 'house', lat: 50.3086, lng: 18.7822, capacityMW: 0, province: 'śląskie', weatherSensitivity: {wind: 40, sun: 23, rain: 80} },
  { id: 'house_katowice', name: 'Dom Katowice', type: 'house', lat: 50.2649, lng: 19.0238, capacityMW: 0, province: 'śląskie', weatherSensitivity: {wind: 24, sun: 89, rain: 12} },
  { id: 'house_gliwice', name: 'Dom Gliwice', type: 'house', lat: 50.2976, lng: 18.6766, capacityMW: 0, province: 'śląskie', weatherSensitivity: {wind: 78, sun: 56, rain: 8} },
];

const PROVINCE_CENTERS: Record<string, { lat: number; lng: number }> = {
  'dolnośląskie': { lat: 51.0, lng: 16.3 },
  'kujawsko-pomorskie': { lat: 53.0, lng: 18.5 },
  'lubelskie': { lat: 51.3, lng: 22.6 },
  'lubuskie': { lat: 52.1, lng: 15.2 },
  'łódzkie': { lat: 51.7, lng: 19.5 },
  'małopolskie': { lat: 49.9, lng: 20.1 },
  'mazowieckie': { lat: 52.2, lng: 20.8 },
  'opolskie': { lat: 50.6, lng: 17.8 },
  'podkarpackie': { lat: 49.8, lng: 22.2 },
  'podlaskie': { lat: 53.5, lng: 23.0 },
  'pomorskie': { lat: 54.3, lng: 18.2 },
  'śląskie': { lat: 50.2, lng: 19.1 },
  'świętokrzyskie': { lat: 50.7, lng: 20.7 },
  'warmińsko-mazurskie': { lat: 53.9, lng: 20.7 },
  'wielkopolskie': { lat: 52.1, lng: 17.3 },
  'zachodniopomorskie': { lat: 53.8, lng: 15.4 },
};

function getFacilityIcon(type: FacilityType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'wind': return 'leaf-outline';
    case 'solar': return 'sunny-outline';
    case 'coal': return 'flame-outline';
    case 'hydro': return 'water-outline';
    case 'storage': return 'battery-charging-outline';
    case 'biomass': return 'flower-outline';
    case 'house': return 'home-outline';
    default: return 'location-outline';
  }
}

function thinByDistance(facilities: EnergyFacility[], minDist: number): EnergyFacility[] {
  const sorted = [...facilities].sort((a, b) => {
    const aReal = a.id.startsWith('g') ? 0 : 1;
    const bReal = b.id.startsWith('g') ? 0 : 1;
    if (aReal !== bReal) return bReal - aReal;
    return b.capacityMW - a.capacityMW;
  });
  const kept: EnergyFacility[] = [];
  for (const f of sorted) {
    if (!kept.some(k => Math.abs(k.lat - f.lat) < minDist && Math.abs(k.lng - f.lng) < minDist)) {
      kept.push(f);
    }
  }
  return kept;
}

const POLAND_REGION: Region = {
  latitude: 51.9,
  longitude: 19.1,
  latitudeDelta: 7,
  longitudeDelta: 7,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedFacility, setSelectedFacility] = useState<EnergyFacility | null>(null);
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const isProvinceView = !activeProvince;
  
  // 2. Dołączamy hardkodowane domy do wyświetlanych obiektów
  let visibleFacilities = isProvinceView
    ? thinByDistance(ENERGY_FACILITIES, 0.45)
    : ENERGY_FACILITIES.filter(f => f.province === activeProvince);

  // Dodajemy domy niezależnie od thinByDistance. 
  // Pokażą się na mapie ogólnej i po wejściu w woj. śląskie.
  // visibleFacilities = [
  //   ...visibleFacilities,
  //   ...HARDCODED_HOUSES.filter(h => isProvinceView || activeProvince === h.province)
  // ];

  visibleFacilities = HARDCODED_HOUSES; 

  const handleFacilityPress = useCallback((facility: EnergyFacility) => {
    setSelectedFacility(facility);
    setSheetVisible(true);
  }, []);

  const handleMapPress = useCallback(() => {
    if (selectedFacility) {
      setSelectedFacility(null);
      setSheetVisible(false);
    } else if (activeProvince) {
      setActiveProvince(null);
      mapRef.current?.animateToRegion(POLAND_REGION, 600);
    }
  }, [selectedFacility, activeProvince]);

  const handleProvincePress = useCallback((provinceName: string) => {
    const center = PROVINCE_CENTERS[provinceName];
    if (!center) return;
    setActiveProvince(provinceName);
    setSelectedFacility(null);
    mapRef.current?.animateToRegion({
      latitude: center.lat,
      longitude: center.lng,
      latitudeDelta: 2,
      longitudeDelta: 2,
    }, 600);

    const pData = PROVINCE_DATA[provinceName];
    if (pData) {
      setSheetVisible(true);
    }
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedFacility(null);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgPrimary} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PolMap Energy</Text>
          <Text style={styles.headerSub}>
            {activeProvince ? PROVINCE_DATA[activeProvince]?.nameEN ?? activeProvince : 'Interactive Map'}
          </Text>
        </View>
        {activeProvince && (
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            setActiveProvince(null);
            setSheetVisible(false);
            setSelectedFacility(null);
            mapRef.current?.animateToRegion(POLAND_REGION, 600);
          }}>
            <Ionicons name="arrow-back" size={18} color={Colors.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={POLAND_REGION}
        onPress={handleMapPress}
        mapPadding={{ top: 0, right: 0, bottom: sheetVisible ? 280 : 0, left: 0 }}
      >
        {visibleFacilities.map(facility => {
          // Zabezpieczenie na wypadek, gdyby typ hardkodowanego domu nie miał wpisu w configu
          const config = FACILITY_TYPE_CONFIG[facility.type] || { color: '#00bcd4', label: 'Inne' };
          const isSelected = selectedFacility?.id === facility.id;
          
          return (
            <Marker
              key={facility.id}
              coordinate={{ latitude: facility.lat, longitude: facility.lng }}
              onPress={() => handleFacilityPress(facility)}
              // tracksViewChanges={false}
            >
              <View style={[
                styles.pin,
                { backgroundColor: config.color, borderColor: isSelected ? '#fff' : '#ddd' },
                isSelected && styles.pinSelected,
              ]}>
                <Ionicons name={getFacilityIcon(facility.type)} size={16} color="#fff" />
              </View>
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{facility.name}</Text>
                  <Text style={styles.calloutSub}>
                    {config.label}{facility.capacityMW > 0 ? ` · ${facility.capacityMW} MW` : ''}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.legend}>
        {(['wind', 'solar', 'coal', 'hydro', 'storage', 'biomass', 'house'] as FacilityType[]).map(t => {
          const config = FACILITY_TYPE_CONFIG[t];
          if (!config) return null;
          return (
            <View key={t} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: config.color }]} />
              <Text style={styles.legendLabel}>{config.label}</Text>
            </View>
          );
        })}
      </View>

      <DetailSheet
        visible={sheetVisible}
        facility={selectedFacility}
        province={activeProvince}
        onClose={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    paddingTop: 48,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgGlass,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  backText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  map: { flex: 1 },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pinSelected: {
    transform: [{ scale: 1.3 }],
    borderColor: '#fff',
    borderWidth: 2,
  },
  callout: {
    backgroundColor: 'rgba(10, 14, 26, 0.92)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    minWidth: 150,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  calloutTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  calloutSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    backgroundColor: 'rgba(10, 14, 26, 0.88)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: SCREEN_W * 0.6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
});