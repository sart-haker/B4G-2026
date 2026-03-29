import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Appointment } from '../types';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-gray-700 bg-gray-50', icon: Clock },
  requested: { label: 'Requested', color: 'text-amber-700 bg-amber-50', icon: Clock },
  booked: { label: 'Confirmed', color: 'text-blue-700 bg-blue-50', icon: Calendar },
  confirmed: { label: 'Confirmed', color: 'text-blue-700 bg-blue-50', icon: Calendar },
  done: { label: 'Done', color: 'text-green-700 bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700 bg-red-50', icon: XCircle },
} as const;

type AppointmentWithRelations = Appointment & {
  doctors?: {
    id: string;
    fullName?: string;
    practiceName?: string;
    speciality?: string;
    phone?: string;
    location?: string;
  } | null;
  patients?: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;
};

export default function Appointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'requested' | 'confirmed' | 'done' | 'cancelled'>('all');

  const activeUserId = profile?.id;

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointment_data')
        .select(`
          *,
          doctors (*),
          patients (*)
        `)
        .or(`patientId.eq.${activeUserId},doctorId.eq.${activeUserId}`)
        .order('createdAt', { ascending: false });

      console.log('Appointments query user id:', activeUserId);
      console.log('Appointments query result:', data);
      console.log('Appointments query error:', error);

      if (error) {
        console.error('Failed to load appointments:', error);
      }

      setAppointments((data as AppointmentWithRelations[]) || []);
      setLoading(false);
    }

    load();
  }, [activeUserId]);

  const filtered = appointments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return a.status === 'booked' || a.status === 'confirmed';
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your appointments</p>
        </div>
        <Link to="/doctor-seek" className="btn-primary flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          New Report
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'requested', 'confirmed', 'done', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center text-gray-400 py-10">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No appointments found</p>
          <p className="text-xs text-gray-400 mt-2">Using user id: {activeUserId}</p>
          <Link to="/doctor-seek" className="btn-primary mt-4 inline-flex">
            Start a Doctor Seek
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const cfg =
              STATUS_CONFIG[(appt.status as keyof typeof STATUS_CONFIG) || 'draft'] ||
              STATUS_CONFIG.draft;
            const Icon = cfg.icon;

            return (
              <Link
                key={appt.id}
                to={`/appointments/${appt.id}`}
                className="card hover:shadow-md transition-shadow flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{appt.title || 'Appointment'}</p>

                    <p className="text-sm text-gray-500 truncate">
                      {appt.recommended_speciality && (
                        <span className="text-primary-600 font-medium">
                          {appt.recommended_speciality} ·{' '}
                        </span>
                      )}
                      {appt.doctors?.fullName && (
                        <span>
                          Dr. {appt.doctors.fullName}
                          {appt.doctors.practiceName ? ` · ${appt.doctors.practiceName}` : ''}
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {appt.selected_time
                        ? `Scheduled for ${appt.selected_time}`
                        : new Date(appt.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}