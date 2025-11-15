import type {
  Engineer,
  Instrument,
  Technician,
  ToleranceSettings,
} from "./types";

// export const API_URL = "http://localhost:5000/api"; //local api url

// export const API_URL = "https://calibration-tool-server.vercel.app/api"; //vercel api url

export const API_URL = "/api";  // Calls to the same deployment where frontend lives (serverless vercel feature)


// 🔥 Token Management
const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

const setToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

const removeToken = (): void => {
  localStorage.removeItem("authToken");
};

// 🔥 Enhanced request function with authentication
async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  const data = await res.json();
  return data;
}

// 🔥 User Management Types
export interface User {
  _id?: string;
  email: string;
  name: string;
  password?: string;
  role: "admin" | "user";
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  jobTitle: "technician" | "engineer";
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  jobTitle: "technician" | "engineer";
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

// 🔥 NEW: User Management API
export const UserAPI = {
  // Get all users (Super admin only)
  getAll: async (): Promise<User[]> => {
    return request("/admin/users");
  },

  // Create new user (Super admin only)
  create: async (userData: {
    email: string;
    name: string;
    password: string;
    role: "admin" | "user";
    jobTitle: "technician" | "engineer";
  }): Promise<{ message: string; user: User }> => {
    return request("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Update user (Super admin only)
  update: async (
    id: string,
    userData: {
      email: string;
      name: string;
      password?: string;
      role: "admin" | "user";
      jobTitle: "technician" | "engineer";
    }
  ): Promise<{ message: string; user: User }> => {
    return request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // Toggle user status (Super admin only)
  toggleStatus: async (
    id: string,
    isActive: boolean
  ): Promise<{ message: string; user: User }> => {
    return request(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  // Delete user (Super admin only)
  remove: async (id: string): Promise<{ message: string }> => {
    return request(`/admin/users/${id}`, { method: "DELETE" });
  },
};

// 🔥 Authentication API
export const AuthAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Store token after successful login
    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  signup: async (
    userData: SignupData
  ): Promise<{ message: string; user: User }> => {
    return request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: async (): Promise<{ message: string }> => {
    try {
      const response = await request("/auth/logout", { method: "POST" });
      removeToken();
      return response;
    } catch (error) {
      // Even if server request fails, remove token locally
      removeToken();
      return { message: "Logged out successfully" };
    }
  },

  getCurrentUser: (): Promise<User> => {
    return request("/auth/me");
  },

  // Token management helpers
  getStoredToken: getToken,
  setStoredToken: setToken,
  removeStoredToken: removeToken,
};

// Existing APIs...
export const InstrumentAPI = {
  getAll: (): Promise<Instrument[]> => request("/instruments"),
  create: (data: Instrument): Promise<Instrument> =>
    request("/instruments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Instrument): Promise<Instrument> =>
    request(`/instruments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ message: string }> =>
    request(`/instruments/${id}`, { method: "DELETE" }),
};

export const EngineerAPI = {
  getAll: (): Promise<Engineer[]> => request("/engineers"),
  create: (data: Engineer): Promise<Engineer> =>
    request("/engineers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Engineer): Promise<Engineer> =>
    request(`/engineers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ message: string }> =>
    request(`/engineers/${id}`, { method: "DELETE" }),
};

export const TechnicianAPI = {
  getAll: (): Promise<Technician[]> => request("/technicians"),
  create: (data: Technician): Promise<Technician> =>
    request("/technicians", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Technician): Promise<Technician> =>
    request(`/technicians/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: string): Promise<{ message: string }> =>
    request(`/technicians/${id}`, { method: "DELETE" }),
};

export const ToleranceAPI = {
  get: (): Promise<ToleranceSettings> => request("/tolerances"),
  update: (data: Partial<ToleranceSettings>): Promise<ToleranceSettings> =>
    request("/tolerances", { method: "PUT", body: JSON.stringify(data) }),
};
