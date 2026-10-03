import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Send, Compass, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import ListingCard from '../components/listings/ListingCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [sentInquiries, setSentInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'inquiries'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      setLoading(true);
      try {
        const [favsData, inqData] = await Promise.all([
          api.getFavorites(),
          api.getSentInquiries(),
        ]);
        setFavorites(favsData);
        setSentInquiries(inqData);
      } catch (err) {
        console.error('Error fetching buyer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyerData();
  }, []);

  const handleFavoriteToggle = (listingId, isFavorited) => {
    if (!isFavorited) {
      setFavorites(favorites.filter((f) => f.id !== listingId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Buyer Dashboard
          </span>
          <span className="text-xs text-slate-500 font-medium">Portfolio for {user?.full_name}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Saved Properties & Offer Activity
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Saved Properties</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-bold text-slate-700">
            {favorites.length}
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
          <Send className="w-4 h-4 text-emerald-600" />
          <span>Sent Offers & Inquiries</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-bold text-slate-700">
            {sentInquiries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Saved Properties Yet</h3>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Explore our land parcels and buildings, click the heart icon on any listing to bookmark it for later.
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Properties</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {sentInquiries.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <p className="text-slate-600 font-medium">You haven't submitted any offers or inquiries yet.</p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sentInquiries.map((inq) => (
                <div key={inq.id} className="p-6 hover:bg-slate-50/50 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Inquiry ID: #{inq.id}</span>
                      <h4 className="font-bold text-lg text-slate-900">
                        {inq.listing?.title || `Listing #${inq.listing_id}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {inq.offer_amount && (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Your Offer: ${inq.offer_amount.toLocaleString()}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        Status: {inq.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    "{inq.message}"
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Submitted on {new Date(inq.created_at).toLocaleDateString()}</span>
                    </span>
                    {inq.listing && (
                      <Link
                        to={`/listings/${inq.listing_id}`}
                        className="text-emerald-700 hover:text-emerald-800 font-bold"
                      >
                        View Property Details →
                      </Link>
                    )}
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
