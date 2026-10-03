// In production (GitHub Pages), VITE_API_URL must be set to your deployed backend URL.
// e.g. https://your-backend-name.onrender.com
// For local dev it falls back to localhost:8000
export const API_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = `${API_SERVER_URL}/api`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('cedro_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cedro_token', token);
    } else {
      localStorage.removeItem('cedro_token');
    }
  }

  // Format file URLs (turn relative /uploads/... into full http://localhost:8000/uploads/...)
  formatMediaUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads')) {
      return `${API_SERVER_URL}${url}`;
    }
    return url;
  }

  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.detail || 'An unexpected error occurred';
      throw new Error(errorMsg);
    }

    return data;
  }

  // Auth endpoints
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  changePassword(current_password, new_password) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  demoLogin(role) {
    return this.request(`/auth/demo/${role}`, {
      method: 'POST',
    });
  }

  // Device File Upload Endpoints
  async uploadFile(file, folder = 'images') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const result = await this.request('/upload', {
      method: 'POST',
      body: formData,
    });

    // Attach full formatted URL
    return {
      ...result,
      fullUrl: this.formatMediaUrl(result.url)
    };
  }

  async uploadMultipleFiles(files, folder = 'images') {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    formData.append('folder', folder);

    const result = await this.request('/upload/multiple', {
      method: 'POST',
      body: formData,
    });

    if (result.uploaded) {
      result.uploaded = result.uploaded.map((item) => ({
        ...item,
        fullUrl: this.formatMediaUrl(item.url)
      }));
    }
    return result;
  }

  // Listings endpoints
  getListings(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    return this.request(`/listings${queryString ? `?${queryString}` : ''}`);
  }

  getListing(id) {
    return this.request(`/listings/${id}`);
  }

  getMyListings() {
    return this.request('/listings/seller/my-listings');
  }

  createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  updateListing(id, listingData) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  updateListingStatus(id, status) {
    return this.request(`/listings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteListing(id) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Inquiries endpoints
  createInquiry(inquiryData) {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  getReceivedInquiries() {
    return this.request('/inquiries/received');
  }

  getSentInquiries() {
    return this.request('/inquiries/sent');
  }

  updateInquiryStatus(id, status) {
    return this.request(`/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Favorites endpoints
  getFavorites() {
    return this.request('/favorites');
  }

  toggleFavorite(listingId) {
    return this.request(`/favorites/${listingId}`, {
      method: 'POST',
    });
  }

  // Admin Duties & Platform Governance endpoints
  getAdminStats() {
    return this.request('/admin/stats');
  }

  getAllUsers() {
    return this.request('/admin/users');
  }

  createAdminUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  toggleUserStatus(userId, is_active) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  }

  adminResetPassword(userId, new_password) {
    return this.request(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    });
  }

  deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  toggleFeatureListing(listingId) {
    return this.request(`/admin/listings/${listingId}/feature`, {
      method: 'PATCH',
    });
  }

  adminUpdateListingStatus(listingId, status) {
    return this.request(`/admin/listings/${listingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  adminUpdateListingCategory(listingId, category) {
    return this.request(`/listings/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify({ category }),
    });
  }

  getAllAdminInquiries() {
    return this.request('/admin/inquiries');
  }

  updateAdminInquiryStatus(inquiryId, status) {
    return this.request(`/admin/inquiries/${inquiryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiService();
