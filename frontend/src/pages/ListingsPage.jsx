import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  Filter,
  ArrowUpDown,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Trees,
  Building2
} from 'lucide-react';
import ListingCard from '../components/listings/ListingCard';
import SearchFilterBar from '../components/listings/SearchFilterBar';
import { api } from '../services/api';

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    status: searchParams.get('status') || 'all',
    sort_by: searchParams.get('sort_by') || 'newest',
  });

  // Keep state synced with URL search params
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || 'all',
      location: searchParams.get('location') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      status: searchParams.get('status') || 'all',
      sort_by: searchParams.get('sort_by') || 'newest',
    });
  }, [searchParams]);

  // Fetch listings whenever filters change
  useEffect(() => {
    const fetchFilteredListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.category && filters.category !== 'all') params.category = filters.category;
        if (filters.location) params.location = filters.location;
        if (filters.min_price) params.min_price = filters.min_price;
        if (filters.max_price) params.max_price = filters.max_price;
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        if (filters.sort_by) params.sort_by = filters.sort_by;

        const data = await api.getListings(params);
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredListings();
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleReset = () => {
    const resetObj = {
      category: 'all',
      location: '',
      min_price: '',
      max_price: '',
      status: 'all',
      sort_by: 'newest',
    };
    setFilters(resetObj);
    setSearchParams(new URLSearchParams());
  };

  const handleSortChange = (e) => {
    updateFilters({ ...filters, sort_by: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-emerald-700" />
            <span>Marketplace Catalog</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse available, pending, and sold land parcels and premium architectural buildings.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sort By:</span>
          <select
            value={filters.sort_by}
            onChange={handleSortChange}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="newest">Newest Listings</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="size_asc">Size: Smallest First</option>
            <option value="size_desc">Size: Largest First</option>
          </select>
        </div>
      </div>

      {/* Main Filter Bar */}
      <SearchFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={handleReset}
        showStatusFilter={true}
      />

      {/* Results Header with Active Count & Quick Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="font-bold text-slate-900">
            {listings.length} {listings.length === 1 ? 'Property' : 'Properties'} Found
          </span>
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Category: <strong className="capitalize">{filters.category}</strong>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Location: <strong>{filters.location}</strong>
            </span>
          )}
          {(filters.min_price || filters.max_price) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Price Range: ${Number(filters.min_price || 0).toLocaleString()} -{' '}
              {filters.max_price ? `$${Number(filters.max_price).toLocaleString()}` : 'Any'}
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Status: <strong className="capitalize">{filters.status}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No matching properties found</h3>
          <p className="text-slate-600 text-sm max-w-sm mx-auto">
            Try loosening your search filters or resetting your category, location, or price parameters.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
