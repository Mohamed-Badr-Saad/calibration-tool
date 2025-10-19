// src/context/AuthContext.tsx - FIXED VERSION
import { createContext, useState, useEffect, type ReactNode } from "react";
import { AuthAPI, type User, type SignupData, type AuthResponse } from "@/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (userData: SignupData) => Promise<AuthResponse>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user in localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);

    try {
      // 🔥 Use AuthAPI instead of direct fetch
      const response = await AuthAPI.login(email, password);

      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));

      return { success: true, message: response.message };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<AuthResponse> => {
    setIsLoading(true);

    try {
      // 🔥 Use AuthAPI instead of direct fetch
      const response = await AuthAPI.signup(userData);

      return {
        success: true,
        message: "Account created successfully! Please login.",
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Signup failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // 🔥 FIXED: removeItem not removeUser
    AuthAPI.removeStoredToken(); // Also remove auth token
  };

  const contextValue: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };
