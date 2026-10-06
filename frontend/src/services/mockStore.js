import seedData from './seedData.json';

// LocalStorage Keys
const STORAGE_KEY_LISTINGS = 'cedro_mock_listings';
const STORAGE_KEY_USERS = 'cedro_mock_users';
const STORAGE_KEY_INQUIRIES = 'cedro_mock_inquiries';
const STORAGE_KEY_FAVORITES = 'cedro_mock_favorites';
const STORAGE_KEY_AUTH_USER = 'cedro_mock_current_user';

class MockStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(seedData.users || []));
    }
    if (!localStorage.getItem(STORAGE_KEY_LISTINGS)) {
      // Hydrate seller info on listings
      const users = this.getUsers();
      const hydratedListings = (seedData.listings || []).map((l) => {
        const seller = users.find((u) => u.id === l.seller_id) || users.find((u) => u.role === 'seller') || users[0];
        return {
          ...l,
          seller: seller
            ? {
                id: seller.id,
                full_name: seller.full_name,
                email: seller.email,
                phone: seller.phone,
                avatar_url: seller.avatar_url,
              }
            : null,
        };
      });
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(hydratedListings));
    }
    if (!localStorage.getItem(STORAGE_KEY_INQUIRIES)) {
      localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(seedData.inquiries || []));
    }
    if (!localStorage.getItem(STORAGE_KEY_FAVORITES)) {
      // Default initial favorite listing IDs for demo
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([1, 2]));
    }
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    } catch {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  getListings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LISTINGS)) || [];
    } catch {
      return [];
    }
  }

  saveListings(listings) {
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
  }

  getInquiries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_INQUIRIES)) || [];
    } catch {
      return [];
    }
  }

  saveInquiries(inquiries) {
    localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(inquiries));
  }

  getFavoritesList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES)) || [];
    } catch {
      return [];
    }
  }

  saveFavoritesList(favs) {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favs));
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_AUTH_USER)) || null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  }

  // --- Auth Handlers ---
  async login(email, password) {
    const users = this.getUsers();
    const cleanEmail = (email || '').toLowerCase().trim();
    let user = users.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail);

    if (!user) {
      // Auto-fallback if testing credentials like Cedro@gmail.com
      if (cleanEmail === 'cedro@gmail.com') {
        user = users.find((u) => u.role === 'admin') || {
          id: 1,
          email: 'Cedro@gmail.com',
          full_name: 'Cedro Admin',
          role: 'admin',
          is_active: 1,
        };
      } else {
        throw new Error('Invalid email or password');
      }
    }

    if (!user.is_active) {
      throw new Error('Account suspended. Please contact platform support.');
    }

    this.setCurrentUser(user);
    return {
      access_token: `mock_jwt_${user.role}_${user.id}_${Date.now()}`,
      token_type: 'bearer',
      user,
    };
  }

  async register(userData) {
    const users = this.getUsers();
    const cleanEmail = (userData.email || '').toLowerCase().trim();
    if (users.some((u) => (u.email || '').toLowerCase().trim() === cleanEmail)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Date.now(),
      email: userData.email,
      full_name: userData.full_name || 'New User',
      role: userData.role || 'buyer',
      phone: userData.phone || '+250 782 024 578',
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + (users.length % 10)}?auto=format&fit=crop&w=150&q=80`,
      created_at: new Date().toISOString(),
      is_active: 1,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return {
      access_token: `mock_jwt_${newUser.role}_${newUser.id}_${Date.now()}`,
      token_type: 'bearer',
      user: newUser,
    };
  }

  async getMe() {
    const user = this.getCurrentUser();
    if (!user) {
      // Default to admin if no user set yet for seamless testing
      const users = this.getUsers();
      const admin = users.find((u) => u.role === 'admin') || users[0];
      if (admin) {
        this.setCurrentUser(admin);
        return admin;
      }
      throw new Error('Not authenticated');
    }
    return user;
  }

  async demoLogin(role) {
    const users = this.getUsers();
    let user = users.find((u) => u.role === role);

    if (!user) {
      user = {
        id: Date.now(),
        email: `${role}@cedro.com`,
        full_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role,
        phone: '+250 782 024 578',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        created_at: new Date().toISOString(),
        is_active: 1,
      };
      users.push(user);
      this.saveUsers(users);
    }

    this.setCurrentUser(user);
    return {
      access_token: `mock_jwt_${user.role}_${user.id}_${Date.now()}`,
      token_type: 'bearer',
      user,
    };
  }

  // --- Listings Handlers ---
  async fetchListings(params = {}) {
    let list = this.getListings();

    if (params.category && params.category !== 'all') {
      list = list.filter((l) => (l.category || '').toLowerCase() === params.category.toLowerCase());
    }
    if (params.status && params.status !== 'all') {
      list = list.filter((l) => (l.status || '').toLowerCase() === params.status.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (l) =>
          (l.title || '').toLowerCase().includes(q) ||
          (l.location || '').toLowerCase().includes(q) ||
          (l.city || '').toLowerCase().includes(q)
      );
    }
    if (params.featured === 'true' || params.featured === true) {
      list = list.filter((l) => l.is_featured);
    }

    return list;
  }

  async getListingById(id) {
    const list = this.getListings();
    const item = list.find((l) => String(l.id) === String(id));
    if (!item) throw new Error('Listing not found');
    return item;
  }

  async getMyListings() {
    const user = this.getCurrentUser();
    const list = this.getListings();
    if (!user) return list;
    if (user.role === 'admin') return list;
    return list.filter((l) => String(l.seller_id) === String(user.id));
  }

  async createListing(data) {
    const user = this.getCurrentUser();
    const list = this.getListings();
    const newId = Date.now();

    const newListing = {
      ...data,
      id: newId,
      seller_id: user ? user.id : 2,
      seller: user
        ? {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            avatar_url: user.avatar_url,
          }
        : null,
      status: data.status || 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media_urls: data.media_urls && data.media_urls.length > 0
        ? data.media_urls
        : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      features: Array.isArray(data.features) ? data.features : [],
      documents: Array.isArray(data.documents) ? data.documents : [],
      is_featured: data.is_featured ? 1 : 0,
    };

    list.unshift(newListing);
    this.saveListings(list);
    return newListing;
  }

  async updateListing(id, data) {
    const list = this.getListings();
    const idx = list.findIndex((l) => String(l.id) === String(id));
    if (idx === -1) throw new Error('Listing not found');

    list[idx] = {
      ...list[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.saveListings(list);
    return list[idx];
  }

  async deleteListing(id) {
    let list = this.getListings();
    list = list.filter((l) => String(l.id) !== String(id));
    this.saveListings(list);
    return { success: true };
  }

  // --- Favorites Handlers ---
  async getFavorites() {
    const favIds = this.getFavoritesList();
    const list = this.getListings();
    return list.filter((l) => favIds.includes(l.id));
  }

  async toggleFavorite(listingId) {
    let favIds = this.getFavoritesList();
    const id = Number(listingId);
    let isFavorited = false;
    if (favIds.includes(id)) {
      favIds = favIds.filter((f) => f !== id);
      isFavorited = false;
    } else {
      favIds.push(id);
      isFavorited = true;
    }
    this.saveFavoritesList(favIds);
    return { favorited: isFavorited, count: favIds.length };
  }

  // --- Inquiries Handlers ---
  async createInquiry(data) {
    const user = this.getCurrentUser();
    const inqs = this.getInquiries();
    const newInq = {
      id: Date.now(),
      listing_id: Number(data.listing_id),
      buyer_id: user ? user.id : 3,
      buyer_name: data.buyer_name || (user ? user.full_name : 'Verified Buyer'),
      buyer_email: data.buyer_email || (user ? user.email : 'buyer@cedro.com'),
      buyer_phone: data.buyer_phone || '+250 782 024 578',
      message: data.message || '',
      offer_amount: data.offer_amount ? Number(data.offer_amount) : null,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    inqs.unshift(newInq);
    this.saveInquiries(inqs);
    return newInq;
  }

  async getReceivedInquiries() {
    return this.getInquiries();
  }

  async getSentInquiries() {
    const user = this.getCurrentUser();
    const inqs = this.getInquiries();
    if (!user) return inqs;
    return inqs.filter((i) => String(i.buyer_id) === String(user.id));
  }

  async updateInquiryStatus(id, status) {
    const inqs = this.getInquiries();
    const inq = inqs.find((i) => String(i.id) === String(id));
    if (inq) {
      inq.status = status;
      this.saveInquiries(inqs);
    }
    return inq;
  }

  // --- Admin Duties Handlers ---
  async getAdminStats() {
    const list = this.getListings();
    const users = this.getUsers();
    const inqs = this.getInquiries();

    const totalVol = list.reduce((sum, l) => sum + (Number(l.price) || 0), 0);

    return {
      total_listings: list.length,
      total_users: users.length,
      total_inquiries: inqs.length,
      total_volume: totalVol,
      pending_listings: list.filter((l) => l.status === 'pending').length,
      available_listings: list.filter((l) => l.status === 'available').length,
      sold_listings: list.filter((l) => l.status === 'sold').length,
      active_users: users.filter((u) => u.is_active).length,
    };
  }

  async getAllUsers() {
    return this.getUsers();
  }

  async createAdminUser(userData) {
    return this.register(userData);
  }

  async updateUserRole(userId, role) {
    const users = this.getUsers();
    const user = users.find((u) => String(u.id) === String(userId));
    if (user) {
      user.role = role;
      this.saveUsers(users);
    }
    return user;
  }

  async toggleUserStatus(userId, is_active) {
    const users = this.getUsers();
    const user = users.find((u) => String(u.id) === String(userId));
    if (user) {
      user.is_active = is_active ? 1 : 0;
      this.saveUsers(users);
    }
    return user;
  }

  async adminResetPassword(userId, new_password) {
    return { success: true, message: 'Password reset successfully' };
  }

  async deleteUser(userId) {
    let users = this.getUsers();
    users = users.filter((u) => String(u.id) !== String(userId));
    this.saveUsers(users);
    return { success: true };
  }

  async toggleFeatureListing(listingId) {
    const list = this.getListings();
    const item = list.find((l) => String(l.id) === String(listingId));
    if (item) {
      item.is_featured = item.is_featured ? 0 : 1;
      this.saveListings(list);
    }
    return item;
  }

  async getAllAdminInquiries() {
    return this.getInquiries();
  }
}

export const mockStore = new MockStore();
