import { Routes, Route } from "react-router-dom";
import UserDashboard from "@/pages/UserDashboard";
// Calibration placeholders
import GaugePage from "@/pages/calibration/GaugePage";
import TransmitterPage from "@/pages/calibration/TransmitterPage";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
      <Route path="/calibration/transmitter" element={<TransmitterPage />} />
      <Route path="/calibration/gauge" element={<GaugePage />} />
      {/* ...other calibration pages */}
    </Routes>
  );
}
