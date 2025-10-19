// import { Routes, Route, Navigate } from "react-router-dom";
// import LoginPage from "../pages/LoginPage";
// import AdminDashboard from "../pages/AdminDashboard";
// import UserDashboard from "../pages/UserDashboard";
// import CalibrationPage from "../pages/calibration/CalibrationPage";
// import TransmitterPage from "@/pages/calibration/TransmitterPage";
// import GaugePage from "@/pages/calibration/GaugePage";

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" replace />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/admin" element={<AdminDashboard />} />
//       <Route path="/user" element={<UserDashboard />} />

//       {/* dynamic calibration route */}
//       {/* <Route path="/calibration/:formType" element={<CalibrationPage />} /> */}
//       <Route path="/calibration" element={<CalibrationPage />} />
//       {/* All user routes nested */}
//       <Route path="/calibration/transmitter" element={<TransmitterPage />} />
//       <Route path="/calibration/gauge" element={<GaugePage />} />
//     </Routes>
//   );
// }

// export default AppRoutes;


// src/AppRoutes.tsx - FIXED: Remove Router wrapper
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AuthRedirect } from '@/components/auth/ProtectedRoute';
import AuthPage from '@/components/auth/AuthPage';
import AdminDashboard from '@/pages/AdminDashboard';
import UserDashboard from '@/pages/UserDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Protected User Routes */}
      <Route path="/user/*" element={
        <ProtectedRoute requiredRole="user">
          <UserDashboard />
        </ProtectedRoute>
      } />
      
      {/* Root redirect */}
      <Route path="/" element={<AuthRedirect />} />
      
      {/* Catch all - redirect to auth */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
