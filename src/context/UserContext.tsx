import { useState, useEffect, type ReactNode } from "react";
import { API_URL } from "@/api";
import type { User } from "@/types";
import { UserContext, type UserContextType } from "@/CustomHooks/useUsers";




// Context provider implementation
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getToken = () => localStorage.getItem("authToken");
  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  const createUser: UserContextType["createUser"] = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error(await res.text());
      const { user } = await res.json();
      setUsers((prev) => [user, ...prev]);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const updateUser: UserContextType["updateUser"] = async (id, data) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const { user } = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === user._id ? user : u)));
      return user;
    } finally {
      setLoading(false);
    }
  };

  const removeUser: UserContextType["removeUser"] = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus: UserContextType["toggleStatus"] = async (id, isActive) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { user } = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === user._id ? user : u)));
      return user;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        refresh,
        createUser,
        updateUser,
        removeUser,
        toggleStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

