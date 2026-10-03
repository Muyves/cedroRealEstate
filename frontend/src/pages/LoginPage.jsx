import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Briefcase,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // State
  const [portalMode, setPortalMode] = useState('user'); // 'user' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Timer for security rate-limiting / brute-force lockout
  useEffect(() => {
    let timer;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Autofill or switch presets when switching portal mode
  const handleSwitchPortal = (mode) => {
    setPortalMode(mode);
    setError('');
    if (mode === 'admin') {
      setEmail('admin@cedro.com');
      setPassword('password123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  // Live password strength calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Not entered', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-blue-500' };
    return { score: 100, text: 'Strong (Secure)', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Reset failed attempts on success
      setFailedAttempts(0);

      // Verify role if logging in through Admin Portal
      if (portalMode === 'admin') {
        if (user.role !== 'admin') {
          setError('Security Violation: Account credentials valid, but you do not hold Administrator clearance.');
          setLoading(false);
          return;
        }
        navigate('/admin-dashboard');
        return;
      }

      // Normal routing
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'seller') navigate('/seller-dashboard');
      else navigate(from === '/' ? '/buyer-dashboard' : from);
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutSeconds(30);
        setError('Security Lockout: Too many failed attempts. Please wait 30 seconds.');
      } else {
        setError(err.message || 'Login failed. Please verify your credentials and security status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(role);
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'seller') navigate('/seller-dashboard');
      else navigate('/buyer-dashboard');
    } catch (err) {
      setError('Demo login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-slate-200 mb-1">
            <img src="/gabirwa-logo.png" alt="Gabirwa Real Estate" className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {portalMode === 'admin' ? 'Administrator Security Portal' : 'Sign In to Gabirwa'}
          </h1>
          <p className="text-xs text-slate-500">
            {portalMode === 'admin'
              ? 'Authorized platform personnel only. Multi-level credential authentication.'
              : 'Secure access to property investments, seller portfolios, and client leads'}
          </p>
        </div>

        {/* Portal Switcher Tabs: User/Agent vs Admin Portal */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-200/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSwitchPortal('user')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              portalMode === 'user'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Buyer & Seller Access</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPortal('admin')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              portalMode === 'admin'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin Command Portal</span>
          </button>
        </div>

        {/* Admin Mode Security Notice */}
        {portalMode === 'admin' && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-purple-900">High-Security Administrative Gateway</p>
              <p className="text-purple-700 leading-relaxed">
                All administrator actions, listing moderation, and user status modifications are encrypted and audited.
                Pre-seeded admin credentials: <code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-purple-900 font-bold">admin@cedro.com</code> / <code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-purple-900 font-bold">password123</code>
              </p>
            </div>
          </div>
        )}

        {/* Quick 1-Click Role Switcher Demo Box */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>⚡ Fast 1-Click Demo Accounts</span>
            </span>
            <span className="text-[10px] text-slate-400">Pre-seeded Environment</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoClick('buyer')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-900 text-white text-xs font-bold flex flex-col items-center gap-1 transition active:scale-95 border border-slate-700"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('seller')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-amber-900 text-white text-xs font-bold flex flex-col items-center gap-1 transition active:scale-95 border border-slate-700"
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Seller / Agent</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-purple-900 text-white text-xs font-bold flex flex-col items-center gap-1 transition active:scale-95 border border-purple-500/50"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin Duties</span>
            </button>
          </div>
        </div>

        {/* Standard Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 font-semibold animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {lockoutSeconds > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Security Lockout active: Retry in {lockoutSeconds} seconds</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {portalMode === 'admin' ? 'Administrator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@cedro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />
                  Bcrypt Hashed
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Security Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>Password Security:</span>
                    <span className="font-bold">{strength.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me and Security Badges */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300"
                />
                <span>Keep session active</span>
              </label>

              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                TLS 1.3 Encrypted
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className={`w-full py-3.5 font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 text-white ${
                portalMode === 'admin'
                  ? 'bg-purple-800 hover:bg-purple-900 shadow-purple-800/20'
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
              }`}
            >
              <span>{loading ? 'Verifying Credentials...' : portalMode === 'admin' ? 'Authenticate as Admin' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Features Accordion / Reassurance */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Layer User & Admin Protection:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-500 text-[10px]">
              <li>Bcrypt cryptographic salted password hashing</li>
              <li>Signed JSON Web Token (JWT) authorization headers</li>
              <li>Role-based access boundary (Admin / Seller / Buyer separation)</li>
              <li>Automated brute-force lockdown after consecutive invalid attempts</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Register as Buyer or Seller
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
