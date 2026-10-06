import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Headphones } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import translations from '../../context/translations';
import { SocialMediaLinks, IconWhatsapp } from '../common/SocialIcons';
import logoImg from '../../assets/gabirwa-logo.png';

export default function Footer() {
  const { language } = useSettings();
  const t = translations[language] || translations.en;

  return (
    <footer className="bg-[#1a2744] dark:bg-[#0d1520] text-slate-400 pt-16 pb-12 border-t border-[#243050] dark:border-[#1a2744] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand Col & Social Media Network Links */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center">
              <div className="p-1 sm:p-1.5 rounded-xl bg-white shadow-sm inline-flex items-center justify-center">
                <img src={logoImg} alt="Gabirwa Real Estate" className="h-12 sm:h-14 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">{t.footerDesc}</p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-yellow-500" /> {t.verifiedListings}
              </span>
              <span>•</span>
              <span>{t.directInquiries}</span>
              <span>•</span>
              <span>{t.escrowReady}</span>
            </div>

            {/* Social Network Section */}
            <div className="pt-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                {language === 'rw' ? 'Mumenyeshe Kuri Social Networks:' : 'Connect On Social Networks:'}
              </h5>
              <SocialMediaLinks variant="compact" />
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">{t.properties}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/listings" className="hover:text-white transition flex items-center gap-1">{t.allListings} <ArrowUpRight className="w-3 h-3 text-slate-600" /></Link></li>
              <li><Link to="/listings?category=land" className="hover:text-yellow-400 transition flex items-center gap-1">{t.landAcreage} <ArrowUpRight className="w-3 h-3 text-slate-600" /></Link></li>
              <li><Link to="/listings?category=building" className="hover:text-sky-400 transition flex items-center gap-1">{t.buildingsEstates} <ArrowUpRight className="w-3 h-3 text-slate-600" /></Link></li>
              <li><Link to="/listings?status=available" className="hover:text-white transition flex items-center gap-1">{t.availableNow} <ArrowUpRight className="w-3 h-3 text-slate-600" /></Link></li>
              <li><Link to="/listings?sort_by=newest" className="hover:text-white transition flex items-center gap-1">{t.recentlyAdded} <ArrowUpRight className="w-3 h-3 text-slate-600" /></Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">{t.marketplaceRoles}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/buyer-dashboard" className="hover:text-white transition">{t.buyerDashboard}</Link></li>
              <li><Link to="/seller-dashboard" className="hover:text-white transition">{t.sellerHub}</Link></li>
              <li><Link to="/create-listing" className="hover:text-white transition">{t.listLandBuilding}</Link></li>
              <li><Link to="/admin-dashboard" className="hover:text-white transition">{t.adminCenter}</Link></li>
              <li><Link to="/support" className="hover:text-yellow-400 font-semibold transition flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-yellow-400" />
                <span>{t.contactSupport}</span>
              </Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">{t.contactSupport}</h4>
            <ul className="space-y-3 text-sm mb-4">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <span>Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-yellow-500 shrink-0" />
                <a href="tel:+250782024578" className="hover:text-white transition">+250 782 024 578</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-yellow-500 shrink-0" />
                <a href="mailto:info@gabirwarealestate.com" className="hover:text-white transition">info@gabirwarealestate.com</a>
              </li>
            </ul>

            {/* Direct WhatsApp Callout Button */}
            <a
              href="https://wa.me/250782024578?text=Hello%20Gabirwa%20Real%20Estate"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
            >
              <IconWhatsapp className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#243050] dark:border-[#1a2744] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Gabirwa Real Estate. {t.allRightsReserved}</p>
          <div className="flex items-center gap-6">
            <Link to="/support" className="hover:text-slate-400">{t.contactSupport}</Link>
            <span className="hover:text-slate-400 cursor-pointer">{t.privacyPolicy}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t.termsOfService}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t.mlsCompliance}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
