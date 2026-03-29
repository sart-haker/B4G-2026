const API_BASE = 'http://localhost:3001/api';

export async function createIntakeReport(payload: {
  patientId: string;
  title: string;
  description: string;
  needAsap: boolean;
}) {
  const res = await fetch(`${API_BASE}/reports/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create intake report');
  }

  return data;
}

export async function submitFollowUpAnswers(
  reportId: string,
  answers: string[]
) {
  const res = await fetch(`${API_BASE}/reports/${reportId}/follow-up-answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit follow-up answers');
  }

  return data;
}

export async function getMatchingDoctors(params: {
  speciality: string;
}) {
  const query = new URLSearchParams({
    speciality: params.speciality,
  });

  const res = await fetch(`${API_BASE}/doctors/match?${query.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch doctors');
  }

  return data;
}

export async function bookDoctor(
  reportId: string,
  payload: { doctorId: string; selected_time: string }
) {
  const res = await fetch(`${API_BASE}/reports/${reportId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to book doctor');
  }

  return data;
}

export async function getDoctorReports(doctorId: string) {
  const res = await fetch(`${API_BASE}/doctors/${doctorId}/reports`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch doctor reports');
  }

  return data;
}

export async function getPatientAppointments(patientId: string) {
  const res = await fetch(`${API_BASE}/profile/patient/${patientId}/appointments`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch patient appointments');
  }

  return data;
}