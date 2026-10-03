import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Trees, Building2, Bed, Bath, Maximize2, Heart } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function ListingCard({ listing, onFavoriteToggle }) {
  const { isAuthenticated } = useAuth();
  const [favorited, setFavorited] = useState(listing.is_favorited || false);
  const [toggling, setToggling] = useState(false);

  const mainImage =
    listing.media_urls && listing.media_urls.length > 0
      ? listing.media_urls[0]
      : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

  const formatCurrency = (val) => {
    const usd = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
    const frw = new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(val * 1350);
    return `${usd} / ${frw}`;
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to save favorite properties.');
      return;
    }
    setToggling(true);
    try {
      const res = await api.toggleFavorite(listing.id);
      setFavorited(res.favorited);
      if (onFavoriteToggle) {
        onFavoriteToggle(listing.id, res.favorited);
      }
    } catch (err) {
      console.error('Error saving favorite:', err);
    } finally {
      setToggling(false);
    }
  };

  const isLand = listing.category === 'land';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <CategoryBadge category={listing.category} />
          <button
            onClick={handleFavoriteClick}
            disabled={toggling}
            aria-label="Favorite listing"
            className={`p-2 rounded-full backdrop-blur-md transition ${
              favorited
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom overlay: Status & Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-200 font-medium block">
              {listing.property_type ? listing.property_type.replace('_', ' ') : listing.category}
            </span>
            <p className="text-2xl font-extrabold text-white tracking-tight drop-shadow">
              {formatCurrency(listing.price)}
            </p>
          </div>
          <StatusBadge status={listing.status} className="bg-white/95 backdrop-blur-md shadow" />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition line-clamp-1 mb-2">
            <Link to={`/listings/${listing.id}`}>
              {listing.title}
            </Link>
          </h3>

          {/* Description summary */}
          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-4">
            {listing.description}
          </p>
        </div>

        {/* Specs bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
          {/* Size / Acreage */}
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-800">
              {listing.size_value.toLocaleString()} {listing.size_unit}
            </span>
          </div>

          {/* Additional details depending on Land vs Building */}
          {isLand ? (
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
              <Trees className="w-3.5 h-3.5" />
              <span>Development Parcel</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {listing.bedrooms !== null && (
                <div className="flex items-center gap-1" title={`${listing.bedrooms} Bedrooms`}>
                  <Bed className="w-4 h-4 text-slate-400" />
                  <span>{listing.bedrooms} Beds</span>
                </div>
              )}
              {listing.bathrooms !== null && (
                <div className="flex items-center gap-1" title={`${listing.bathrooms} Bathrooms`}>
                  <Bath className="w-4 h-4 text-slate-400" />
                  <span>{listing.bathrooms} Baths</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
