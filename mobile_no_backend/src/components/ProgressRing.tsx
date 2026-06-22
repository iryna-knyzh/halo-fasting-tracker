import { ReactNode, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  children?: ReactNode;
}

// Progress ring like the web app: a track + a gradient arc that smoothly
// fills toward the goal as time passes.
export function ProgressRing({ size = 230, strokeWidth = 18, progress, children }: Props) {
  const center = size / 2;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const innerSize = size - strokeWidth * 2 - 10;

  const clamped = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false, // strokeDashoffset is not natively drivable
    }).start();
  }, [clamped, anim]);

  const dashoffset = anim.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });

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
        <AnimatedCircle
          cx={center}
          cy={center}
          r={r}
          stroke="url(#haloRing)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={dashoffset}
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
