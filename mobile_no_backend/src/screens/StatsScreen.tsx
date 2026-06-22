import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHalo } from '../store';
import { RootStackParamList } from '../types';
import { RecentChart } from '../components/RecentChart';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

export function StatsScreen({ navigation }: Props) {
  const { goalHours, history } = useHalo();
  const goalMs = goalHours * 3.6e6;

  const count = history.length;
  const totalHours = history.reduce((a, s) => a + s.duration, 0) / 3.6e6;
  const avg = count ? totalHours / count : 0;
  const goalMet = history.filter((s) => s.duration >= goalMs).length;
  const longest = count ? Math.max(...history.map((s) => s.duration)) / 3.6e6 : 0;

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
        <View style={styles.chartWrap}>
          <RecentChart history={history} goalHours={goalHours} />
        </View>

        {count === 0 && <Text style={styles.empty}>No fasts logged yet.</Text>}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  back: { fontSize: 16, fontWeight: '600', color: colors.accent },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  headerSpacer: { width: 48 },
  body: { padding: 20, paddingBottom: 40 },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  tileValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  tileLabel: { fontSize: 11, fontWeight: '600', color: colors.ghost, marginTop: 3, textAlign: 'center' },

  chartWrap: { marginTop: 18 },
  empty: { textAlign: 'center', color: colors.ghost, fontSize: 13, paddingVertical: 20 },
});
