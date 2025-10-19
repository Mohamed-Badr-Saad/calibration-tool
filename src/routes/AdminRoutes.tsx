import { Route } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import InstrumentsTable from "@/components/admin/InstrumentsTable";
import EngineersTable from "@/components/admin/EngineersTable";
import TechniciansTable from "@/components/admin/TechniciansTable";
import UserManagement from "@/components/admin/UserManagement";

export const adminRoutes = (
  <>
    <Route index element={<AdminDashboard />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="instruments" element={<InstrumentsTable />} />
    <Route path="engineers" element={<EngineersTable />} />
    <Route path="technicians" element={<TechniciansTable />} />
    <Route path="users" element={<UserManagement />} />
  </>
);
