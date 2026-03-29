import { useLocation } from 'react-router-dom';
import DoctorMatches from './DoctorMatches';

export default function ReportResult() {
  const location = useLocation();
  const report = location.state?.report;

  if (!report) {
    return <div style={{ padding: 20 }}>No finalized report found.</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1>Final Structured Report</h1>

      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(report.pre_appointment_report, null, 2)}
      </pre>

      <h3>Recommended Speciality</h3>
      <p>{report.recommended_speciality}</p>

      {report?.id && report?.recommended_speciality && (
        <DoctorMatches
          reportId={report.id}
          speciality={report.recommended_speciality}
        />
      )}
    </div>
  );
}