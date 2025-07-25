// src/components/layout/AdminLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

import logo from "@/assets/logo.png";

const navItems = [
  { name: "Home", path: "/admin/dashboard" },
  { name: "Volunteers", path: "/admin/volunteers" },
  { name: "Activities", path: "/admin/activities" },
  { name: "AI Matchmaking", path: "/admin/matchmaking" },
];

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col">
        <img src={logo} alt="Logo Perusahaan" className="h-11 mb-10 mx-auto" />
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <Button onClick={logout} variant="outline" className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet /> {/* Di sini halaman-halaman admin akan ditampilkan */}
      </main>
    </div>
  );
}
