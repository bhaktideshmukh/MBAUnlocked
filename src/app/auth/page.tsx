'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import styles from './auth.module.css';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction, registerAction } from './actions';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/colleges';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = isLogin ? await loginAction(formData) : await registerAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className={styles.authCard}>
      <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
      <p>
        {isLogin ? 'Enter your details to sign in.' : 'Join MBAUnlocked to save profiles and experiences.'}
      </p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {!isLogin && (
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" name="name" className="input-field" placeholder="John Doe" required={!isLogin} />
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <input type="email" name="email" className="input-field" placeholder="you@example.com" required />
        </div>
        <div className={styles.formGroup}>
          <label>Password</label>
          <input type="password" name="password" className="input-field" placeholder="••••••••" required />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')} <ArrowRight size={18} />
        </button>
      </form>

      <div className={styles.toggle}>
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className={styles.toggleBtn}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div className={styles.authCard}>Loading...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
