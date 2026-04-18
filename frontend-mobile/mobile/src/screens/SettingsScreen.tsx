import React from 'react';
import { View, Text, StyleSheet, StatusBar, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../theme';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgPrimary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Preferences</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={20} color={Colors.accentPrimary} />
            <Text style={styles.rowLabel}>Dark Mode</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.accentPrimary }} />
        </View>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={Colors.accentAmber} />
            <Text style={styles.rowLabel}>Push Notifications</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.accentAmber }} />
        </View>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
            <Text style={styles.rowLabel}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>
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
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowLabel: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  versionText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
