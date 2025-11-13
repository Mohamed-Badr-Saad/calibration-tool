import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  UserCog,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/CustomHooks/useAuth";
import { useUsers } from "@/CustomHooks/useUsers"; // <-- Your custom hook

// User interface
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
  jobTitle: "engineer" | "technician";
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const {
    users,
    loading,
    refresh,
    createUser,
    updateUser,
    removeUser,
    toggleStatus,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "user" as "admin" | "user",
    jobTitle: "engineer" as "engineer" | "technician",
  });

  // Save user (create or update)
  const handleSave = async () => {
    try {
      // Validation
      if (
        !newUser.email ||
        !newUser.name ||
        !newUser.role ||
        !newUser.jobTitle
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (!editing && !newUser.password) {
        toast.error("Password is required for new users");
        return;
      }
      if (newUser.password && newUser.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      let result;
      if (editing) {
        const updateData = { ...newUser };
        if (!updateData.password) delete updateData.password;
        result = await updateUser(editing._id!, updateData);
        toast.success("User updated successfully");
      } else {
        result = await createUser(newUser);
        toast.success("User created successfully");
      }
      // Reset form
      setOpen(false);
      setEditing(null);
      setNewUser({
        email: "",
        name: "",
        password: "",
        role: "user",
        jobTitle: "engineer",
      });
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  // Toggle user status
  const handleToggle = async (userId: string, isActive: boolean) => {
    try {
      await toggleStatus(userId, !isActive);
      toast.success(
        `User ${!isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await removeUser(userId);
        toast.success("User deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setEditing(user);
    setNewUser({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
      jobTitle: user.jobTitle,
    });
    setOpen(true);
  };

  // Filter users
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
  };

  // Access control
  if (currentUser?.role !== "admin") {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            Only the super admin can manage user accounts.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current user: {currentUser?.email}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
            {/* Stats */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {stats.admins}
                </div>
                <div className="text-xs text-gray-500">Admins</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setNewUser({
                        email: "",
                        name: "",
                        password: "",
                        role: "user",
                        jobTitle: "engineer",
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-amber-50">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      {editing ? "Edit User" : "Add New User"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name *</Label>
                      <Input
                        id="user-name"
                        placeholder="Enter full name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-job-title">Job Title *</Label>
                      <Select
                        value={newUser.jobTitle}
                        onValueChange={(value: "technician" | "engineer") => {
                          setNewUser({ ...newUser, jobTitle: value });
                        }}
                        required
                      >
                        <SelectTrigger
                          style={{
                            backgroundColor: "#fffbe8",
                            border: "1px solid blue",
                            boxShadow: "0 1px 3px rgba(0,0,2,1)",
                          }}
                          className="!bg-[#fffbe8] !border-[#d1d5db] !text-gray-900"
                        >
                          <SelectValue placeholder="Select job title" />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: "#fffbe8" }}>
                          <SelectItem value="engineer">Engineer</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email Address *</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="name@rashpetco.com"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">
                        {editing
                          ? "New Password (leave blank to keep current)"
                          : "Password *"}
                      </Label>
                      <Input
                        id="user-password"
                        type="password"
                        placeholder="Enter password (min. 6 characters)"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role *</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "admin" | "user") =>
                          setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger
                          style={{
                            backgroundColor: "#fffbe8",
                            border: "1px solid blue",
                            boxShadow: "0 1px 3px rgba(0,0,2,1)",
                          }}
                          className="!bg-[#fffbe8] !border-[#d1d5db] !text-gray-900"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: "#fffbe8" }}>
                          <SelectItem value="user">
                            <span className="flex items-center gap-2">
                              👤 User{" "}
                              <span className="text-xs text-gray-500">
                                - Regular access
                              </span>
                            </span>
                          </SelectItem>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-2">
                              🔰 Admin{" "}
                              <span className="text-xs text-gray-500">
                                - Full access
                              </span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={loading}>
                        {editing ? "Update User" : "Create User"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">
                      User
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Job Title
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Role
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Last Login
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Created
                    </th>
                    <th className="text-right p-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {user.name}
                              {user.email === "Mohamed.Ali@RASHPETCO.com" && (
                                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                  SUPER ADMIN
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize">
                        <Badge
                          variant="secondary"
                          className={
                            user.jobTitle === "engineer"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-pink-100 text-pink-800"
                          }
                        >
                          {user.jobTitle === "engineer" ? (
                            <UserCog className="h-5 w-5" />
                          ) : (
                            <Wrench className="h-5 w-5" />
                          )}

                          {user.jobTitle}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {user.role === "admin" ? "🔰 Admin" : "👤 User"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.isActive ? "✅ Active" : "❌ Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {user.email !== "Mohamed.Ali@RASHPETCO.com" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleToggle(user._id!, user.isActive)
                                }
                                className="h-8 w-8 p-0"
                                title={
                                  user.isActive
                                    ? "Deactivate user"
                                    : "Activate user"
                                }
                              >
                                {user.isActive ? (
                                  <UserX className="h-4 w-4 text-orange-600" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(user._id!)}
                                className="h-8 w-8 p-0"
                                title="Delete user"
                                style={{ color: "red" }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found</p>
                  {search && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
