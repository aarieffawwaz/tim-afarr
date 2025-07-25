// src/router/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react"; // <-- TAMBAHKAN BARIS INI

interface ProtectedRouteProps {
  children: ReactNode; // <-- UBAH BAGIAN INI
  allowedRoles: Array<"admin" | "volunteer">;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. Jika tidak terautentikasi, lempar ke halaman login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Jika user ada tapi rolenya tidak diizinkan, lempar ke halaman utama
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Jika semua syarat terpenuhi, tampilkan halamannya
  return children;
}
