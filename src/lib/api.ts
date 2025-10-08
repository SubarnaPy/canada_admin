// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API Client
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      return response.json();
    },

    signup: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
      return response.json();
    },

    getMe: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user');
      }
      return response.json();
    },

    checkAdmin: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/check-admin`);
      if (!response.ok) {
        throw new Error('Failed to check admin status');
      }
      return response.json();
    },
  },

  // Service endpoints (public)
  services: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    },

    getById: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/services/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service');
      }
      return response.json();
    },

    getByCategory: async (category: string) => {
      const response = await fetch(`${API_BASE_URL}/services/category/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    },
  },

  // Admin service endpoints (protected)
  admin: {
    services: {
      getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/services`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch services');
        }
        return response.json();
      },

      getById: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch service');
        }
        return response.json();
      },

      create: async (serviceData: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/services`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(serviceData),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create service');
        }
        return response.json();
      },

      update: async (id: number, serviceData: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(serviceData),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update service');
        }
        return response.json();
      },

      delete: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete service');
        }
        return response.json();
      },

      getNextId: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/services/next-id`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get next ID');
        }
        return response.json();
      },
    },
    // Payment endpoints (admin)
    payments: {
      getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/payments`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch payments');
        }
        return response.json();
      },

      updateStatus: async (id: string, status: string, notes?: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/payments/${id}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status, notes }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update payment status');
        }
        return response.json();
      },
    },
    // Refund endpoints (admin)
    refunds: {
      getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/refunds/all`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch refunds');
        }
        return response.json();
      },

      updateStatus: async (id: string, status: string, notes?: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/refunds/${id}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status, notes }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update refund status');
        }
        return response.json();
      },
    },
  },
  // User payment endpoints (for booking services)
  payments: {
    createCheckoutSession: async (serviceId: number) => {
      const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ serviceId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }
      return response.json();
    },

    getUserPayments: async () => {
      const response = await fetch(`${API_BASE_URL}/payments/my-payments`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user payments');
      }
      return response.json();
    },

    requestRefund: async (paymentId: string, reason: string) => {
      const response = await fetch(`${API_BASE_URL}/refunds/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentId, refundReason: reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request refund');
      }
      return response.json();
    },
  },
};

// Auth helper functions
export const authHelpers = {
  saveToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  getToken: getAuthToken,

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};
