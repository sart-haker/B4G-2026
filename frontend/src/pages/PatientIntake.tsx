import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIntakeReport } from '../lib/api';

const TEST_PATIENT_ID = 'd33ed493-04e9-4acf-8359-59dd80b351e4';

export default function PatientIntake() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('Skin irritation');
  const [description, setDescription] = useState('');
  const [needAsap, setNeedAsap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await createIntakeReport({
        patientId: TEST_PATIENT_ID,
        title,
        description,
        needAsap,
      });

      navigate('/follow-up', {
        state: {
          reportId: data.id,
          questions: data.follow_up_questions,
          draftSummary: data.draft_summary,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 16 }}>
      <h1>Patient Intake</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Report title"
          style={{ width: '100%', marginBottom: 12, padding: 10 }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you're feeling in as much detail as you want..."
          style={{ width: '100%', height: 180, marginBottom: 12, padding: 10 }}
        />

        <label style={{ display: 'block', marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={needAsap}
            onChange={(e) => setNeedAsap(e.target.checked)}
          />{' '}
          Need appointment ASAP
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Continue'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}