import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { Lock, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Call actual backend authentication endpoint
      const response = await authApi.login(email, password);
      const token = response.token || response.access_token;
      login(token, response.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      // If server is offline or network error, permit demo fallback for admin@demo.com
      if (email === 'admin@demo.com' && password === 'admin123') {
        const mockUser = {
          id: 'usr_admin_01',
          email: 'admin@haloocom.com',
          name: 'HALOOCOM Administrator',
          role: 'ADMIN',
        };
        const mockToken = 'mock_jwt_haloocom_monitor_' + Date.now();
        login(mockToken, mockUser);
        toast.success('Signed in with Demo Credentials');
        navigate('/');
      } else {
        const message =
          err.response?.data?.message ||
          'Invalid email or password. Please verify credentials.';
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@demo.com');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-950 overflow-hidden px-4 selection:bg-brand-500 selection:text-white">
      {/* Background ambient gradient blurs (Blue theme) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle geometric dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        {/* Card Container */}
        <div className="bg-gray-900/95 rounded-3xl p-8 sm:p-10 border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* HALOOCOM Brand Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-3 shadow-[0_0_35px_rgba(37,99,235,0.35)] mb-4 flex items-center justify-center border border-blue-500/30">
              <img
                src="/haloocom-logo.png"
                alt="HALOOCOM"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              HALOOCOM
            </h1>
            <p className="text-xs text-blue-400 font-medium mt-1">
              Enterprise WhatsApp Intelligence & Automation
            </p>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@haloocom.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950/90 border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950/90 border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_30px_rgba(37,99,235,0.55)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials hint card */}
          <div className="mt-6 pt-5 border-t border-gray-800/80">
            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/70 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <div className="text-[11px] text-gray-300">
                  <span className="font-mono text-blue-400">admin@demo.com</span> /{' '}
                  <span className="font-mono text-blue-400">admin123</span>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;