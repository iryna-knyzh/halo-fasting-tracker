import { View, Text, StyleSheet } from 'react-native';
import { FastSession } from '../types';
import { wd } from '../utils';
import { colors } from '../theme';

interface Props {
  history: FastSession[];
  goalHours: number;
}

// "Recent fasts" bar chart (last 7 sessions) with a goal line — like the web app.
export function RecentChart({ history, goalHours }: Props) {
  const goalMs = goalHours * 3.6e6;
  const recent = history.slice(0, 7).slice().reverse();
  if (recent.length === 0) return null;

  const maxDur = Math.max(goalMs, ...recent.map((s) => s.duration), 3.6e6);
  const scale = maxDur * 1.12;
  const goalLine = Math.min(130, Math.round((goalMs / scale) * 130));

  return (
    <View style={styles.card}>
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
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 170, position: 'relative' },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderColor: '#cdbef0', borderStyle: 'dashed' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 10, fontWeight: '600', color: colors.ghost, marginBottom: 4 },
  bar: { width: 22, borderRadius: 6 },
  barDay: { fontSize: 11, fontWeight: '600', color: colors.faint, marginTop: 6 },
});
