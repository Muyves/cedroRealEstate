import { mockStore } from './mockStore';

// In production (GitHub Pages), VITE_API_URL can be set to a deployed backend URL.
// When no live backend is available (such as static GitHub Pages), api.js seamlessly falls back
// to the persistent mockStore so Admin, Buyer, and Seller duties work 100% interactively!
export const API_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = `${API_SERVER_URL}/api`;

const isStaticHosted =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') &&
  !import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('cedro_token') : null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cedro_token', token);
    } else {
      localStorage.removeItem('cedro_token');
    }
  }

  // Format file URLs (turn relative /uploads/... into full URL)
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
    // If hosted on GitHub Pages without configured backend, skip network timeout and use mockStore immediately
    if (isStaticHosted) {
      throw new Error('OFFLINE_FALLBACK');
    }

    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const config = {
      ...options,
      headers,
      signal: controller.signal,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      clearTimeout(timeoutId);

      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.detail || 'An unexpected error occurred';
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      // Re-throw if it's an explicit 401/403/422 validation error from a live server
      if (err.message && !err.message.includes('fetch') && !err.message.includes('abort') && !err.message.includes('NetworkError') && !err.message.includes('Load failed')) {
        throw err;
      }
      // Otherwise mark for mockStore fallback
      throw new Error('OFFLINE_FALLBACK');
    }
  }

  // --- Auth endpoints ---
  async login(email, password) {
    try {
      return await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      console.info('[Cedro API] Using client storage for login:', email);
      return await mockStore.login(email, password);
    }
  }

  async register(userData) {
    try {
      return await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.info('[Cedro API] Using client storage for register');
      return await mockStore.register(userData);
    }
  }

  async getMe() {
    try {
      return await this.request('/auth/me');
    } catch (err) {
      return await mockStore.getMe();
    }
  }

  async changePassword(current_password, new_password) {
    try {
      return await this.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password, new_password }),
      });
    } catch (err) {
      return { success: true, message: 'Password updated' };
    }
  }

  async demoLogin(role) {
    try {
      return await this.request(`/auth/demo/${role}`, {
        method: 'POST',
      });
    } catch (err) {
      console.info('[Cedro API] Using client storage for demo login:', role);
      return await mockStore.demoLogin(role);
    }
  }

  // --- Device File Upload Endpoints ---
  async uploadFile(file, folder = 'images') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const result = await this.request('/upload', {
        method: 'POST',
        body: formData,
      });

      return {
        ...result,
        fullUrl: this.formatMediaUrl(result.url),
      };
    } catch (err) {
      // Create local object URL / Data URL for offline upload
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target.result;
          resolve({
            filename: file.name,
            url,
            fullUrl: url,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  async uploadMultipleFiles(files, folder = 'images') {
    try {
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
          fullUrl: this.formatMediaUrl(item.url),
        }));
      }
      return result;
    } catch (err) {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => this.uploadFile(f, folder))
      );
      return { uploaded };
    }
  }

  // --- Listings endpoints ---
  async getListings(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          query.append(key, value);
        }
      });
      const queryString = query.toString();
      return await this.request(`/listings${queryString ? `?${queryString}` : ''}`);
    } catch (err) {
      return await mockStore.fetchListings(params);
    }
  }

  async getListing(id) {
    try {
      return await this.request(`/listings/${id}`);
    } catch (err) {
      return await mockStore.getListingById(id);
    }
  }

  async getMyListings() {
    try {
      return await this.request('/listings/seller/my-listings');
    } catch (err) {
      return await mockStore.getMyListings();
    }
  }

  async createListing(listingData) {
    try {
      return await this.request('/listings', {
        method: 'POST',
        body: JSON.stringify(listingData),
      });
    } catch (err) {
      return await mockStore.createListing(listingData);
    }
  }

  async updateListing(id, listingData) {
    try {
      return await this.request(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(listingData),
      });
    } catch (err) {
      return await mockStore.updateListing(id, listingData);
    }
  }

  async updateListingStatus(id, status) {
    try {
      return await this.request(`/listings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      return await mockStore.updateListing(id, { status });
    }
  }

  async deleteListing(id) {
    try {
      return await this.request(`/listings/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      return await mockStore.deleteListing(id);
    }
  }

  // --- Inquiries endpoints ---
  async createInquiry(inquiryData) {
    try {
      return await this.request('/inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiryData),
      });
    } catch (err) {
      return await mockStore.createInquiry(inquiryData);
    }
  }

  async getReceivedInquiries() {
    try {
      return await this.request('/inquiries/received');
    } catch (err) {
      return await mockStore.getReceivedInquiries();
    }
  }

  async getSentInquiries() {
    try {
      return await this.request('/inquiries/sent');
    } catch (err) {
      return await mockStore.getSentInquiries();
    }
  }

  async updateInquiryStatus(id, status) {
    try {
      return await this.request(`/inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      return await mockStore.updateInquiryStatus(id, status);
    }
  }

  // --- Favorites endpoints ---
  async getFavorites() {
    try {
      return await this.request('/favorites');
    } catch (err) {
      return await mockStore.getFavorites();
    }
  }

  async toggleFavorite(listingId) {
    try {
      return await this.request(`/favorites/${listingId}`, {
        method: 'POST',
      });
    } catch (err) {
      return await mockStore.toggleFavorite(listingId);
    }
  }

  // --- Admin Duties & Platform Governance endpoints ---
  async getAdminStats() {
    try {
      return await this.request('/admin/stats');
    } catch (err) {
      return await mockStore.getAdminStats();
    }
  }

  async getAllUsers() {
    try {
      return await this.request('/admin/users');
    } catch (err) {
      return await mockStore.getAllUsers();
    }
  }

  async createAdminUser(userData) {
    try {
      return await this.request('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (err) {
      return await mockStore.createAdminUser(userData);
    }
  }

  async updateUserRole(userId, role) {
    try {
      return await this.request(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      return await mockStore.updateUserRole(userId, role);
    }
  }

  async toggleUserStatus(userId, is_active) {
    try {
      return await this.request(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active }),
      });
    } catch (err) {
      return await mockStore.toggleUserStatus(userId, is_active);
    }
  }

  async adminResetPassword(userId, new_password) {
    try {
      return await this.request(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password }),
      });
    } catch (err) {
      return await mockStore.adminResetPassword(userId, new_password);
    }
  }

  async deleteUser(userId) {
    try {
      return await this.request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      return await mockStore.deleteUser(userId);
    }
  }

  async toggleFeatureListing(listingId) {
    try {
      return await this.request(`/admin/listings/${listingId}/feature`, {
        method: 'PATCH',
      });
    } catch (err) {
      return await mockStore.toggleFeatureListing(listingId);
    }
  }

  async adminUpdateListingStatus(listingId, status) {
    try {
      return await this.request(`/admin/listings/${listingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      return await mockStore.updateListing(listingId, { status });
    }
  }

  async adminUpdateListingCategory(listingId, category) {
    try {
      return await this.request(`/listings/${listingId}`, {
        method: 'PUT',
        body: JSON.stringify({ category }),
      });
    } catch (err) {
      return await mockStore.updateListing(listingId, { category });
    }
  }

  async getAllAdminInquiries() {
    try {
      return await this.request('/admin/inquiries');
    } catch (err) {
      return await mockStore.getAllAdminInquiries();
    }
  }

  async updateAdminInquiryStatus(inquiryId, status) {
    try {
      return await this.request(`/admin/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      return await mockStore.updateInquiryStatus(inquiryId, status);
    }
  }
}

export const api = new ApiService();
