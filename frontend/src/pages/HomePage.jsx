import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trees,
  Building2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle,
  Star,
  Sparkles,
  Layers
} from 'lucide-react';
import SearchFilterBar from '../components/listings/SearchFilterBar';
import ListingCard from '../components/listings/ListingCard';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import translations from '../context/translations';

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    category: 'all',
    location: '',
    min_price: '',
    max_price: '',
    status: 'available',
  });
  const navigate = useNavigate();
  const { language } = useSettings();
  const t = translations[language];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.getListings({ featured_only: true });
        setFeaturedListings(data.slice(0, 6));
      } catch (err) {
        console.error('Error fetching featured listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleHeroSearch = () => {
    const query = new URLSearchParams();
    if (searchFilters.category && searchFilters.category !== 'all') {
      query.append('category', searchFilters.category);
    }
    if (searchFilters.location) query.append('location', searchFilters.location);
    if (searchFilters.min_price) query.append('min_price', searchFilters.min_price);
    if (searchFilters.max_price) query.append('max_price', searchFilters.max_price);
    if (searchFilters.status && searchFilters.status !== 'all') {
      query.append('status', searchFilters.status);
    }
    navigate(`/listings?${query.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-[#1a2744] dark:bg-[#0d1520] text-white transition-colors duration-300">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80"
            alt="Scenic Land and Architecture"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744] via-[#1a2744]/80 to-transparent dark:from-[#0d1520] dark:via-[#0d1520]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2744] via-[#1a2744]/90 to-transparent dark:from-[#0d1520] dark:via-[#0d1520]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.nextGenMarketplace}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t.heroHeading1} <span className="text-yellow-400">{t.heroHeading2}</span> {t.heroHeading3} <span className="text-sky-300">{t.heroHeading4}</span>.
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              {t.heroDesc}
            </p>
          </div>

          {/* Search Filter Bar */}
          <div className="mt-10 max-w-5xl">
            <SearchFilterBar
              filters={searchFilters}
              onChange={setSearchFilters}
              onSearch={handleHeroSearch}
              showStatusFilter={false}
            />
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10 max-w-4xl text-slate-300">
            <div>
              <p className="text-3xl font-extrabold text-white tracking-tight">$45M+</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 mt-0.5">Listed Asset Value</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-yellow-400 tracking-tight">1,200+</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 mt-0.5">Total Acres Available</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-sky-400 tracking-tight">100%</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 mt-0.5">Direct Verified Sellers</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-400 tracking-tight">4.9 / 5</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 mt-0.5">Investor Trust Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
            Specialized Asset Classes
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            Engineered for Land &amp; Building Transactions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Tailored specifications, zoning records, and media for both vacant ground and completed structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Land Card */}
          <div className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80"
                alt="Land and Acreage"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-yellow-500 text-slate-900 shadow">
                  {t.landParcels}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold">Land &amp; Development Parcels</h3>
                <p className="text-xs text-slate-200 mt-1">Agricultural ranches, residential lots, commercial acreage</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600 shrink-0" /><span>Verified Acreage &amp; Boundaries</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600 shrink-0" /><span>Zoning classification &amp; utilities status</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600 shrink-0" /><span>Direct contact with property landowners</span></li>
              </ul>
              <Link to="/listings?category=land" className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 font-bold rounded-xl text-sm transition">
                <span>Browse {t.landParcels}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Building Card */}
          <div className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
                alt="Buildings and Homes"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-sky-600 text-white shadow">
                  {t.buildingsHomes}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold">Buildings &amp; Modern Estates</h3>
                <p className="text-xs text-slate-200 mt-1">Luxury single-family homes, penthouses, commercial offices</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /><span>Accurate square footage &amp; architectural specs</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /><span>Bedrooms, bathrooms &amp; floor plan layouts</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sky-600 shrink-0" /><span>High-resolution walkthrough photography</span></li>
              </ul>
              <Link to="/listings?category=building" className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-800 dark:text-sky-400 font-bold rounded-xl text-sm transition">
                <span>Explore {t.buildingsHomes}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
              {t.handpickedPortfolio}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{t.featuredListings}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t.featuredDesc}</p>
          </div>
          <Link to="/listings" className="inline-flex items-center gap-1.5 text-sm font-bold text-yellow-700 dark:text-yellow-400 hover:underline">
            <span>{t.viewAllProperties}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-slate-100 dark:bg-slate-900 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Seamless Transactions For Every Role</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              A unified platform with tailored workflows for Buyers, Sellers, and Platform Admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buyer */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Buyers &amp; Investors</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Filter by acreage, square footage, price range, and location. Save favorites and submit binding or non-binding purchase offers directly to verified owners.
              </p>
              <Link to="/listings" className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 dark:text-yellow-400">
                {t.allListings} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Seller */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Property Sellers</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Create comprehensive listings with media galleries, zoning information, and acreage. Manage availability status and review incoming buyer inquiries.
              </p>
              <Link to="/seller-dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                {t.sellerHub} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Admin */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Administrators</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Real-time visibility into platform metrics, listing moderation, featuring quality listings, and granting role permissions across buyers and sellers.
              </p>
              <Link to="/admin-dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-400">
                {t.adminCenter} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
