// src/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Layouts
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VolunteerRegistrationPage from "@/pages/volunteer/VolunteerRegistrationPage";
import AdminDashboardPage from "@/pages/admin/DashboardPage";
import VolunteersListPage from "@/pages/admin/VolunteersListPage";
import VolunteerDetailPage from "@/pages/admin/VolunteerDetailPage";
import ActivitiesListPage from "@/pages/admin/ActivitiesListPage";
import ActivityFormPage from "@/pages/admin/ActivityFormPage"; // <-- Impor halaman form baru
import MatchmakingListPage from "@/pages/admin/MatchmakingListPage";
import MatchmakingDetailPage from "@/pages/admin/MatchmakingDetailPage";

const PlaceholderPage = ({ title }: { title: string }) => (
  <h1 className="text-3xl font-bold">{title}</h1>
);

const AppRouter = () => {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rute Admin dengan Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="volunteers" element={<VolunteersListPage />} />
        <Route path="volunteers/:id" element={<VolunteerDetailPage />} />
        <Route path="activities" element={<ActivitiesListPage />} />
        {/* Rute baru untuk Create dan Edit */}
        <Route path="activities/new" element={<ActivityFormPage />} />
        <Route path="activities/edit/:id" element={<ActivityFormPage />} />
        <Route path="matchmaking" element={<MatchmakingListPage />} />
        <Route path="matchmaking/:id" element={<MatchmakingDetailPage />} />
      </Route>

      {/* Rute Volunteer */}
      <Route
        path="/volunteer/register-profile"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerRegistrationPage />
          </ProtectedRoute>
        }
      />

      {/* Rute Default setelah login */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin", "volunteer"]}>
            <HomePageRedirect />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function HomePageRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/volunteer/register-profile" replace />;
}

export default AppRouter;
