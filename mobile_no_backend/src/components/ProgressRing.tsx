import { ReactNode, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  children?: ReactNode;
}

// Progress ring like the web app: a track + a gradient arc that smoothly
// fills toward the goal. We animate an Animated.Value and feed the numeric
// strokeDashoffset to a plain Circle — this works on both native and web
// (animating SVG props directly via AnimatedCircle breaks on react-native-web).
export function ProgressRing({ size = 230, strokeWidth = 18, progress, children }: Props) {
  const center = size / 2;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const innerSize = size - strokeWidth * 2 - 10;

  const clamped = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(clamped)).current;
  const [offset, setOffset] = useState(() => c * (1 - clamped));

  useEffect(() => {
    const id = anim.addListener(({ value }) => setOffset(c * (1 - value)));
    return () => anim.removeListener(id);
  }, [anim, c]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [clamped, anim]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="haloRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#e7c6ff" />
            <Stop offset="0.5" stopColor="#c8b6ff" />
            <Stop offset="1" stopColor="#bbd0ff" />
          </LinearGradient>
        </Defs>
        <Circle cx={center} cy={center} r={r} stroke="#efeaf7" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke="url(#haloRing)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* white inner disc */}
      <View style={[styles.inner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]} />

      {/* centered content */}
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    position: 'absolute',
    backgroundColor: colors.surface,
    shadowColor: '#9682dc',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
