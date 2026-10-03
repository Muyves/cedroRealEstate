import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trees,
  Building2,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Maximize2,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  UploadCloud,
  FileText,
  FileCheck,
  Download,
  ExternalLink,
  Star,
  FilePlus,
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DOCUMENT_CATEGORIES = [
  { id: 'title_deed', label: '📜 Title Deed / Ownership Certificate' },
  { id: 'land_survey', label: '📐 Cadastral Land Survey / Boundary Map' },
  { id: 'floor_plan', label: '🏢 Architectural Blueprint / Floor Plan' },
  { id: 'inspection', label: '📋 Property Inspection & Valuation Report' },
  { id: 'zoning_permit', label: '🏛️ Zoning & Building Clearance Permit' },
  { id: 'brochure', label: '📄 Sales Brochure & Disclosures' },
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'land', // 'land' or 'building'
    property_type: 'residential_land',
    location: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    size_value: '',
    size_unit: 'acres', // 'acres' or 'sqft'
    price: '',
    status: 'available', // 'available', 'pending', 'sold'
    bedrooms: '',
    bathrooms: '',
    features: ['Electricity Available', 'Survey Completed'],
    media_urls: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ],
    documents: [], // Array of { name, url, size, type, doc_category, uploaded_at }
    is_featured: false,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [selectedDocCategory, setSelectedDocCategory] = useState('title_deed');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If editing existing listing, fetch and populate
  useEffect(() => {
    if (editId) {
      const fetchToEdit = async () => {
        try {
          const item = await api.getListing(editId);
          setFormData({
            title: item.title,
            description: item.description,
            category: item.category,
            property_type: item.property_type || 'general',
            location: item.location,
            address: item.address || '',
            city: item.city || '',
            state: item.state || '',
            zip_code: item.zip_code || '',
            size_value: item.size_value,
            size_unit: item.size_unit || (item.category === 'land' ? 'acres' : 'sqft'),
            price: item.price,
            status: item.status || 'available',
            bedrooms: item.bedrooms !== null ? item.bedrooms : '',
            bathrooms: item.bathrooms !== null ? item.bathrooms : '',
            features: item.features || [],
            media_urls: item.media_urls || [],
            documents: item.documents || [],
            is_featured: item.is_featured || false,
          });
        } catch (err) {
          setError('Failed to load existing listing for editing');
        }
      };
      fetchToEdit();
    }
  }, [editId]);

  const handleCategoryChange = (newCat) => {
    setFormData({
      ...formData,
      category: newCat,
      property_type: newCat === 'land' ? 'residential_land' : 'single_family',
      size_unit: newCat === 'land' ? 'acres' : 'sqft',
    });
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  // --- Device Image Import ---
  const handleImageFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setUploadProgressText(`Importing ${files.length} photo(s) from device...`);
    setError('');

    try {
      const res = await api.uploadMultipleFiles(files, 'images');
      if (res.uploaded && res.uploaded.length > 0) {
        const newUrls = res.uploaded.map((u) => u.fullUrl);
        setFormData((prev) => ({
          ...prev,
          media_urls: [...prev.media_urls, ...newUrls],
        }));
        setSuccessMsg(`Successfully imported ${res.uploaded.length} photo(s) from device!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
      if (res.errors && res.errors.length > 0) {
        setError(`Failed to import some images: ${res.errors.map((e) => e.error).join(', ')}`);
      }
    } catch (err) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setIsUploadingImage(false);
      setUploadProgressText('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const addMediaUrl = () => {
    if (newMediaUrl.trim()) {
      setFormData({
        ...formData,
        media_urls: [...formData.media_urls, newMediaUrl.trim()],
      });
      setNewMediaUrl('');
    }
  };

  const removeMediaUrl = (index) => {
    setFormData({
      ...formData,
      media_urls: formData.media_urls.filter((_, i) => i !== index),
    });
  };

  const setPrimaryCover = (index) => {
    if (index === 0) return;
    const target = formData.media_urls[index];
    const rest = formData.media_urls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      media_urls: [target, ...rest],
    });
  };

  // --- Device Document Import ---
  const handleDocFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingDoc(true);
    setUploadProgressText(`Importing ${files.length} legal document(s)...`);
    setError('');

    try {
      const res = await api.uploadMultipleFiles(files, 'documents');
      if (res.uploaded && res.uploaded.length > 0) {
        const categoryLabel = DOCUMENT_CATEGORIES.find((c) => c.id === selectedDocCategory)?.label || 'Property Document';
        const newDocs = res.uploaded.map((d) => ({
          name: d.name,
          url: d.fullUrl,
          size: d.size,
          type: d.type,
          doc_category: selectedDocCategory,
          doc_label: categoryLabel,
          uploaded_at: new Date().toISOString(),
        }));

        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, ...newDocs],
        }));
        setSuccessMsg(`Successfully imported ${res.uploaded.length} document(s) from device!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
      if (res.errors && res.errors.length > 0) {
        setError(`Failed to import some documents: ${res.errors.map((e) => e.error).join(', ')}`);
      }
    } catch (err) {
      setError('Document upload failed: ' + err.message);
    } finally {
      setIsUploadingDoc(false);
      setUploadProgressText('');
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const removeDocument = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (formData.media_urls.length === 0) {
      setError('Please import or add at least one property photo.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        size_value: parseFloat(formData.size_value),
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
      };

      if (editId) {
        await api.updateListing(editId, payload);
      } else {
        await api.createListing(payload);
      }

      navigate(user?.role === 'admin' ? '/admin-dashboard' : '/seller-dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            Cedro Real Estate Registry
          </span>
          <span className="text-xs text-slate-500 font-medium">Device Asset Integration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          {editId ? 'Edit Property Specification' : 'Register New Property'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create verified listings with direct device photo and legal document uploads.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
          <Check className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Category Selection */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-700">
            1. Property Classification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleCategoryChange('land')}
              className={`p-5 rounded-2xl border-2 text-left transition flex items-start gap-4 ${
                formData.category === 'land'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-3 rounded-xl ${formData.category === 'land' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Ubutaka (Land &amp; Acreage)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranches, development lots, agricultural parcels, waterfront ground
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('building')}
              className={`p-5 rounded-2xl border-2 text-left transition flex items-start gap-4 ${
                formData.category === 'building'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-3 rounded-xl ${formData.category === 'building' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Inzu (Building / Structure)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Luxury villas, modern estates, commercial facilities, multi-family units
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Core Details & Financials */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-700">
            2. Core Specifications
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Property Headline Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Highland Ridge 15-Acre Development Parcel"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Listing Price (USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="1250000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Size Value *
              </label>
              <div className="relative">
                <Maximize2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder={formData.category === 'land' ? '15.5' : '4200'}
                  value={formData.size_value}
                  onChange={(e) => setFormData({ ...formData, size_value: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Measurement Unit
              </label>
              <select
                value={formData.size_unit}
                onChange={(e) => setFormData({ ...formData, size_unit: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="acres">Acres (Land)</option>
                <option value="hectares">Hectares</option>
                <option value="sqft">Square Feet (Building)</option>
                <option value="sqm">Square Meters</option>
              </select>
            </div>
          </div>

          {formData.category === 'building' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="4"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="3.5"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Comprehensive Description *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Detail parcel features, topography, road access, utilities, zoning, water rights, and property highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Location Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-700">
            3. Geographic Location
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Primary Display Location (e.g. Austin, TX or Aspen, CO) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Austin, TX"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="4200 Barton Ridge Blvd"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">City</label>
              <input
                type="text"
                placeholder="Austin"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">State / Zip</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="TX"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase"
                />
                <input
                  type="text"
                  placeholder="78746"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Import Images from Device & Photography */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>4. Property Photos & Photography</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Import high-resolution photos straight from your device, or add image URLs
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {formData.media_urls.length} Photos Added
            </span>
          </div>

          {/* Device File Import Drag-and-Drop Area */}
          <div
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition group"
          >
            <input
              type="file"
              ref={imageInputRef}
              multiple
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-200 group-hover:scale-105 transition">
                {isUploadingImage ? (
                  <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7 text-emerald-600" />
                )}
              </div>
              <p className="text-sm font-extrabold text-slate-800">
                {isUploadingImage ? uploadProgressText : 'Click to import photos from your device'}
              </p>
              <p className="text-xs text-slate-500">
                Supports JPG, PNG, WEBP, GIF, SVG up to 30MB each. Multiple selection allowed.
              </p>
            </div>
          </div>

          {/* Complementary URL input */}
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Or attach via web image URL:
            </span>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={addMediaUrl}
                className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition shrink-0"
              >
                + Add URL
              </button>
            </div>
          </div>

          {/* Gallery Thumbnail Grid */}
          {formData.media_urls.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-600">Attached Photo Gallery:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.media_urls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-sm"
                  >
                    <img
                      src={api.formatMediaUrl(url)}
                      alt={`Property Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge or Set Primary Action */}
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-700 text-white text-[10px] font-bold shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Cover Photo</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryCover(idx)}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 hover:bg-emerald-700 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        Set as Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeMediaUrl(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100 shadow transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Import Legal & Property Documents from Device */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <span>5. Property Documents & Title Deeds (Device Import)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload verified title deeds, cadastral land surveys, architectural floor plans, and inspection reports from device
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
              {formData.documents.length} Documents Attached
            </span>
          </div>

          {/* Document Type Selector before importing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Document Classification to Import:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {DOCUMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedDocCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                    selectedDocCategory === cat.id
                      ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Device Document Import Drop Area */}
          <div
            onClick={() => docInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition group"
          >
            <input
              type="file"
              ref={docInputRef}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
              onChange={handleDocFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-purple-200 group-hover:scale-105 transition">
                {isUploadingDoc ? (
                  <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
                ) : (
                  <FilePlus className="w-7 h-7 text-purple-600" />
                )}
              </div>
              <p className="text-sm font-extrabold text-slate-800">
                {isUploadingDoc ? uploadProgressText : 'Click to import legal documents from your device'}
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, DOC, DOCX, XLS, Blueprints, Scanned Deeds up to 30MB each.
              </p>
            </div>
          </div>

          {/* Uploaded Documents List */}
          {formData.documents.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-600">Attached Verified Documents:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/80 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            {doc.doc_label || doc.doc_category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatFileSize(doc.size)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={api.formatMediaUrl(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white text-slate-600 hover:text-purple-700 hover:border-purple-300 border border-slate-200 transition shadow-xs"
                        title="View Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="p-2 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:border-rose-300 border border-slate-200 transition shadow-xs"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. Key Features & Amenities */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-700">
            6. Key Features & Amenities
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Waterfront Access, Senior Water Rights, Heated Pool, Fiber Internet"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition shrink-0"
            >
              Add Feature
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.features.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-emerald-600 hover:text-rose-600 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 font-bold text-sm text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || isUploadingImage || isUploadingDoc}
            className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Registering Property...' : editId ? 'Update Listing' : 'Publish Property Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
