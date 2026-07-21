import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Alert } from '../components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-clay dark:bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-[#007acc] to-[#4fc3f7] rounded-xl flex items-center justify-center shadow-clay-sm">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l-6-6 6-6" />
                <path d="M15 6l6 6-6 6" />
              </svg>
            </div>
            <span className="font-semibold text-clay dark:text-[#cccccc] text-lg">codebase<span className="gradient-text">.ai</span></span>
          </Link>
          <h1 className="text-xl font-bold text-clay dark:text-[#cccccc]">Welcome back</h1>
          <p className="text-sm text-clay-secondary dark:text-[#969696] mt-1">Sign in to your account</p>
        </div>

        <div className="clay-card p-5 shadow-clay-sm">
          {error && (
            <Alert variant="error" className="mb-3">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
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

          <div className="mt-4 text-center">
            <span className="text-clay-secondary dark:text-[#969696] text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#007acc] hover:text-[#006bb3]">
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
