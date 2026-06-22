import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  size?: number;
}

// The Halo mark: a gradient ring with a white center.
export function HaloLogo({ size = 56 }: Props) {
  const ring = Math.round(size * 0.22);
  return (
    <LinearGradient
      colors={['#ffd6ff', '#c8b6ff', '#bbd0ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size - ring * 2,
            height: size - ring * 2,
            borderRadius: (size - ring * 2) / 2,
          },
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150,130,220,0.35)',
  },
});
