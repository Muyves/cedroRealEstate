import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Trees, Building2, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function SearchFilterBar({
  filters,
  onChange,
  onReset,
  onSearch,
  compact = false,
  showStatusFilter = true
}) {
  const [localLocation, setLocalLocation] = useState(filters.location || '');

  const handleCategoryClick = (cat) => {
    onChange({ ...filters, category: cat });
  };

  const handleLocationSubmit = (e) => {
    if (e.key === 'Enter') {
      onChange({ ...filters, location: localLocation });
      if (onSearch) onSearch();
    }
  };

  const handleLocationBlur = () => {
    onChange({ ...filters, location: localLocation });
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl border border-slate-200/80 ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      {/* Category Tabs: All, Land, Building */}
      <div className="flex items-center gap-2 pb-5 mb-5 border-b border-slate-100 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleCategoryClick('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0 ${
            filters.category === 'all' || !filters.category
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Zose (All Properties)</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategoryClick('land')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0 ${
            filters.category === 'land'
              ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <Trees className="w-4 h-4" />
          <span>Ubutaka (Land & Acreage)</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategoryClick('building')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0 ${
            filters.category === 'building'
              ? 'bg-sky-700 text-white shadow-sm shadow-sky-700/20'
              : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Inzu (Buildings & Estates)</span>
        </button>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Location Input */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Location</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="City, State, or Area (e.g. Austin, CA)"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              onKeyDown={handleLocationSubmit}
              onBlur={handleLocationBlur}
              className="w-full pl-3.5 pr-8 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
            />
            {localLocation && (
              <button
                type="button"
                onClick={() => {
                  setLocalLocation('');
                  onChange({ ...filters, location: '' });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2. Minimum Price Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Min Price</span>
          </label>
          <select
            value={filters.min_price || ''}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value })}
            className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
          >
            <option value="">No Minimum</option>
            <option value="250000">$250,000</option>
            <option value="500000">$500,000</option>
            <option value="750000">$750,000</option>
            <option value="1000000">$1,000,000</option>
            <option value="2000000">$2,000,000</option>
            <option value="3000000">$3,000,000</option>
          </select>
        </div>

        {/* 3. Maximum Price Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Max Price</span>
          </label>
          <select
            value={filters.max_price || ''}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value })}
            className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
          >
            <option value="">No Maximum</option>
            <option value="750000">$750,000</option>
            <option value="1000000">$1,000,000</option>
            <option value="2000000">$2,000,000</option>
            <option value="3500000">$3,500,000</option>
            <option value="5000000">$5,000,000</option>
            <option value="10000000">$10,000,000+</option>
          </select>
        </div>

        {/* 4. Status or Search Action */}
        <div className="flex flex-col justify-end">
          {showStatusFilter ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Listing Status</span>
              </label>
              <select
                value={filters.status || 'available'}
                onChange={(e) => onChange({ ...filters, status: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Only</option>
                <option value="pending">Pending / Contract</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSearch}
              className="w-full h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 transition active:scale-[0.99]"
            >
              <Search className="w-4 h-4" />
              <span>Search Listings</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
