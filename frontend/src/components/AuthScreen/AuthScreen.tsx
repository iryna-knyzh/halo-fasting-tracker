'use client';

import { useState } from 'react';
import type { AuthMode } from '@/types/fast.types';
import { apiClient, ApiError, type AuthResponse } from '@/lib/api-client';
import styles from './AuthScreen.module.scss';

interface AuthScreenProps {
  onLogin: (response: AuthResponse) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const updateForm = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setError('');
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
  };

  const submit = async () => {
    const email = form.email.trim();
    const name = form.name.trim();
    const pass = form.password;
    if (!email || !/.+@.+\..+/.test(email)) { setError('Enter a valid email'); return; }
    if (pass.length < 4) { setError('Password must be at least 4 characters'); return; }
    if (isRegister && !name) { setError('Enter your name'); return; }

    setLoading(true);
    setError('');
    try {
      const response = isRegister
        ? await apiClient.auth.register({ name, email, password: pass })
        : await apiClient.auth.login({ email, password: pass });
      onLogin(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>

        {/* brand */}
        <div className={styles.brand}>
          <div className={styles.logo} />
          <div className={styles.brandText}>
            <div className={styles.title}>
              {isRegister ? 'Create account' : 'Welcome back'}
            </div>
            <div className={styles.subtitle}>
              {isRegister ? 'Start your fasting journey' : 'Sign in to continue'}
            </div>
          </div>
        </div>

        {/* tab toggle */}
        <div className={styles.tabs}>
          <div
            role="button"
            onClick={() => switchMode('login')}
            className={`${styles.tab} ${!isRegister ? styles.tabActive : ''}`}
          >
            Sign in
          </div>
          <div
            role="button"
            onClick={() => switchMode('register')}
            className={`${styles.tab} ${isRegister ? styles.tabActive : ''}`}
          >
            Register
          </div>
        </div>

        {/* fields */}
        <div className={styles.fields}>
          {isRegister && (
            <div>
              <div className={styles.label}>Name</div>
              <input
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
                placeholder="Your name"
                className={styles.input}
              />
            </div>
          )}
          <div>
            <div className={styles.label}>Email</div>
            <input
              type="email"
              value={form.email}
              onChange={e => updateForm('email', e.target.value)}
              placeholder="you@email.com"
              className={styles.input}
            />
          </div>
          <div>
            <div className={styles.label}>Password</div>
            <input
              type="password"
              value={form.password}
              onChange={e => updateForm('password', e.target.value)}
              placeholder="••••••••"
              className={styles.input}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div
          role="button"
          onClick={loading ? undefined : submit}
          className={`${styles.submit} ${loading ? styles.submitLoading : ''}`}
        >
          {loading ? '...' : isRegister ? 'Register' : 'Sign in'}
        </div>

        <div className={styles.switch}>
          {isRegister ? 'Already have an account?' : 'No account?'}{' '}
          <span
            role="button"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            className={styles.switchLink}
          >
            {isRegister ? 'Sign in' : 'Register'}
          </span>
        </div>
      </div>
      <div className={styles.footer}>
        Halo · your calm fasting tracker
      </div>
    </div>
  );
}
