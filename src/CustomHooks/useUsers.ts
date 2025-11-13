import type { User } from "@/types";
import { createContext, useContext } from "react";



// Define the context type
export interface UserContextType {
  users: User[];
  loading: boolean;
  refresh: () => Promise<void>;
  createUser: (data: Omit<User, "_id" | "isActive" | "lastLogin" | "createdAt" | "createdBy"> & {password: string;}) => Promise<User | undefined>;
  updateUser: (id: string, data: Partial<User> & { password?: string }) => Promise<User | undefined>;
  removeUser: (id: string) => Promise<void>;
  toggleStatus: (id: string, isActive: boolean) => Promise<User | undefined>;
}
// Create the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook
export const useUsers = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsers must be used within a UserProvider");
  return ctx;
};
