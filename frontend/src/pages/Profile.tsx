import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  User, Calendar,
  Star, Edit3, Save, X, Phone, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Patient, Doctor, Appointment } from '../types';

type ProfileType = Patient | Doctor;

const isDoctor = (p: ProfileType | Partial<ProfileType>): p is Doctor => 'speciality' in p;

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>();
  const { profile: myProfile, refreshProfile } = useAuth();
  const isOwnProfile = !id || id === myProfile?.id;
  const targetId = id || myProfile?.id;

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileType>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (targetId) load(targetId);
  }, [targetId]);

  async function load(uid: string) {
    // In DEMO MODE: check if this is the current user's profile
    if (isOwnProfile && myProfile) {
      setProfile(myProfile);
      setEditForm(myProfile);
    } else {
      // Try to load from Supabase if viewing another profile
      let { data: p } = await supabase.from('patients').select('*').eq('id', uid).single();

      if (!p) {
        const { data: d } = await supabase.from('doctors').select('*').eq('id', uid).single();
        p = d;
      }

      if (p) {
        setProfile(p as ProfileType);
        setEditForm(p);
      }
    }

    // Fetch appointments
    if (profile) {
      const { data: appts } = await supabase
        .from('appointment_data')
        .select('*')
        .eq(isDoctor(profile) ? 'doctorId' : 'patientId', uid)
        .order('createdAt', { ascending: false });

      setAppointments((appts as Appointment[]) || []);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      // In DEMO MODE: update local profile in auth context
      if (isOwnProfile && myProfile) {
        const updates: Record<string, any> = {
          fullName: editForm.fullName,
          phone: editForm.phone,
          location: editForm.location,
          gender: editForm.gender,
        };

        if (isDoctor(editForm)) {
          updates.speciality = editForm.speciality;
        }

        if (!isDoctor(editForm) && (editForm as any).medicalHistory) {
          updates.medicalHistory = (editForm as any).medicalHistory;
        }

        // Update local state
        const updatedProfile = { ...profile, ...updates } as ProfileType;
        setProfile(updatedProfile);
        setEditForm(updatedProfile);

        // For real Supabase: try to persist (will fail in DEMO MODE but that's ok)
        const table = isDoctor(profile) ? 'doctors' : 'patients';
        await supabase.from(table).update(updates).eq('id', profile.id);

        await refreshProfile();
        setEditing(false);
      } else {
        // Trying to edit someone else's profile - not allowed in DEMO MODE
        alert('You can only edit your own profile.');
        setSaving(false);
        return;
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const avgRating = appointments.length
    ? (appointments
      .filter((a) => a.doctor_rating)
      .reduce((sum, a) => sum + (a.doctor_rating || 0), 0) /
      appointments.filter((a) => a.doctor_rating).length).toFixed(1)
    : null;

  if (loading) return <div className="card text-center py-12 text-gray-400">Loading…</div>;
  if (!profile) return <div className="card text-center py-12 text-gray-500">Profile not found.</div>;

  const doctorProfile = isDoctor(profile) ? profile : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile.fullName?.[0] || 'U'}
            </div>
            <div>
              {editing ? (
                <input
                  className="input text-xl font-bold mb-1"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              )}
              <span className={`text-sm px-3 py-0.5 rounded-full capitalize font-medium ${doctorProfile ? 'bg-blue-50 text-blue-700' : 'bg-health-50 text-health-700'
                }`}>
                {doctorProfile ? 'doctor' : 'patient'}
              </span>
              {doctorProfile?.speciality && (
                <p className="text-gray-500 text-sm mt-0.5">{doctorProfile.speciality}</p>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="btn-secondary p-2">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary p-2">
                    <Save className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Doctor avg rating */}
        {doctorProfile && avgRating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${n <= parseFloat(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
            <span className="text-sm text-gray-400">
              ({appointments.filter((a) => a.doctor_rating).length} rating
              {appointments.filter((a) => a.doctor_rating).length !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Profile fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {editing ? (
            <>
              {doctorProfile && (
                <div>
                  <label className="label">Specialty</label>
                  <input
                    className="input"
                    value={(editForm as any).speciality || ''}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, speciality: e.target.value }))
                    }
                  />
                </div>
              )}
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  className="input"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  className="input"
                  value={editForm.gender || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {!doctorProfile && (
                <div className="sm:col-span-2">
                  <label className="label">Medical History Notes</label>
                  <textarea
                    className="input h-24 resize-none"
                    placeholder="Add any important medical history notes…"
                    value={
                      Object.values((editForm as any).medicalHistory || {})
                        .join('\n') || ''
                    }
                    onChange={(e) => {
                      const notes = e.target.value
                        .split('\n')
                        .filter((n) => n.trim());
                      const medicalHistory: Record<string, string> = {};
                      notes.forEach((note, idx) => {
                        medicalHistory[`note_${Date.now()}_${idx}`] = note;
                      });
                      setEditForm((f) => ({
                        ...f,
                        medicalHistory,
                      }));
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {profile.phone}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {profile.location}
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{profile.gender}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Medical History for Patients */}
      {!doctorProfile && (profile as Patient).medicalHistory && Object.keys((profile as Patient).medicalHistory).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical History</h3>
          <div className="space-y-2">
            {Object.values((profile as Patient).medicalHistory).map((note, idx) => (
              <div key={idx} className="text-sm text-gray-700 p-2 bg-gray-50 rounded border border-gray-200">
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Appointments
        </h2>
        {appointments.filter((a) => a.status === 'done').length === 0 ? (
          <div className="card text-center text-gray-400 py-8">No completed appointments.</div>
        ) : (
          <div className="space-y-3">
            {appointments
              .filter((a) => a.status === 'done')
              .map((appt) => (
                <div key={appt.id} className="card text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{appt.title || 'Appointment'}</p>
                    {appt.recommended_speciality && (
                      <p className="text-xs text-gray-500">{appt.recommended_speciality}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(appt.createdAt).toLocaleDateString()}
                    </p>
                    {appt.doctor_rating && (
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3 h-3 ${n <= appt.doctor_rating!
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
