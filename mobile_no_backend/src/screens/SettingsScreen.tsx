import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHalo } from '../store';
import { RootStackParamList } from '../types';
import { colors } from '../theme';

const GOAL_HOURS = [13, 16, 18, 20];

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { name, goalHours, setName, setGoal, clearHistory, resetAll } = useHalo();
  const [draft, setDraft] = useState(name ?? '');

  const saveName = () => {
    if (draft.trim()) setName(draft);
  };

  const confirmClear = () =>
    Alert.alert('Clear history?', 'This removes all logged fasts. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);

  const confirmReset = () =>
    Alert.alert('Reset everything?', 'This erases your name, goal and all fasts.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Your name</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Your name"
            placeholderTextColor={colors.ghost}
          />
          <Pressable
            style={[styles.saveBtn, draft.trim() === (name ?? '') && styles.saveBtnDisabled]}
            onPress={saveName}
            disabled={draft.trim() === (name ?? '')}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>Default goal</Text>
        <View style={styles.chips}>
          {GOAL_HOURS.map((h) => (
            <Pressable
              key={h}
              style={[styles.chip, h === goalHours && styles.chipActive]}
              onPress={() => setGoal(h)}
            >
              <Text style={[styles.chipText, h === goalHours && styles.chipTextActive]}>{h}h</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.danger}>
          <Pressable style={styles.dangerBtn} onPress={confirmClear}>
            <Text style={styles.dangerText}>Clear history</Text>
          </Pressable>
          <Pressable style={styles.dangerBtn} onPress={confirmReset}>
            <Text style={styles.dangerText}>Reset all data</Text>
          </Pressable>
        </View>

        <Text style={styles.note}>Halo keeps all data on this device only.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  back: { fontSize: 16, fontWeight: '600', color: colors.accent },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  headerSpacer: { width: 48 },
  body: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 8 },
  nameRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  saveBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: colors.surface, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.surface },
  danger: { marginTop: 36, gap: 10 },
  dangerBtn: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  dangerText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  note: { fontSize: 12, color: colors.ghost, textAlign: 'center', marginTop: 24 },
});
