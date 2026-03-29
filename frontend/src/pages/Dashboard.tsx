import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Search,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Appointment } from '../types';
import { isDoctor } from '../types';

type AppointmentWithRelations = Appointment & {
  doctors?: {
    id: string;
    fullName?: string;
    practiceName?: string;
    speciality?: string;
    phone?: string;
    location?: string;
  } | null;
};

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();

  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUserId = profile?.id;

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointment_data')
        .select(`
          *,
          doctors (*)
        `)
        .or(`patientId.eq.${activeUserId},doctorId.eq.${activeUserId}`)
        .order('createdAt', { ascending: false });

      console.log('Dashboard activeUserId:', activeUserId);
      console.log('Dashboard appointments:', data);
      console.log('Dashboard error:', error);

      if (error) {
        console.error('Failed to load dashboard appointments:', error);
      }

      setAppointments((data as AppointmentWithRelations[]) || []);
      setLoading(false);
    }

    load();
  }, [activeUserId]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft':
        return 'text-gray-700 bg-gray-50';
      case 'requested':
        return 'text-amber-700 bg-amber-50';
      case 'confirmed':
      case 'booked':
        return 'text-blue-700 bg-blue-50';
      case 'done':
        return 'text-green-700 bg-green-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const displayStatus = (s: string) => {
    if (s === 'booked') return 'confirmed';
    return s;
  };

  const isPatient = !profile || !isDoctor(profile as any);
  const firstName = profile?.fullName?.split(' ')[0];

  const currentAppointments = appointments.filter(
    (a) => a.status === 'booked' || a.status === 'confirmed'
  );

  const pastAppointments = appointments.filter(
    (a) => a.status === 'done' || a.status === 'cancelled'
  );

  const draftAppointments = appointments.filter((a) => a.status === 'draft');

  return (
    <div className="space-y-8">
      {location.state?.bookingSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Appointment booked successfully.</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-primary-100">
          {isPatient
            ? 'How are you feeling today? Describe your symptoms to get started.'
            : `Managing appointments as ${(profile as any)?.speciality || 'Doctor'}.`}
        </p>

        {isPatient && (
          <Link
            to="/doctor-seek"
            className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            Start Doctor Seek
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Appointments',
            value: appointments.length,
            icon: Calendar,
            color: 'text-primary-600 bg-primary-50',
          },
          {
            label: 'Draft',
            value: draftAppointments.length,
            icon: Clock,
            color: 'text-gray-600 bg-gray-50',
          },
          {
            label: 'Current',
            value: currentAppointments.length,
            icon: Activity,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Completed',
            value: pastAppointments.filter((a) => a.status === 'done').length,
            icon: CheckCircle,
            color: 'text-green-600 bg-green-50',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {isPatient && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/doctor-seek"
              className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Doctor Seek</p>
                <p className="text-xs text-gray-500">Describe symptoms & get report</p>
              </div>
            </Link>

            <Link
              to="/appointments"
              className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Appointments</p>
                <p className="text-xs text-gray-500">View & manage appointments</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800">My Records</p>
                <p className="text-xs text-gray-500">Past medical history</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Current Appointments</h2>
          <Link to="/appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="card text-center text-gray-500 py-8">Loading…</div>
        ) : currentAppointments.length === 0 ? (
          <div className="card text-center text-gray-500 py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No current appointments.</p>
            <p className="text-xs text-gray-400 mt-2">Using user id: {activeUserId}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentAppointments.map((appt) => (
              <Link
                key={appt.id}
                to={`/appointments/${appt.id}`}
                className="card hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {appt.title || 'Appointment'}
                  </p>

                  <p className="text-sm text-gray-500">
                    {appt.doctors?.fullName
                      ? `Dr. ${appt.doctors.fullName}${appt.doctors.practiceName ? ` · ${appt.doctors.practiceName}` : ''}`
                      : 'Doctor not assigned'}
                  </p>

                  <p className="text-sm text-gray-500">
                    {appt.selected_time
                      ? `Scheduled for ${appt.selected_time}`
                      : new Date(appt.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColor(
                    appt.status
                  )}`}
                >
                  {displayStatus(appt.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Past Appointments</h2>
          <Link to="/appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="card text-center text-gray-500 py-8">Loading…</div>
        ) : pastAppointments.length === 0 ? (
          <div className="card text-center text-gray-500 py-10">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No past appointments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((appt) => (
              <Link
                key={appt.id}
                to={`/appointments/${appt.id}`}
                className="card hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {appt.title || 'Appointment'}
                  </p>

                  <p className="text-sm text-gray-500">
                    {appt.doctors?.fullName
                      ? `Dr. ${appt.doctors.fullName}${appt.doctors.practiceName ? ` · ${appt.doctors.practiceName}` : ''}`
                      : 'Doctor not assigned'}
                  </p>

                  <p className="text-sm text-gray-500">
                    {appt.selected_time
                      ? `Occurred on ${appt.selected_time}`
                      : new Date(appt.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColor(
                    appt.status
                  )}`}
                >
                  {displayStatus(appt.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}