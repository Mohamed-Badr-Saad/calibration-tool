import { Routes, Route, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InstrumentsTable from "@/components/admin/InstrumentsTable";
import EngineersTable from "@/components/admin/EngineersTable";
import TechniciansTable from "@/components/admin/TechniciansTable";
import UserManagement from "@/components/admin/UserManagement";
import AdminDashboard from "@/pages/AdminDashboard";
import {
  Settings,
  Users,
  Wrench,
  UserCog,
  LogOut,
  Shield,
  Building2,
  BarChart3,
  ChartSpline,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/CustomHooks/useAuth"; // 🔥 FIXED: Correct import path
import ToleranceTable from "../admin/ToleranceTable";
import UserDashboard from "@/pages/UserDashboard";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth", { replace: true });
  };

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Overview and statistics",
    },
    {
      path: "/admin/user/dashboard",
      label: "Calibration sheet management",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      description: "Manage Calibration sheets",
    },
    {
      path: "/admin/instruments",
      label: "Instruments",
      icon: <Settings className="h-5 w-5" />,
      description: "Manage instruments",
    },
    {
      path: "/admin/engineers",
      label: "Engineers",
      icon: <UserCog className="h-5 w-5" />,
      description: "Manage engineers",
    },
    {
      path: "/admin/technicians",
      label: "Technicians",
      icon: <Wrench className="h-5 w-5" />,
      description: "Manage technicians",
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
      description: "Manage system users",
    },
    {
      path: "/admin/tolerances",
      label: "Tolerance Settings",
      icon: <ChartSpline className="h-5 w-5" />,
      description: "Manage tolerance settings",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] w-screen text-[#172033]">
      {/* Header */}
      <header className="bg-white/95 shadow-sm border-b border-[#dbe3ee] backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* <Building2 className="h-8 w-8 text-blue-600" /> */}
              <div>
                <img
                  src={"/Rashid-icon.ico"}
                  alt="Rashid Logo"
                  className="w-[50px]"
                />
              </div>
              <span className="text-lg font-bold text-[#172033]">RASHPETCO</span>
              <span className="text-xs rounded border border-[#b7cbea] bg-[#e8f1ff] text-[#173b6c] px-2 ml-2">
                Admin Portal
              </span>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#172033]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#5d6b82]">{user?.email}</p>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Shield className="h-8 w-8 text-[#2463a6] bg-[#e8f1ff] rounded-full p-1" />
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#e8f1ff] text-[#173b6c]"
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#5d6b82] hover:text-[#b42318] hover:bg-[#fff0f0]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[#dbe3ee] bg-white/70 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-3 mt-3 overflow-x-auto">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-3 text-sm font-medium transition-colors flex items-center space-x-2 border-b-2 rounded-t-md ${
                  isActive(item.path)
                    ? "text-[#173b6c] border-[#2463a6] bg-[#e8f1ff]"
                    : "text-[#5d6b82] hover:text-[#173b6c] border-transparent hover:border-[#9eb6d4] hover:bg-[#f4f7fb]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Default route - Dashboard */}
          <Route index element={<AdminDashboard />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Individual Tables */}
          <Route
            path="user/dashboard"
            element={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Calibration Sheet Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserDashboard />
                </CardContent>
              </Card>
            }
          />
          <Route
            path="instruments"
            element={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Instruments Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InstrumentsTable />
                </CardContent>
              </Card>
            }
          />

          <Route
            path="engineers"
            element={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCog className="h-5 w-5" />
                    <span>Engineers Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EngineersTable />
                </CardContent>
              </Card>
            }
          />

          <Route
            path="technicians"
            element={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5" />
                    <span>Technicians Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TechniciansTable />
                </CardContent>
              </Card>
            }
          />

          <Route
            path="users"
            element={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            }
          />

          <Route
            path="tolerances"
            element={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Tolerances Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ToleranceTable />
                </CardContent>
              </Card>
            }
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
