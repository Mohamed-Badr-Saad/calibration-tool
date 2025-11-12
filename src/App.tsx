import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/CustomHooks/useAuth";
import AuthPage from "@/components/auth/AuthPage";
import AdminLayout from "./components/layouts/AdminLayout";
import UserLayout from "./components/layouts/UserLayout";
import CalibrationPage from "./pages/calibration/CalibrationPage";

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Route guard component
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return <>{children}</>;
}

// Auth redirect component - redirects logged in users away from auth page
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    // Redirect based on user role
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return <>{children}</>;
}

// Root redirect component
function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    // Redirect based on user role
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return <Navigate to="/auth" replace />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/auth"
          element={
            <AuthRedirect>
              <AuthPage />
            </AuthRedirect>
          }
        />
        <Route path="/calibration-sheets" element={<CalibrationPage />} />
        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute requiredRole="user">
              <UserLayout />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Legacy redirects */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/dashboard" element={<Navigate to="/user" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

export default App;
