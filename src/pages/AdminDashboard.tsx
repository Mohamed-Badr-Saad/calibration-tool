import { Routes, Route, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Settings,
  Users,
  Wrench,
  UserCog,
  ChartSpline,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import UserManagement from "@/components/admin/UserManagement";
import InstrumentTable from "@/components/admin/InstrumentsTable";
import EngineerTable from "@/components/admin/EngineersTable";
import TechnicianTable from "@/components/admin/TechniciansTable";
import { useAuth } from "@/CustomHooks/useAuth";
import ToleranceTable from "@/components/admin/ToleranceTable";
import UserDashboard from "./UserDashboard";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#172033]">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  RASHPETCO Admin
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <Badge className="bg-[#f9d3d3] text-red-800">Admin</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/instruments" element={<InstrumentTable />} />
          <Route path="/engineers" element={<EngineerTable />} />
          <Route path="/technicians" element={<TechnicianTable />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/tolerances" element={<ToleranceTable />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

// Admin Home Component
function AdminHome() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#dbe3ee] bg-white px-6 py-5 shadow-sm">
        <h2 className="text-2xl font-bold text-[#172033]">Dashboard Overview</h2>
        <p className="text-[#5d6b82]">Manage your instrument tracking system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Calibration Sheets"
          icon={<FileSpreadsheet className="h-6 w-6 text-[#16804a]" />}
          href="/admin/user/dashboard"
          description="Calibration sheet management"
          accentClass="bg-[#d9f3e4]"
        />
        <DashboardCard
          title="Instruments"
          icon={<Settings className="h-6 w-6 text-[#2463a6]" />}
          href="/admin/instruments"
          description="Manage instrument database"
          accentClass="bg-[#e8f1ff]"
        />
        <DashboardCard
          title="Engineers"
          icon={<UserCog className="h-6 w-6 text-[#16804a]" />}
          href="/admin/engineers"
          description="Manage engineering staff"
          accentClass="bg-[#d9f3e4]"
        />
        <DashboardCard
          title="Technicians"
          icon={<Wrench className="h-6 w-6 text-[#b25c18]" />}
          href="/admin/technicians"
          description="Manage technical staff"
          accentClass="bg-[#ffe4cc]"
        />
        <DashboardCard
          title="User Management"
          icon={<Users className="h-6 w-6 text-[#6f45a8]" />}
          href="/admin/users"
          description="Manage user accounts"
          accentClass="bg-[#eadcf8]"
        />
        <DashboardCard
          title="Tolerance Settings"
          icon={<ChartSpline className="h-6 w-6 text-[#b42318]" />}
          href="/admin/tolerances"
          description="Manage tolerance settings"
          accentClass="bg-[#f9d3d3]"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon,
  href,
  description,
  accentClass,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  description: string;
  accentClass: string;
}) {
  const navigate = useNavigate();

  return (
    <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[#9eb6d4] hover:shadow-[0_16px_40px_rgba(23,32,51,0.12)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className={`rounded-lg p-2 ${accentClass}`}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#5d6b82] mb-4">{description}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigate(href);
          }}
          className="w-full"
        >
          Manage
        </Button>
      </CardContent>
    </Card>
  );
}
