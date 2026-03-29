import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Appointment, Patient, Doctor } from '../types';

type AppointmentWithRelations = Appointment & {
  doctors?: Doctor | null;
  patients?: Patient | null;
  pre_appointment_report?: Record<string, any> | null;
};

const isDoctorProfile = (p: Patient | Doctor): p is Doctor => 'speciality' in p;

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [appt, setAppt] = useState<AppointmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;

    const { data, error } = await supabase
      .from('appointment_data')
      .select(`
        *,
        doctors (*),
        patients (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to load appointment detail:', error);
    }

    setAppt((data as AppointmentWithRelations) || null);
    setLoading(false);
  }

  async function handleMarkDone() {
    if (!appt) return;

    setSaving(true);
    setError('');

    const { data, error } = await supabase
      .from('appointment_data')
      .update({
        status: 'done',
      })
      .eq('id', appt.id)
      .select(`
        *,
        doctors (*),
        patients (*)
      `)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setAppt(data as AppointmentWithRelations);
    }

    setSaving(false);
  }

  const statusPill = (status?: string) => {
    switch (status) {
      case 'booked':
      case 'confirmed':
        return 'bg-blue-50 text-blue-700';
      case 'done':
        return 'bg-green-50 text-green-700';
      case 'requested':
        return 'bg-amber-50 text-amber-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const displayStatus = (status?: string) => {
    if (status === 'booked') return 'confirmed';
    return status || 'draft';
  };

  if (loading) {
    return <div className="card text-center py-12 text-gray-400">Loading…</div>;
  }

  if (!appt) {
    return <div className="card text-center py-12 text-gray-500">Appointment not found.</div>;
  }

  const report = appt.pre_appointment_report || {};
  const patientProfile = appt.patients;
  const doctorProfile = appt.doctors;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          ← Back
        </button>

        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${statusPill(
            appt.status
          )}`}
        >
          {displayStatus(appt.status)}
        </span>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Patient</p>
              <p className="font-medium text-gray-800">{patientProfile?.fullName || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-health-50 rounded-lg">
              <Stethoscope className="w-5 h-5 text-health-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Doctor</p>
              <p className="font-medium text-gray-800">
                {doctorProfile?.fullName ? `Dr. ${doctorProfile.fullName}` : 'Unassigned'}
              </p>
              {doctorProfile?.speciality && (
                <p className="text-xs text-gray-500">{doctorProfile.speciality}</p>
              )}
              {doctorProfile?.practiceName && (
                <p className="text-xs text-gray-500">{doctorProfile.practiceName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Created</p>
              <p className="font-medium text-gray-800">
                {new Date(appt.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Scheduled Time</p>
              <p className="font-medium text-gray-800">
                {appt.selected_time || 'Not scheduled'}
              </p>
            </div>
          </div>
        </div>

        {(doctorProfile?.phone || doctorProfile?.location) && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm text-gray-600">
            {doctorProfile?.phone && <p><strong>Phone:</strong> {doctorProfile.phone}</p>}
            {doctorProfile?.location && <p><strong>Location:</strong> {doctorProfile.location}</p>}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Pre-Appointment Report
        </h2>

        <div className="space-y-4 text-sm">
          {appt.recommended_speciality && (
            <div className="bg-primary-50 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">
                Suggested Specialist
              </p>
              <p className="text-primary-800 font-semibold">{appt.recommended_speciality}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Structured Report
            </p>
            <pre className="whitespace-pre-wrap bg-gray-50 rounded-lg p-3 text-gray-800">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {profile && isDoctorProfile(profile) && appt.status !== 'done' && appt.status !== 'cancelled' && (
        <div className="card border-2 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-800 mb-2">Doctor Actions</h3>
          <p className="text-sm text-green-700 mb-4">
            Mark this appointment as done when the visit is complete.
          </p>
          <button
            onClick={handleMarkDone}
            disabled={saving}
            className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {saving ? 'Marking done…' : 'Mark Appointment as Done'}
          </button>
        </div>
      )}

      {appt.post_appointment_report && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Post-Appointment Report
          </h2>
          <pre className="whitespace-pre-wrap bg-gray-50 rounded-lg p-3 text-gray-800">
            {JSON.stringify(appt.post_appointment_report, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="card text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}