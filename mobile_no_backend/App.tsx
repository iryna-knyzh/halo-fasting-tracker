import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HaloProvider, useHalo } from './src/store';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { colors } from './src/theme';

function Root() {
  const { ready, name } = useHalo();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // No name yet → onboarding (ask the user's name, stored locally)
  if (!name) {
    return <OnboardingScreen />;
  }

  return <HomeScreen />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <HaloProvider>
          <Root />
          <StatusBar style="dark" />
        </HaloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
