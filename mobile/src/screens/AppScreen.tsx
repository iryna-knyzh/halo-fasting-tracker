import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { User, FastSession, ActiveFast } from '../types';
import { fmt, dur, timeStr, dateStr, getInitials } from '../utils';
import { colors } from '../theme';
import { HaloLogo } from '../components/HaloLogo';

const GOAL_HOURS = [13, 16, 18, 20];

interface Props {
  user: User;
  history: FastSession[];
  fast: ActiveFast | null;
  goalHours: number;
  now: number;
  onLogout: () => void;
  onStart: () => void;
  onEnd: () => void;
  onClear: () => void;
  onSetGoal: (h: number) => void;
}

export function AppScreen({
  user, history, fast, goalHours, now,
  onLogout, onStart, onEnd, onClear, onSetGoal,
}: Props) {
  const goalMs = goalHours * 3.6e6;
  const idle = !fast;
  const elapsed = fast ? Math.max(0, now - fast.start) : 0;
  const progress = goalMs ? Math.min(1, elapsed / goalMs) : 0;
  const reached = elapsed >= goalMs;

  const count = history.length;
  const avg = count ? history.reduce((a, s) => a + s.duration, 0) / count / 3.6e6 : 0;
  const goalMet = history.filter((s) => s.duration >= goalMs).length;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <HaloLogo size={30} />
            <View>
              <Text style={styles.appName}>Halo</Text>
              <Text style={styles.tagline}>FASTING TRACKER</Text>
            </View>
          </View>
          <Pressable style={styles.avatarBtn} onPress={() => setMenuOpen(true)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name, user.email)}</Text>
            </View>
          </Pressable>
        </View>

        {/* status */}
        <View style={styles.statusRow}>
          <View style={[styles.pill, idle ? styles.pillIdle : styles.pillFasting]}>
            <Text style={[styles.pillText, idle ? styles.pillTextIdle : styles.pillTextFasting]}>
              {idle ? 'Ready to fast' : 'Fasting now'}
            </Text>
          </View>
        </View>

        {/* timer / start — circle stays in place in both states */}
        <View style={styles.ring}>
          <Pressable style={styles.ringCircle} onPress={idle ? onStart : undefined} disabled={!idle}>
            {idle ? (
              <>
                <Text style={styles.startLabel}>Start</Text>
                <Text style={styles.startHint}>tap to begin</Text>
              </>
            ) : (
              <>
                <Text style={styles.elapsedLabel}>ELAPSED</Text>
                <Text style={styles.elapsedTime}>{fmt(elapsed)}</Text>
                <Text style={[styles.goalStatus, reached && styles.goalStatusReached]}>
                  {reached ? 'Goal reached' : `${Math.round(progress * 100)}% of ${goalHours}h`}
                </Text>
              </>
            )}
          </Pressable>
          {!idle && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>

        {/* controls */}
        {idle ? (
          <View style={styles.controls}>
            <Text style={styles.controlHint}>Choose your fasting goal</Text>
            <View style={styles.chips}>
              {GOAL_HOURS.map((h) => (
                <Pressable
                  key={h}
                  style={[styles.chip, h === goalHours && styles.chipActive]}
                  onPress={() => onSetGoal(h)}
                >
                  <Text style={[styles.chipText, h === goalHours && styles.chipTextActive]}>{h}h</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.controls}>
            <Text style={styles.controlHint}>Started at {timeStr(fast!.start)}</Text>
            <Pressable style={styles.endBtn} onPress={onEnd}>
              <Text style={styles.endBtnText}>End fast</Text>
            </Pressable>
          </View>
        )}

        {/* stats */}
        {count > 0 && (
          <View style={styles.stats}>
            <Stat value={String(count)} label="fasts" />
            <Stat value={avg.toFixed(1)} label="avg hours" />
            <Stat value={String(history.filter((s) => s.duration >= goalMs).length)} label="goal met" />
          </View>
        )}

        {/* history */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          {count > 0 && (
            <Pressable onPress={onClear}>
              <Text style={styles.clear}>Clear</Text>
            </Pressable>
          )}
        </View>

        {count === 0 ? (
          <Text style={styles.empty}>No fasts logged yet.{'\n'}Tap Start to begin your first one.</Text>
        ) : (
          history.map((s, i) => {
            const met = s.duration >= goalMs;
            return (
              <View key={s.id ?? i} style={styles.row}>
                <View style={styles.rowDotWrap}>
                  <View style={[styles.rowDot, { backgroundColor: met ? colors.lavender : colors.ghost }]} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.rowDuration}>{dur(s.duration)}</Text>
                  <Text style={styles.rowRange}>{timeStr(s.start)} → {timeStr(s.end)}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowDate}>{dateStr(s.end)}</Text>
                  <Text style={[styles.rowTag, { color: met ? colors.success : colors.muted }]}>
                    {met ? 'goal met' : 'short'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* account menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{getInitials(user.name, user.email)}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.menuName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.menuEmail} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.menuStats}>
              <Stat value={String(count)} label="fasts" />
              <Stat value={count ? avg.toFixed(1) : '0'} label="avg hours" />
              <Stat value={String(goalMet)} label="goal met" />
            </View>

            <Pressable
              style={styles.signOut}
              onPress={() => { setMenuOpen(false); onLogout(); }}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) + 20,
  },
  flex: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  appName: { fontSize: 18, fontWeight: '700', color: colors.ink },
  tagline: { fontSize: 10, fontWeight: '500', color: colors.faint, letterSpacing: 0.4, marginTop: 2 },
  avatarBtn: {},
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.surface, fontWeight: '700', fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: 'rgba(74,63,114,0.25)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  menu: {
    marginTop: 90,
    marginRight: 20,
    width: 250,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 10,
    shadowColor: '#7864c8',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 8 },
  menuAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { color: colors.surface, fontWeight: '700', fontSize: 15 },
  menuName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  menuEmail: { fontSize: 12, color: colors.faint, marginTop: 1 },
  menuStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surfaceRow, borderRadius: 12, paddingVertical: 10, marginVertical: 8 },
  signOut: { paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  signOutText: { color: '#b07a9e', fontWeight: '700', fontSize: 14 },

  statusRow: { alignItems: 'center', marginBottom: 14 },
  pill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999 },
  pillIdle: { backgroundColor: colors.surfaceSoft },
  pillFasting: { backgroundColor: '#fbeefb' },
  pillText: { fontSize: 12.5, fontWeight: '600' },
  pillTextIdle: { color: colors.muted },
  pillTextFasting: { color: '#a55a9c' },

  ring: { alignItems: 'center', marginVertical: 10 },
  ringCircle: {
    width: 220, height: 220, borderRadius: 110, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16,
    shadowColor: '#9682dc', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5,
  },
  startLabel: { fontSize: 34, fontWeight: '600', color: colors.inkSoft },
  startHint: { fontSize: 13, color: colors.faint, marginTop: 4 },
  elapsedLabel: { fontSize: 11, fontWeight: '600', color: colors.ghost, letterSpacing: 1.5, marginBottom: 4 },
  elapsedTime: { fontSize: 36, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  goalStatus: { fontSize: 12.5, fontWeight: '600', color: colors.faint, marginTop: 6, textAlign: 'center' },
  goalStatusReached: { color: colors.success },
  progressTrack: { width: '80%', height: 8, borderRadius: 4, backgroundColor: colors.surfaceSoft, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },

  controls: { alignItems: 'center', marginTop: 18 },
  controlHint: { fontSize: 13, color: colors.faint, marginBottom: 12 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 17, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surfaceSoft },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 14, fontWeight: '600', color: '#7a6fa6' },
  chipTextActive: { color: colors.surface },
  endBtn: { paddingHorizontal: 44, paddingVertical: 15, borderRadius: 999, backgroundColor: colors.accent },
  endBtnText: { color: colors.surface, fontWeight: '700', fontSize: 16 },

  stats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 14, marginTop: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.ghost, marginTop: 2 },

  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  clear: { fontSize: 12, fontWeight: '600', color: colors.ghost },
  empty: { textAlign: 'center', color: colors.ghost, fontSize: 13, lineHeight: 20, paddingVertical: 24 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, gap: 14 },
  rowDotWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surfaceRow, alignItems: 'center', justifyContent: 'center' },
  rowDot: { width: 11, height: 11, borderRadius: 6 },
  rowDuration: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowRange: { fontSize: 12, color: colors.faint, marginTop: 2 },
  rowMeta: { alignItems: 'flex-end' },
  rowDate: { fontSize: 12.5, fontWeight: '600', color: colors.muted },
  rowTag: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
