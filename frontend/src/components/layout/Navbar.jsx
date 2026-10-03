import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import translations from '../../context/translations';
import {
  Trees,
  Building2,
  Compass,
  PlusCircle,
  LogOut,
  ShieldAlert,
  Briefcase,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  AlignRight,
  AlignLeft,
  Languages,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, demoLogin } = useAuth();
  const { darkMode, rtl, language, toggleDark, toggleRtl, toggleLang } = useSettings();
  const t = translations[language];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoSwitch = async (targetRole) => {
    try {
      await demoLogin(targetRole);
      setMobileMenuOpen(false);
      if (targetRole === 'admin') navigate('/admin-dashboard');
      else if (targetRole === 'seller') navigate('/seller-dashboard');
      else navigate('/buyer-dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">

      {/* Top micro bar */}
      <div className="bg-[#1a2744] dark:bg-[#0f1929] text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-[#243050]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">GABIRWA REAL ESTATE</span>
          <span className="hidden md:inline text-slate-400">| {t.companyTagline}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          {/* Settings toggles */}
          <div className="flex items-center gap-1">
            {/* Dark mode */}
            <button
              onClick={toggleDark}
              title={darkMode ? t.lightMode : t.darkMode}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            {/* RTL */}
            <button
              onClick={toggleRtl}
              title={rtl ? t.ltrMode : t.rtlMode}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {rtl ? <AlignLeft className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
            </button>
            {/* Language */}
            <button
              onClick={toggleLang}
              title={t.language}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px] font-bold"
            >
              <Languages className="w-3 h-3" />
              {language === 'en' ? 'RW' : 'EN'}
            </button>
          </div>

          {/* Demo role switcher */}
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{t.switchDemoRole}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDemoSwitch('buyer')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                user?.role === 'buyer'
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {language === 'rw' ? 'Umuguzi' : 'Buyer'}
            </button>
            <button
              onClick={() => handleDemoSwitch('seller')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                user?.role === 'seller'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {language === 'rw' ? 'Umucuruzi' : 'Seller'}
            </button>
            <button
              onClick={() => handleDemoSwitch('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                user?.role === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/gabirwa-logo.png"
              alt="Gabirwa Real Estate"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform dark:brightness-90"
            />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/listings" end className={navLinkClass}>
              <Compass className="w-4 h-4" />
              <span>{t.allListings}</span>
            </NavLink>
            <NavLink to="/listings?category=land" className={navLinkClass}>
              <Trees className="w-4 h-4 text-yellow-600" />
              <span>{t.landParcels}</span>
            </NavLink>
            <NavLink to="/listings?category=building" className={navLinkClass}>
              <Building2 className="w-4 h-4 text-[#1a2744] dark:text-slate-300" />
              <span>{t.buildingsHomes}</span>
            </NavLink>
          </nav>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t.adminCenter}</span>
                  </Link>
                )}
                {role === 'seller' && (
                  <Link
                    to="/seller-dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{t.sellerHub}</span>
                  </Link>
                )}
                {role === 'buyer' && (
                  <Link
                    to="/buyer-dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{t.mySavedOffers}</span>
                  </Link>
                )}
                {(role === 'seller' || role === 'admin') && (
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-900 hover:bg-[#243050] dark:hover:bg-yellow-400 shadow-sm transition hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t.listProperty}</span>
                  </Link>
                )}
                {/* User capsule */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.full_name}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {role}
                    </span>
                  </div>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <button onClick={logout} title={t.signOut} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  {t.signIn}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-900 hover:bg-[#243050] dark:hover:bg-yellow-400 rounded-lg shadow-sm transition">
                  {t.createAccount}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick toggles for mobile */}
            <button onClick={toggleDark} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={toggleLang} className="px-2 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {language === 'en' ? 'RW' : 'EN'}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <NavLink to="/listings" end onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
            <Compass className="w-4 h-4" /> {t.allListings}
          </NavLink>
          <NavLink to="/listings?category=land" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
            <Trees className="w-4 h-4 text-yellow-600" /> {t.landParcels}
          </NavLink>
          <NavLink to="/listings?category=building" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
            <Building2 className="w-4 h-4" /> {t.buildingsHomes}
          </NavLink>

          {/* Mobile RTL toggle */}
          <button onClick={toggleRtl} className="flex items-center gap-2 py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium w-full">
            {rtl ? <AlignLeft className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
            {rtl ? t.ltrMode : t.rtlMode}
          </button>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="px-3 py-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t.signedInAs} <strong className="text-slate-700 dark:text-slate-200">{user.full_name}</strong></span>
                <span className="capitalize font-bold text-yellow-700 dark:text-yellow-400">{role}</span>
              </div>
              {role === 'admin' && (
                <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                  {t.adminCenter}
                </Link>
              )}
              {role === 'seller' && (
                <Link to="/seller-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-semibold">
                  {t.sellerHub}
                </Link>
              )}
              {role === 'buyer' && (
                <Link to="/buyer-dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold">
                  {t.mySavedOffers}
                </Link>
              )}
              {(role === 'seller' || role === 'admin') && (
                <Link to="/create-listing" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-900 font-semibold text-center">
                  {t.postNewProperty}
                </Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-medium">
                {t.signOut}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold">
                {t.signIn}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-900 rounded-lg font-semibold">
                {t.createAccount}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
