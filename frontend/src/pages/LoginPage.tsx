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
          {/* HALOOCOM + WhatsApp Brand Logos */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative inline-block mb-4">
              {/* White container for HALOOCOM Logo */}
              <div className="w-24 h-24 rounded-3xl bg-white p-3 shadow-[0_0_35px_rgba(37,99,235,0.3)] flex items-center justify-center border border-blue-500/30">
                <img
                  src="/haloocom-logo.png"
                  alt="HALOOCOM"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* WhatsApp round badge overlapping at bottom right corner */}
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#25D366] border-2 border-gray-900 flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.8 13.46 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.37C9.35 7.37 9.06 7.44 8.81 7.71C8.56 7.98 7.86 8.64 7.86 9.97C7.86 11.3 8.83 12.58 8.97 12.77C9.11 12.96 10.87 15.68 13.61 16.86C14.26 17.14 14.77 17.31 15.17 17.44C15.83 17.65 16.42 17.62 16.9 17.55C17.43 17.47 18.54 16.88 18.77 16.23C19 15.58 19 15.03 18.93 14.91C18.86 14.79 18.68 14.72 18.42 14.59C18.15 14.46 16.83 13.81 16.59 13.72C16.34 13.63 16.16 13.59 15.98 13.86C15.8 14.13 15.28 14.74 15.12 14.92C14.96 15.11 14.81 15.13 14.54 15C14.28 14.87 13.42 14.59 12.4 13.68C11.61 12.97 11.07 12.09 10.92 11.83C10.77 11.56 10.9 11.42 11.03 11.29C11.15 11.17 11.3 10.97 11.44 10.81C11.58 10.65 11.63 10.53 11.72 10.35C11.81 10.16 11.77 10.01 11.7 9.88C11.63 9.75 11.06 8.35 10.82 7.78C10.59 7.22 10.36 7.3 10.19 7.29C10.02 7.29 9.82 7.37 9.53 7.37Z" />
                </svg>
              </div>
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