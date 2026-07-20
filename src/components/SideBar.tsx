import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#172033] text-white p-4">
      <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/admin/instruments" className="hover:bg-[#22304a] p-2 rounded">
          Instruments
        </Link>
        <Link to="/admin/engineers" className="hover:bg-[#22304a] p-2 rounded">
          Engineers
        </Link>
        <Link to="/admin/technicians" className="hover:bg-[#22304a] p-2 rounded">
          Technicians
        </Link>
      </nav>
    </div>
  );
}
