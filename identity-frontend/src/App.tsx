import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/authApi';
import { Loader2 } from 'lucide-react';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './features/users/UsersPage';
import RolesPage from './features/roles/RolesPage';
import DepartmentsPage from './features/departments/DepartmentsPage';
import EquipmentPage from './features/equipment/EquipmentPage';
import MetersPage from './features/meters/MetersPage';
import LogsPage from './features/logs/LogsPage';
import ProfilePage from './features/profile/ProfilePage';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.roleName !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  const { token, isAuthenticated, login, logout } = useAuthStore();
  const [init, setInit] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (token && isAuthenticated) {
        try {
          // Verify token and fetch fresh user details
          const user = await authApi.getMe();
          // We use a dummy LoginResponse format since the store.login expects it,
          // or we could add an 'updateUser' method to store.
          // For simplicity, we just keep the current state if it works, 
          // or better, we wrap the login logic.
          useAuthStore.setState({ user }); 
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setInit(true);
    };

    checkSession();
  }, [token, isAuthenticated, logout]);

  if (!init) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<ProtectedRoute requireAdmin><UsersPage /></ProtectedRoute>} />
          <Route path="roles" element={<ProtectedRoute requireAdmin><RolesPage /></ProtectedRoute>} />
          <Route path="departments" element={<ProtectedRoute requireAdmin><DepartmentsPage /></ProtectedRoute>} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="meters" element={<MetersPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
