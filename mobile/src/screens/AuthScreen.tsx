import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { api, ApiError, AuthResponse } from '../api';
import { AuthMode } from '../types';
import { colors } from '../theme';

interface Props {
  onAuthed: (res: AuthResponse) => void;
}

export function AuthScreen({ onAuthed }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    const e = email.trim();
    const n = name.trim();
    if (!e || !/.+@.+\..+/.test(e)) return setError('Enter a valid email');
    if (password.length < 4) return setError('Password must be at least 4 characters');
    if (isRegister && !n) return setError('Enter your name');

    setLoading(true);
    setError('');
    try {
      const res = isRegister
        ? await api.auth.register({ name: n, email: e, password })
        : await api.auth.login({ email: e, password });
      onAuthed(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* brand */}
            <View style={styles.brand}>
              <View style={styles.logo} />
              <Text style={styles.title}>{isRegister ? 'Create account' : 'Welcome back'}</Text>
              <Text style={styles.subtitle}>
                {isRegister ? 'Start your fasting journey' : 'Sign in to continue'}
              </Text>
            </View>

            {/* tabs */}
            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, !isRegister && styles.tabActive]}
                onPress={() => switchMode('login')}
              >
                <Text style={[styles.tabText, !isRegister && styles.tabTextActive]}>Sign in</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, isRegister && styles.tabActive]}
                onPress={() => switchMode('register')}
              >
                <Text style={[styles.tabText, isRegister && styles.tabTextActive]}>Register</Text>
              </Pressable>
            </View>

            {/* fields */}
            {isRegister && (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(t) => { setName(t); setError(''); }}
                  placeholder="Your name"
                  placeholderTextColor={colors.ghost}
                />
              </>
            )}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="you@email.com"
              placeholderTextColor={colors.ghost}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              placeholder="••••••••"
              placeholderTextColor={colors.ghost}
              secureTextEntry
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.submit, loading && styles.submitLoading]}
              onPress={submit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? '...' : isRegister ? 'Register' : 'Sign in'}
              </Text>
            </Pressable>

            <Pressable onPress={() => switchMode(isRegister ? 'login' : 'register')}>
              <Text style={styles.switch}>
                {isRegister ? 'Already have an account? ' : 'No account? '}
                <Text style={styles.switchLink}>{isRegister ? 'Sign in' : 'Register'}</Text>
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>Halo · your calm fasting tracker</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 26,
    shadowColor: '#7864c8',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  brand: { alignItems: 'center', marginBottom: 22 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lavender,
    marginBottom: 12,
  },
  title: { fontSize: 23, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.faint, marginTop: 3 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.faint },
  tabTextActive: { color: colors.inkSoft },
  label: { fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: colors.surfaceRow,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 13,
  },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitLoading: { opacity: 0.6 },
  submitText: { color: colors.surface, fontWeight: '700', fontSize: 16 },
  switch: { textAlign: 'center', color: colors.faint, fontSize: 13, marginTop: 18 },
  switchLink: { color: colors.accent, fontWeight: '700' },
  footer: { textAlign: 'center', color: colors.ghost, fontSize: 12, marginTop: 18 },
});
