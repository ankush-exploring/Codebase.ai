import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Alert } from '../components/ui';

const hasGoogleAuth = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      try {
        await googleLogin(response.credential);
        navigate('/dashboard');
      } catch {
        setError('Google sign-in failed');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-clay-sm">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="font-semibold text-clay dark:text-white text-xl">codebase<span className="gradient-text">.ai</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-clay dark:text-white">Welcome back</h1>
          <p className="text-clay-secondary dark:text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <div className="clay-card p-6 shadow-clay-sm">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {hasGoogleAuth && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-clay dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-clay-surface dark:bg-slate-800 px-3 text-clay-muted dark:text-slate-400">or continue with</span>
                </div>
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed')}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                />
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <span className="text-clay-secondary dark:text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
