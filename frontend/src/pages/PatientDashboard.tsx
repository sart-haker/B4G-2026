import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TEST_PATIENT_ID = '9334a195-9b3a-4ed7-a918-1046d87b8b51';

export default function PatientDashboard() {
  const location = useLocation();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function loadAppointments() {
      const res = await fetch(
        `http://localhost:3001/api/profile/patient/${TEST_PATIENT_ID}/appointments`
      );
      const data = await res.json();
      setAppointments(data || []);
    }

    loadAppointments();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1>Patient Dashboard</h1>

      {location.state?.bookingSuccess && (
        <div style={{ background: '#d1fae5', padding: 12, marginBottom: 16 }}>
          Appointment booked successfully.
        </div>
      )}

      <h2>Appointments</h2>

      {appointments.map((appt) => (
        <div
          key={appt.id}
          style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}
        >
          <p><strong>Status:</strong> {appt.status}</p>
          <p><strong>Selected Time:</strong> {appt.selected_time}</p>
          <p><strong>Doctor:</strong> {appt.doctors?.fullName}</p>
          <p><strong>Practice:</strong> {appt.doctors?.practiceName}</p>
          <p><strong>Speciality:</strong> {appt.doctors?.speciality}</p>
        </div>
      ))}
    </div>
  );
}