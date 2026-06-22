import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHalo } from '../store';
import { FastSession, RootStackParamList } from '../types';
import { dur, timeStr, dateStr, wd } from '../utils';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

export function StatsScreen({ navigation }: Props) {
  const { goalHours, history, deleteSession } = useHalo();
  const goalMs = goalHours * 3.6e6;

  const count = history.length;
  const totalHours = history.reduce((a, s) => a + s.duration, 0) / 3.6e6;
  const avg = count ? totalHours / count : 0;
  const goalMet = history.filter((s) => s.duration >= goalMs).length;
  const longest = count ? Math.max(...history.map((s) => s.duration)) / 3.6e6 : 0;

  // recent 7 sessions for the chart (oldest → newest)
  const recent = history.slice(0, 7).slice().reverse();
  const maxDur = Math.max(goalMs, ...recent.map((s) => s.duration), 3.6e6);
  const scale = maxDur * 1.12;
  const goalLine = Math.min(130, Math.round((goalMs / scale) * 130));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* summary tiles */}
        <View style={styles.tiles}>
          <Tile value={String(count)} label="total fasts" />
          <Tile value={avg.toFixed(1)} label="avg hours" />
          <Tile value={String(goalMet)} label="goal met" />
          <Tile value={longest.toFixed(1)} label="longest (h)" />
          <Tile value={totalHours.toFixed(0)} label="total hours" />
          <Tile value={`${goalHours}h`} label="goal" />
        </View>

        {/* chart */}
        {recent.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent fasts</Text>
            <View style={styles.chart}>
              <View style={[styles.goalLine, { bottom: goalLine + 18 }]} />
              {recent.map((s, i) => {
                const h = Math.max(8, Math.round((s.duration / scale) * 130));
                const met = s.duration >= goalMs;
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barValue}>{(s.duration / 3.6e6).toFixed(1)}</Text>
                    <View style={[styles.bar, { height: h, backgroundColor: met ? colors.lavender : '#e4ddf4' }]} />
                    <Text style={styles.barDay}>{wd(s.end)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* full history */}
        <Text style={styles.sectionTitle}>History</Text>
        {count === 0 ? (
          <Text style={styles.empty}>No fasts logged yet.</Text>
        ) : (
          <>
            <Text style={styles.hint}>Swipe a record right to delete it.</Text>
            {history.map((s) => (
              <HistoryRow key={s.start} session={s} goalMs={goalMs} onDelete={() => deleteSession(s.start)} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function HistoryRow({
  session,
  goalMs,
  onDelete,
}: {
  session: FastSession;
  goalMs: number;
  onDelete: () => void;
}) {
  const met = session.duration >= goalMs;

  const renderLeftActions = () => (
    <Pressable onPress={onDelete} style={styles.deleteAction}>
      <LinearGradient
        colors={['#f4b0b0', '#d96a6a', '#c14d4d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.deleteGradient}
      >
        <Text style={styles.deleteIcon}>🗑</Text>
        <Text style={styles.deleteText}>Delete</Text>
      </LinearGradient>
    </Pressable>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false} friction={1.6}>
      <View style={styles.row}>
        <View style={styles.rowDotWrap}>
          <View style={[styles.rowDot, { backgroundColor: met ? colors.lavender : colors.ghost }]} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.rowDuration}>{dur(session.duration)}</Text>
          <Text style={styles.rowRange}>{timeStr(session.start)} → {timeStr(session.end)}</Text>
        </View>
        <View style={styles.rowMeta}>
          <Text style={styles.rowDate}>{dateStr(session.end)}</Text>
          <Text style={[styles.rowTag, { color: met ? colors.success : colors.muted }]}>
            {met ? 'goal met' : 'short'}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  back: { fontSize: 16, fontWeight: '600', color: colors.accent },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  headerSpacer: { width: 48 },
  body: { padding: 20, paddingBottom: 40 },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  tileValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  tileLabel: { fontSize: 11, fontWeight: '600', color: colors.ghost, marginTop: 3, textAlign: 'center' },

  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginTop: 18 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 14 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 170, position: 'relative' },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderColor: '#cdbef0', borderStyle: 'dashed' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 10, fontWeight: '600', color: colors.ghost, marginBottom: 4 },
  bar: { width: 22, borderRadius: 6 },
  barDay: { fontSize: 11, fontWeight: '600', color: colors.faint, marginTop: 6 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 26, marginBottom: 12 },
  empty: { textAlign: 'center', color: colors.ghost, fontSize: 13, paddingVertical: 20 },
  hint: { fontSize: 11.5, color: colors.ghost, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, gap: 14 },
  deleteAction: { marginBottom: 8 },
  deleteGradient: {
    flex: 1,
    width: 104,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { fontSize: 20 },
  deleteText: { color: colors.surface, fontWeight: '700', fontSize: 13, marginTop: 2 },
  rowDotWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surfaceRow, alignItems: 'center', justifyContent: 'center' },
  rowDot: { width: 11, height: 11, borderRadius: 6 },
  rowDuration: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowRange: { fontSize: 12, color: colors.faint, marginTop: 2 },
  rowMeta: { alignItems: 'flex-end' },
  rowDate: { fontSize: 12.5, fontWeight: '600', color: colors.muted },
  rowTag: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
