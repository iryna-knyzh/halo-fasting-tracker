import { View, Text, StyleSheet } from 'react-native';
import { FastSession } from '../types';
import { dur, timeStr, dateStr } from '../utils';
import { colors } from '../theme';

interface Props {
  session: FastSession;
  goalMs: number;
}

export function HistoryRow({ session, goalMs }: Props) {
  const met = session.duration >= goalMs;

  return (
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
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, gap: 14 },
  rowDotWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surfaceRow, alignItems: 'center', justifyContent: 'center' },
  rowDot: { width: 11, height: 11, borderRadius: 6 },
  rowDuration: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowRange: { fontSize: 12, color: colors.faint, marginTop: 2 },
  rowMeta: { alignItems: 'flex-end' },
  rowDate: { fontSize: 12.5, fontWeight: '600', color: colors.muted },
  rowTag: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
