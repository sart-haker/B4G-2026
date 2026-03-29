import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, AlertCircle, Phone, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PatientSignUpData, DoctorSignUpData } from '../context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // Patient specific
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  // Doctor specific
  const [speciality, setSpeciality] = useState('');
  const [practiceName, setPracticeName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Don't allow submission if already loading
    if (loading) {
      return;
    }

    setError('');

    // Validation checks
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    if (!gender.trim()) {
      setError('Gender is required');
      return;
    }

    if (!age.trim()) {
      setError('Age is required');
      return;
    }

    if (role === 'doctor') {
      if (!speciality.trim()) {
        setError('Speciality is required');
        return;
      }
      if (!practiceName.trim()) {
        setError('Practice name is required');
        return;
      }
    }

    setLoading(true);
    try {
      // Build profileData based on role
      if (role === 'patient') {
        const profileData: PatientSignUpData = {
          fullName,
          email,
          phone: phone.trim() || '',
          location: location.trim() || '',
          gender: gender.trim() || '',
          age: age ? parseInt(age) : 0,
          password,
          medicalHistory: {},
        };
        await signUp(email, password, profileData, role);
      } else {
        const profileData: DoctorSignUpData = {
          fullName,
          email,
          phone: phone.trim() || '',
          location: location.trim() || '',
          speciality: speciality.trim() || '',
          practiceName: practiceName.trim() || '',
          gender: gender.trim() || '',
          age: age ? parseInt(age) : 0,
          password,
        };
        await signUp(email, password, profileData, role);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      // Handle rate limit errors specifically
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        setError('Too many signup attempts. Please wait a few minutes before trying again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-health-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nurser-E</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Join Nurser-E</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {(['patient', 'doctor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-colors capitalize ${role === r
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Phone number - for both roles */}
            <div>
              <label className="label">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  className="input pl-10"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Location - for both roles */}
            <div>
              <label className="label">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Gender and Age - for both roles */}
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="label">Age</label>
              <input
                type="number"
                className="input"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                max="150"
              />
            </div>

            {/* Doctor-specific fields */}
            {role === 'doctor' && (
              <>
                <div>
                  <label className="label">Speciality</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Cardiology, Dermatology"
                    value={speciality}
                    onChange={(e) => setSpeciality(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">Practice name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="e.g., City Hospital, Private Clinic"
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !fullName.trim() ||
                !email.trim() ||
                password.length < 6 ||
                !phone.trim() ||
                !location.trim() ||
                !gender.trim() ||
                !age.trim() ||
                (role === 'doctor' && (!speciality.trim() || !practiceName.trim()))
              }
              className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
