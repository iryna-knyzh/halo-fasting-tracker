import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHalo } from '../store';
import { HaloLogo } from '../components/HaloLogo';
import { colors } from '../theme';

export function OnboardingScreen() {
  const { setName } = useHalo();
  const [value, setValue] = useState('');

  const submit = () => {
    if (value.trim()) setName(value);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <HaloLogo size={72} />
          <Text style={styles.title}>Welcome to Halo</Text>
          <Text style={styles.subtitle}>Your calm fasting tracker.{'\n'}What should we call you?</Text>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Your name"
            placeholderTextColor={colors.ghost}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Pressable style={[styles.button, !value.trim() && styles.buttonDisabled]} onPress={submit} disabled={!value.trim()}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>

          <Text style={styles.note}>Everything stays on your device.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginTop: 20 },
  subtitle: { fontSize: 14, color: colors.faint, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    marginTop: 28,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.surface, fontWeight: '700', fontSize: 16 },
  note: { fontSize: 12, color: colors.ghost, marginTop: 18 },
});
