import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User} from "lucide-react";
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
    <div className="min-h-screen w-screen bg-[#f4f7fb] text-[#172033]">
      <header className="bg-white/95 shadow-sm border-b border-[#dbe3ee] backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            {/* <Building2 className="h-8 w-8 text-blue-600" /> */}
            <div>
              <img src={"/Rashid-icon.ico"} alt="Rashid Logo" className="w-[50px]" />
            </div>
            <span className="text-lg font-bold text-[#172033]">RASHPETCO</span>
            <span className="text-xs rounded border border-[#b7cbea] bg-[#e8f1ff] text-[#173b6c] px-2 ml-2">
              User Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* User details */}
            <div className="text-right">
              <p className="text-xs font-medium text-[#172033]">{user?.name}</p>
              <p className="text-xs text-[#5d6b82]">{user?.email}</p>
            </div>
            <Badge variant="secondary" className="bg-[#e8f1ff] text-[#173b6c]">
              <User className="h-4 w-4 inline -mt-1 mr-1" />
              {user?.role}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#5d6b82] hover:text-[#b42318] hover:bg-[#fff0f0]">
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
