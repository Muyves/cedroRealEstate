import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  DollarSign,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Trees,
  Building2,
  Maximize2
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'inquiries'
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsData, inquiriesData] = await Promise.all([
        api.getMyListings(),
        api.getReceivedInquiries(),
      ]);
      setListings(listingsData);
      setInquiries(inquiriesData);
    } catch (err) {
      console.error('Error loading seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      await api.updateListingStatus(listingId, newStatus);
      setListings(
        listings.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.deleteListing(listingId);
      setListings(listings.filter((l) => l.id !== listingId));
    } catch (err) {
      alert('Failed to delete listing: ' + err.message);
    }
  };

  const handleInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await api.updateInquiryStatus(inquiryId, newStatus);
      setInquiries(
        inquiries.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      alert('Failed to update inquiry status: ' + err.message);
    }
  };

  // Metrics
  const totalValue = listings.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const availableCount = listings.filter((l) => l.status === 'available').length;
  const pendingCount = listings.filter((l) => l.status === 'pending').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Seller Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Managing listings for {user?.full_name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Seller Portfolio Dashboard
          </h1>
        </div>

        <Link
          to="/create-listing"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/25 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Property</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Portfolio Value</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ${totalValue.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500">{listings.length} Properties Listed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active / Available</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{availableCount}</p>
          <span className="text-xs text-slate-500">Accepting Offers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending / Contract</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</p>
          <span className="text-xs text-slate-500">In Escrow / Due Diligence</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Completed Sales</span>
          <p className="text-2xl font-extrabold text-rose-700 mt-1">{soldCount}</p>
          <span className="text-xs text-slate-500">Successfully Closed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>My Listings</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-bold text-slate-700">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Buyer Inquiries & Offers</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 font-bold text-amber-800">
            {inquiries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Listings Table */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading properties...</div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-slate-600 font-medium">You have not published any listings yet.</p>
              <Link
                to="/create-listing"
                className="inline-block px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Post First Listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Property</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Size / Acreage</th>
                    <th className="py-4 px-4">Asking Price</th>
                    <th className="py-4 px-4">Listing Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.media_urls?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-16 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <Link
                              to={`/listings/${item.id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <span className="text-xs text-slate-500">{item.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <CategoryBadge category={item.category} />
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {item.size_value.toLocaleString()} {item.size_unit}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-800">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {/* Status Select for real-time status update */}
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize"
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending / Contract</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/listings/${item.id}`}
                            title="View Public Page"
                            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/create-listing?edit=${item.id}`}
                            title="Edit Listing"
                            className="p-2 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-amber-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(item.id)}
                            title="Delete Listing"
                            className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No inquiries or purchase offers received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-6 hover:bg-slate-50/50 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">
                        Inquiry on: <strong>{inq.listing?.title || `Listing #${inq.listing_id}`}</strong>
                      </span>
                      <h4 className="font-bold text-base text-slate-900">{inq.buyer_name || 'Buyer'}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {inq.offer_amount && (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Offer: ${inq.offer_amount.toLocaleString()}
                        </span>
                      )}
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="countered">Countered</option>
                        <option value="rejected">Declined</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    "{inq.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    {inq.buyer_email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inq.buyer_email}</span>
                      </span>
                    )}
                    {inq.buyer_phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inq.buyer_phone}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
