import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/CustomHooks/useAuth";
import UserDashboard from "@/pages/UserDashboard";

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">RASHPETCO</span>
            <span className="text-xs rounded bg-blue-100 text-blue-700 px-2 ml-2">
              User Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* User details */}
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <User className="h-4 w-4 inline -mt-1 mr-1" />
              {user?.role}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-2 py-8">
        <Routes>
          <Route path="/*" element={<UserDashboard />} />
          <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
