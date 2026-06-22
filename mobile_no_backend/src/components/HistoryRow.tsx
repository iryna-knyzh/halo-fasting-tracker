import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { FastSession } from '../types';
import { dur, timeStr, dateStr } from '../utils';
import { colors } from '../theme';

interface Props {
  session: FastSession;
  goalMs: number;
  onDelete: () => void;
}

// A history row with swipe-right-to-delete (red gradient action).
export function HistoryRow({ session, goalMs, onDelete }: Props) {
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
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, gap: 14 },
  deleteAction: { marginBottom: 8 },
  deleteGradient: { flex: 1, width: 104, borderRadius: 16, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
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
