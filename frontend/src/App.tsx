import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorSeek from './pages/DoctorSeek';
import Appointments from './pages/Appointments';
import AppointmentDetail from './pages/AppointmentDetail';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import PatientIntake from './pages/PatientIntake';
import FollowUpQuestions from './pages/followUpQuestions';
import ReportResult from './pages/reportResult';
import PatientDashboard from './pages/patientDashboard';


const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Loading…</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/intake" element={<PatientIntake />} />
      <Route path="/follow-up" element={<FollowUpQuestions />} />
      <Route path="/report-result" element={<ReportResult />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctor-seek" element={<DoctorSeek />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/post/:id" element={<PostDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
