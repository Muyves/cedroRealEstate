import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Building2,
  Trees,
  Star,
  Trash2,
  ExternalLink,
  DollarSign,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  KeyRound,
  UserPlus,
  UserX,
  UserCheck,
  FileCheck,
  Mail,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Download,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'listings', 'users', 'inquiries', 'security'
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilterCategory, setListingFilterCategory] = useState('all');
  const [listingFilterStatus, setListingFilterStatus] = useState('all');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Modals state
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');

  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'seller',
    phone: '',
  });

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4500);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 4500);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, listingsData, inquiriesData] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(),
        api.getListings({}),
        api.getAllAdminInquiries().catch(() => []),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setListings(listingsData);
      setInquiries(inquiriesData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showNotification('Failed to load admin data: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- Admin Duty 1: Toggle Featured Listing ---
  const handleToggleFeature = async (id) => {
    try {
      const updated = await api.toggleFeatureListing(id);
      setListings(listings.map((l) => (l.id === id ? updated : l)));
      showNotification(`Listing "${updated.title}" featured status updated.`);
    } catch (err) {
      showNotification('Failed to toggle feature: ' + err.message, true);
    }
  };

  // --- Admin Duty 2: Change Listing Status ---
  const handleListingStatusChange = async (listingId, newStatus) => {
    try {
      const updated = await api.adminUpdateListingStatus(listingId, newStatus);
      setListings(listings.map((l) => (l.id === listingId ? updated : l)));
      showNotification(`Listing status updated to ${newStatus}.`);
      fetchAdminData();
    } catch (err) {
      showNotification('Failed to update listing status: ' + err.message, true);
    }
  };

  // --- Admin Duty 2b: Change Listing Category ---
  const handleListingCategoryChange = async (listingId, newCategory) => {
    try {
      const updated = await api.adminUpdateListingCategory(listingId, newCategory);
      setListings(listings.map((l) => (l.id === listingId ? updated : l)));
      showNotification(`Listing category updated to ${newCategory}.`);
    } catch (err) {
      showNotification('Failed to update listing category: ' + err.message, true);
    }
  };

  // --- Admin Duty 3: Delete Listing ---
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Admin confirmation: Permanently delete this listing from the marketplace?')) return;
    try {
      await api.deleteListing(id);
      setListings(listings.filter((l) => l.id !== id));
      showNotification('Listing removed successfully.');
      fetchAdminData();
    } catch (err) {
      showNotification('Failed to delete listing: ' + err.message, true);
    }
  };

  // --- Admin Duty 4: User Role Management ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await api.updateUserRole(userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
      showNotification(`User role updated to ${newRole}.`);
      fetchAdminData();
    } catch (err) {
      showNotification('Failed to change user role: ' + err.message, true);
    }
  };

  // --- Admin Duty 5: User Suspension / Activation Toggle ---
  const handleToggleUserStatus = async (user) => {
    const targetStatus = !(user.is_active ?? true);
    const actionLabel = targetStatus ? 'activate' : 'suspend';
    if (!window.confirm(`Admin confirmation: Are you sure you want to ${actionLabel} account "${user.email}"?`)) return;

    try {
      const updatedUser = await api.toggleUserStatus(user.id, targetStatus);
      setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
      showNotification(`Account ${updatedUser.email} has been ${targetStatus ? 'activated' : 'suspended'}.`);
      fetchAdminData();
    } catch (err) {
      showNotification('Failed to update account status: ' + err.message, true);
    }
  };

  // --- Admin Duty 6: Admin Password Reset for User ---
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForReset || !resetPasswordInput) return;

    try {
      await api.adminResetPassword(selectedUserForReset.id, resetPasswordInput);
      showNotification(`Password for ${selectedUserForReset.email} successfully updated.`);
      setIsResetPasswordModalOpen(false);
      setResetPasswordInput('');
      setSelectedUserForReset(null);
    } catch (err) {
      showNotification('Password reset failed: ' + err.message, true);
    }
  };

  // --- Admin Duty 7: Create Staff / User Account ---
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createAdminUser(newUserData);
      setUsers([created, ...users]);
      showNotification(`New ${created.role} account created for ${created.email}.`);
      setIsNewUserModalOpen(false);
      setNewUserData({ full_name: '', email: '', password: '', role: 'seller', phone: '' });
      fetchAdminData();
    } catch (err) {
      showNotification('Failed to create account: ' + err.message, true);
    }
  };

  // --- Admin Duty 8: Delete User ---
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`DANGER: Are you sure you want to permanently delete user "${userEmail}" and all their records?`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      showNotification(`User ${userEmail} permanently deleted.`);
      fetchAdminData();
    } catch (err) {
      showNotification('Failed to delete user: ' + err.message, true);
    }
  };

  // --- Admin Duty 9: Update Inquiry Status ---
  const handleInquiryStatusChange = async (inquiryId, newStatus) => {
    try {
      const updated = await api.updateAdminInquiryStatus(inquiryId, newStatus);
      setInquiries(inquiries.map((inq) => (inq.id === inquiryId ? updated : inq)));
      showNotification(`Inquiry status updated to ${newStatus}.`);
    } catch (err) {
      showNotification('Failed to update inquiry: ' + err.message, true);
    }
  };

  // --- Admin Duty 10: Export Platform Data ---
  const handleExportData = (type) => {
    const dataToExport = type === 'listings' ? listings : users;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `cedro_${type}_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification(`Exported ${dataToExport.length} ${type} records to JSON.`);
  };

  // Filtered Listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.location.toLowerCase().includes(listingSearch.toLowerCase());
    const matchesCategory = listingFilterCategory === 'all' || l.category === listingFilterCategory;
    const matchesStatus = listingFilterStatus === 'all' || l.status === listingFilterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Duties & Governance Control</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Platform-Wide Security</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Executive Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAdminData()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
            title="Refresh Platform Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/create-listing"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Property</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Marketplace KPIs
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Listings & Documents</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-bold text-slate-700">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>User Security & Roles</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-bold text-slate-700">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-5 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'border-purple-700 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Market Inquiries</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 font-bold text-purple-900">
            {inquiries.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & PLATFORM KPIS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {stats ? (
            <>
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Marketplace Value
                  </span>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">
                    ${stats.listings.total_value.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Across all registered land & buildings</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Land Parcels
                  </span>
                  <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                    {stats.listings.land_count} Properties
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stats.listings.total_land_acres} Total Acres</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Buildings & Estates
                  </span>
                  <p className="text-3xl font-extrabold text-sky-700 mt-2">
                    {stats.listings.building_count} Structures
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Residential & Commercial</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Protected Accounts
                  </span>
                  <p className="text-3xl font-extrabold text-purple-700 mt-2">
                    {stats.users.total} Total
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.users.active} Active • {stats.users.suspended || 0} Suspended
                  </p>
                </div>
              </div>

              {/* Status Breakdown Bar */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">Inventory Status Distribution</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportData('listings')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Listings JSON</span>
                    </button>
                    <button
                      onClick={() => handleExportData('users')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Users JSON</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-800">Available</span>
                      <p className="text-2xl font-extrabold text-emerald-900">{stats.listings.available}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-amber-800">Pending / Escrow</span>
                      <p className="text-2xl font-extrabold text-amber-900">{stats.listings.pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>

                  <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-800">Sold & Closed</span>
                      <p className="text-2xl font-extrabold text-slate-900">{stats.listings.sold}</p>
                    </div>
                    <Layers className="w-8 h-8 text-slate-500" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">Loading admin statistics...</div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL LISTINGS & DOCUMENT MODERATION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search listings..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={listingFilterCategory}
                onChange={(e) => setListingFilterCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Categories</option>
                <option value="land">Land Parcels</option>
                <option value="building">Buildings / Estates</option>
              </select>

              <select
                value={listingFilterStatus}
                onChange={(e) => setListingFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Property Title</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Status & Duty</th>
                    <th className="py-4 px-4">Device Documents</th>
                    <th className="py-4 px-4">Featured</th>
                    <th className="py-4 px-6 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <Link to={`/listings/${item.id}`} className="font-bold text-slate-900 hover:text-emerald-700 transition block">
                          {item.title}
                        </Link>
                        <span className="text-xs text-slate-400 font-medium">{item.location}</span>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={item.category}
                          onChange={(e) => handleListingCategoryChange(item.id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border capitalize focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            item.category === 'land'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-sky-50 border-sky-300 text-sky-800'
                          }`}
                          title="Change property category"
                        >
                          <option value="land">🌿 Ubutaka (Land)</option>
                          <option value="building">🏢 Inzu (Building)</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-800">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleListingStatusChange(item.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white capitalize"
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending Escrow</option>
                          <option value="sold">Sold & Closed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        {item.documents && item.documents.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>{item.documents.length} Deeds / Plans</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">None Attached</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleFeature(item.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            item.is_featured
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500'
                          }`}
                          title="Toggle Featured on Homepage"
                        >
                          <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/listings/${item.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Inspect Listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/create-listing?edit=${item.id}`}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 text-xs font-bold"
                            title="Edit Listing Specs"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Listing"
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USER SECURITY & ROLES GOVERNANCE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers / Agents</option>
                <option value="admin">Administrators</option>
              </select>

              <button
                onClick={() => setIsNewUserModalOpen(true)}
                className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard Staff / User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">User Account</th>
                    <th className="py-4 px-4">Contact Phone</th>
                    <th className="py-4 px-4">Security Status</th>
                    <th className="py-4 px-4">Assigned Role</th>
                    <th className="py-4 px-4">Role Duty</th>
                    <th className="py-4 px-6 text-right">Security Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((u) => {
                    const isActive = u.is_active ?? true;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.full_name}`}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{u.full_name}</p>
                              <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                          {u.phone || '—'}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            <span>{isActive ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : u.role === 'seller'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white capitalize"
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller / Agent</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Toggle Suspend/Activate */}
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition ${
                                isActive
                                  ? 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                              title={isActive ? 'Suspend User Account' : 'Activate User Account'}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5 text-rose-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                              <span>{isActive ? 'Suspend' : 'Activate'}</span>
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setSelectedUserForReset(u);
                                setIsResetPasswordModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg border border-slate-200 transition text-xs font-bold flex items-center gap-1"
                              title="Reset User Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset PW</span>
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MARKETPLACE INQUIRIES OVERSIGHT                                    */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Client / Buyer</th>
                    <th className="py-4 px-4">Contact Info</th>
                    <th className="py-4 px-4">Property MLS Ref</th>
                    <th className="py-4 px-6">Inquiry Message</th>
                    <th className="py-4 px-4">Status & Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inquiries.length > 0 ? (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {inq.buyer_name || 'Client Lead'}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 space-y-0.5">
                          <p>{inq.buyer_email}</p>
                          <p className="text-slate-400">{inq.buyer_phone || 'No phone'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            to={`/listings/${inq.listing_id}`}
                            className="font-bold text-xs text-emerald-700 hover:underline"
                          >
                            Listing #{inq.listing_id}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-700 max-w-xs truncate">
                          "{inq.message}"
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={inq.status || 'new'}
                            onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white capitalize"
                          >
                            <option value="new">New Lead</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved / Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                        No inquiries submitted yet on the marketplace.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ONBOARD NEW STAFF / ADMIN USER                                   */}
      {/* ========================================================================= */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-700" />
                <h3 className="font-extrabold text-lg text-slate-900">Onboard Team / User</h3>
              </div>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Drake"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="robert@cedro.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Role Clearance *
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="seller">Seller / Agent</option>
                    <option value="buyer">Buyer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 font-bold text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADMIN PASSWORD RESET FOR USER                                    */}
      {/* ========================================================================= */}
      {isResetPasswordModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-700" />
                <h3 className="font-extrabold text-lg text-slate-900">Admin Password Reset</h3>
              </div>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Assign a new cryptographically hashed password for{' '}
              <strong className="text-slate-900">{selectedUserForReset.email}</strong>.
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Secure Password *
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  placeholder="Enter new temporary password"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 font-bold text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
