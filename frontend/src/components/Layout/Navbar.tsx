import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  Search,
  Calendar,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Patient, Doctor } from '../../types';

type ProfileType = Patient | Doctor;
const isDoctor = (p: ProfileType): p is Doctor => 'speciality' in p;

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPatient = profile && !isDoctor(profile as any);

  // Build nav items dynamically based on role
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isPatient ? [{ to: '/doctor-seek', label: 'Doctor Seek', icon: Search }] : []),
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <Heart className="w-6 h-6 fill-primary-600" />
            <span>Nurser-E</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile && (
              <span className="hidden sm:block text-sm text-gray-600">
                {profile.fullName}
                <span className="ml-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full capitalize">
                  {isDoctor(profile) ? 'doctor' : 'patient'}
                </span>
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3 space-y-1 bg-white">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${location.pathname.startsWith(to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
