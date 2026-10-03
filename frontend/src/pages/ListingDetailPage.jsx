import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Share2,
  Heart,
  ShieldCheck,
  Send,
  Phone,
  Mail,
  Calendar,
  Layers,
  Trees,
  Building2,
  CheckCircle2,
  FileText,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import InquiryModal from '../components/listings/InquiryModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.getListing(id);
        setListing(data);
        setFavorited(data.is_favorited || false);
      } catch (err) {
        console.error('Error fetching listing details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in or use a demo account to save favorites.');
      return;
    }
    try {
      const res = await api.toggleFavorite(listing.id);
      setFavorited(res.favorited);
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
        <p className="text-slate-500 text-sm mt-4">Loading property details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-slate-600">The property you requested does not exist or has been removed.</p>
        <Link to="/listings" className="inline-block px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const mediaList = listing.media_urls && listing.media_urls.length > 0
    ? listing.media_urls.map(u => api.formatMediaUrl(u))
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'];

  const formatCurrency = (val) => {
    const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const frw = new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(val * 1350);
    return `${usd} / ${frw}`;
  };

  const isLand = listing.category === 'land';

  // Calculate price per unit
  const pricePerUnit =
    listing.size_value > 0 ? Math.round(listing.price / listing.size_value) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFavoriteToggle}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              favorited
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            <span>{favorited ? 'Saved Property' : 'Save to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Price Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={listing.category} />
            <StatusBadge status={listing.status} />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {listing.property_type?.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {listing.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{listing.address ? `${listing.address}, ` : ''}{listing.location}</span>
          </div>
        </div>

        <div className="md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Asking Price</span>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-800">
              {formatCurrency(listing.price)}
            </p>
            {pricePerUnit && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {formatCurrency(pricePerUnit)} / {listing.size_unit === 'acres' ? 'acre' : 'sq ft'}
              </p>
            )}
          </div>

          <button
            onClick={() => setInquiryModalOpen(true)}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/25 flex items-center gap-2 transition hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
            <span>Make Inquiry / Offer</span>
          </button>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="space-y-4">
        {/* Active Hero Image */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-950 shadow-lg">
          <img
            src={mediaList[activeImageIndex]}
            alt={`${listing.title} - View ${activeImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold">
            Photo {activeImageIndex + 1} of {mediaList.length}
          </div>
        </div>

        {/* Thumbnail Selector */}
        {mediaList.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {mediaList.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden border-2 shrink-0 transition ${
                  activeImageIndex === idx ? 'border-emerald-600 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Details Layout (Grid with Main Specs & Seller Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Specs, Description, Features */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Specs Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Property Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acreage / Size</span>
                <p className="text-lg font-extrabold text-slate-900 mt-1">
                  {listing.size_value.toLocaleString()} {listing.size_unit}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classification</span>
                <p className="text-lg font-extrabold text-slate-900 mt-1 capitalize">
                  {listing.category}
                </p>
              </div>

              {isLand ? (
                <>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topography</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">Scenic / Build Ready</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1 capitalize">{listing.status}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bedrooms</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {listing.bedrooms !== null ? `${listing.bedrooms} Beds` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bathrooms</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {listing.bathrooms !== null ? `${listing.bathrooms} Baths` : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Overview & Property Details
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Features and Highlights */}
          {listing.features && listing.features.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                Key Features & Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-800 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Legal Documents & Floor Plans */}
          {listing.documents && listing.documents.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-700" />
                  <span>Verified Legal Documents & Blueprints</span>
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
                  {listing.documents.length} Available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={api.formatMediaUrl(doc.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 group-hover:scale-105 transition">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-900">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {doc.doc_label || doc.doc_category || 'Official Document'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-purple-700 text-xs font-bold shrink-0 ml-2">
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Seller Card & Direct Offer CTA */}
        <div className="space-y-6">
          {/* Seller / Representative Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Listing Representative</span>
            </div>

            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <img
                src={listing.seller?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'}
                alt={listing.seller?.full_name || 'Seller'}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-900">{listing.seller?.full_name || 'Property Owner'}</h4>
                <p className="text-xs text-slate-500 capitalize">{listing.seller?.role || 'Seller'} • Gabirwa Partner</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{listing.seller?.email || 'info@gabirwarealestate.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{listing.seller?.phone || '+1 (555) 019-2831'}</span>
              </div>
            </div>

            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow transition"
            >
              <Send className="w-4 h-4" />
              <span>Contact Seller / Submit Offer</span>
            </button>
          </div>

          {/* Location Summary */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-3">
            <h4 className="font-bold text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Location Profile</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Located in <strong>{listing.location}</strong>. Fully recorded parcel under jurisdiction zoning regulations with public infrastructure access.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
              <span>MLS Ref ID: #CED-{listing.id.toString().padStart(5, '0')}</span>
              <span className="text-emerald-400 font-semibold">Title Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry & Offer Modal */}
      <InquiryModal
        listing={listing}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </div>
  );
}
