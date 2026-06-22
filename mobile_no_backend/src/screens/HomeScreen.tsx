import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, Alert, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHalo } from '../store';
import { fmt, timeStr, getInitials } from '../utils';
import { HaloLogo } from '../components/HaloLogo';
import { ProgressRing } from '../components/ProgressRing';
import { HistoryRow } from '../components/HistoryRow';
import { RecentChart } from '../components/RecentChart';
import { colors } from '../theme';

const GOAL_HOURS = [13, 16, 18, 20];

export function HomeScreen() {
  const { name, goalHours, fast, history, setGoal, startFast, endFast, clearHistory } = useHalo();
  const [now, setNow] = useState(Date.now());
  const [menuOpen, setMenuOpen] = useState(false);
  const greetingOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Greeting fades out slowly after 3 seconds
  useEffect(() => {
    const anim = Animated.timing(greetingOpacity, {
      toValue: 0,
      duration: 1200,
      delay: 3000,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [greetingOpacity]);

  const goalMs = goalHours * 3.6e6;
  const idle = !fast;
  const elapsed = fast ? Math.max(0, now - fast.start) : 0;
  const progress = goalMs ? Math.min(1, elapsed / goalMs) : 0;
  const reached = elapsed >= goalMs;

  const count = history.length;
  const avg = count ? history.reduce((a, s) => a + s.duration, 0) / count / 3.6e6 : 0;
  const goalMet = history.filter((s) => s.duration >= goalMs).length;

  const confirmClear = () => {
    // Alert.alert is a no-op on react-native-web, so use the browser confirm there.
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || window.confirm('Clear all logged fasts? This cannot be undone.')) {
        clearHistory();
      }
      return;
    }
    Alert.alert('Clear history?', 'This removes all logged fasts. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          <Pressable style={styles.userPlate} onPress={() => setMenuOpen(true)}>
            <Text style={styles.userName} numberOfLines={1}>{name}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(name ?? '')}</Text>
            </View>
          </Pressable>
        </View>

        {/* greeting */}
        <Animated.Text style={[styles.greeting, { opacity: greetingOpacity }]}>Hi, {name} 👋</Animated.Text>

        {/* status */}
        <View style={styles.statusRow}>
          <View style={[styles.pill, idle ? styles.pillIdle : styles.pillFasting]}>
            <Text style={[styles.pillText, idle ? styles.pillTextIdle : styles.pillTextFasting]}>
              {idle ? 'Ready to fast' : 'Fasting now'}
            </Text>
          </View>
        </View>

        {/* ring with progress (fills as time goes, like the web app) */}
        <View style={styles.ring}>
          <ProgressRing size={230} progress={idle ? 0 : progress}>
            {idle ? (
              <Pressable style={styles.center} onPress={startFast}>
                <Text style={styles.startLabel}>Start</Text>
                <Text style={styles.startHint}>tap to begin</Text>
              </Pressable>
            ) : (
              <View style={styles.center}>
                <Text style={styles.elapsedLabel}>ELAPSED</Text>
                <Text style={styles.elapsedTime}>{fmt(elapsed)}</Text>
                <Text style={[styles.goalStatus, reached && styles.goalStatusReached]}>
                  {reached ? 'Goal reached' : `${Math.round(progress * 100)}% of ${goalHours}h`}
                </Text>
              </View>
            )}
          </ProgressRing>
        </View>

        {/* controls — hint line stays at the same height in both states */}
        <View style={styles.controls}>
          <Text style={styles.controlHint}>
            {idle ? 'Choose your fasting goal' : `Started at ${timeStr(fast!.start)}`}
          </Text>
          <View style={styles.controlAction}>
            {idle ? (
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
            ) : (
              <Pressable style={styles.endBtn} onPress={endFast}>
                <Text style={styles.endBtnText}>End fast</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* recent fasts chart (like the web) */}
        {count > 0 && (
          <View style={styles.chartWrap}>
            <RecentChart history={history} goalHours={goalHours} />
          </View>
        )}

        {/* history */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          {count > 0 && (
            <Pressable onPress={confirmClear} hitSlop={8}>
              <Text style={styles.clear}>Clear</Text>
            </Pressable>
          )}
        </View>
        {count === 0 ? (
          <Text style={styles.empty}>No fasts logged yet.{'\n'}Tap Start to begin your first one.</Text>
        ) : (
          history.map((s, i) => <HistoryRow key={s.start} session={s} goalMs={goalMs} index={i} />)
        )}

      </ScrollView>

      {/* account menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{getInitials(name ?? '')}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.menuName} numberOfLines={1}>{name}</Text>
                <Text style={styles.menuSub}>{count} fasts logged</Text>
              </View>
            </View>

            <View style={styles.menuStats}>
              <View style={styles.menuStat}>
                <Text style={styles.menuStatValue}>{count}</Text>
                <Text style={styles.menuStatLabel}>fasts</Text>
              </View>
              <View style={styles.menuStat}>
                <Text style={styles.menuStatValue}>{count ? avg.toFixed(1) : '0'}</Text>
                <Text style={styles.menuStatLabel}>avg hours</Text>
              </View>
              <View style={styles.menuStat}>
                <Text style={styles.menuStatValue}>{goalMet}</Text>
                <Text style={styles.menuStatLabel}>goal met</Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  flex: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  appName: { fontSize: 18, fontWeight: '700', color: colors.ink },
  tagline: { fontSize: 10, fontWeight: '500', color: colors.faint, letterSpacing: 0.4, marginTop: 2 },
  userPlate: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f6f3fc', borderRadius: 999, paddingLeft: 12, paddingRight: 5, paddingVertical: 4 },
  userName: { fontSize: 12.5, fontWeight: '600', color: colors.text, maxWidth: 90 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.surface, fontWeight: '700', fontSize: 12 },

  greeting: { fontSize: 22, fontWeight: '700', color: colors.ink, marginTop: 18 },

  statusRow: { alignItems: 'center', marginTop: 10, marginBottom: 6 },
  pill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999 },
  pillIdle: { backgroundColor: colors.surfaceSoft },
  pillFasting: { backgroundColor: '#fbeefb' },
  pillText: { fontSize: 12.5, fontWeight: '600' },
  pillTextIdle: { color: colors.muted },
  pillTextFasting: { color: '#a55a9c' },

  ring: { alignItems: 'center', marginVertical: 10 },
  center: { width: 184, height: 184, borderRadius: 92, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  startLabel: { fontSize: 34, fontWeight: '600', color: colors.inkSoft },
  startHint: { fontSize: 13, color: colors.faint, marginTop: 4 },
  elapsedLabel: { fontSize: 11, fontWeight: '600', color: colors.ghost, letterSpacing: 1.5, marginBottom: 4 },
  elapsedTime: { fontSize: 36, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  goalStatus: { fontSize: 12.5, fontWeight: '600', color: colors.faint, marginTop: 6, textAlign: 'center' },
  goalStatusReached: { color: colors.success },

  controls: { alignItems: 'center', marginTop: 18 },
  controlHint: { fontSize: 13, color: colors.faint, marginBottom: 12, height: 18 },
  controlAction: { minHeight: 44, justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 17, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.surface },
  endBtn: { paddingHorizontal: 44, paddingVertical: 15, borderRadius: 999, backgroundColor: colors.accent },
  endBtnText: { color: colors.surface, fontWeight: '700', fontSize: 16 },

  chartWrap: { marginTop: 28 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  clear: { fontSize: 13, fontWeight: '600', color: colors.ghost },
  empty: { textAlign: 'center', color: colors.ghost, fontSize: 13, lineHeight: 20, paddingVertical: 24 },

  backdrop: { flex: 1, backgroundColor: 'rgba(74,63,114,0.25)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  menu: { marginTop: 90, marginRight: 20, width: 240, backgroundColor: colors.surface, borderRadius: 18, padding: 10, shadowColor: '#7864c8', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 8, marginBottom: 4 },
  menuAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { color: colors.surface, fontWeight: '700', fontSize: 15 },
  menuName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  menuSub: { fontSize: 12, color: colors.faint, marginTop: 1 },
  menuStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surfaceRow, borderRadius: 12, paddingVertical: 10, marginHorizontal: 4, marginBottom: 6 },
  menuStat: { alignItems: 'center' },
  menuStatValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  menuStatLabel: { fontSize: 10, fontWeight: '600', color: colors.ghost, marginTop: 1 },
});
