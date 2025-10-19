import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b shadow-sm p-4 flex gap-4 bg-white">
        <Link to="/admin"><Button variant="outline">Admin</Button></Link>
        <Link to="/user"><Button variant="outline">User</Button></Link>
        <Link to="/calibration/transmitter"><Button variant="outline">Transmitter</Button></Link>
        <Link to="/calibration/gauge"><Button variant="outline">Gauge</Button></Link>
        <Link to="/calibration/control-valve"><Button variant="outline">Control Valve</Button></Link>
        <Link to="/calibration/on-off-valve"><Button variant="outline">On/Off Valve</Button></Link>
        <Link to="/calibration/switch"><Button variant="outline">Switch</Button></Link>
        <Link to="/calibration/pcv"><Button variant="outline">PCV</Button></Link>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
