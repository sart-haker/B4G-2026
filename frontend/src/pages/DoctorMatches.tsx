import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookDoctor, getMatchingDoctors } from '../lib/api';

type Props = {
  reportId: string;
  speciality: string;
};

export default function DoctorMatches({ reportId, speciality }: Props) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDoctors() {
      try {
        const data = await getMatchingDoctors({ speciality });
        setDoctors(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load doctors');
      }
    }

    if (speciality) loadDoctors();
  }, [speciality]);

  async function handleBook(doctorId: string, selected_time: string) {
    try {
      await bookDoctor(reportId, { doctorId, selected_time });

      navigate('/patient-dashboard', {
        state: {
          bookingSuccess: true,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Booking failed');
    }
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Matching Doctors</h2>

      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}
        >
          <h3>{doctor.fullName}</h3>
          <p>{doctor.practiceName}</p>
          <p>Speciality: {doctor.speciality}</p>
          <p>Rating: {doctor.rating}</p>
          <p>Location: {doctor.location}</p>
          <p>Phone: {doctor.phone}</p>

          <div>
            <strong>Available Times:</strong>
            <div style={{ marginTop: 8 }}>
              {(doctor.timeAvailable || []).map((time: string) => (
                <button
                  key={time}
                  onClick={() => handleBook(doctor.id, time)}
                  style={{ marginRight: 8, marginBottom: 8 }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}