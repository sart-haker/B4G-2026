import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { submitFollowUpAnswers } from '../lib/api';

export default function FollowUpQuestions() {
  const location = useLocation();
  const navigate = useNavigate();

  const reportId = location.state?.reportId as string;
  const questions = (location.state?.questions || []) as string[];
  const draftSummary = location.state?.draftSummary as string;

  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateAnswer(index: number, value: string) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await submitFollowUpAnswers(reportId, answers);

      navigate('/report-result', {
        state: {
          report: data,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit follow-up answers');
    } finally {
      setLoading(false);
    }
  }

  if (!reportId || !questions.length) {
    return <div style={{ padding: 20 }}>No follow-up questions found.</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 16 }}>
      <h1>Follow-up Questions</h1>

      {draftSummary && (
        <>
          <h3>What we understood so far</h3>
          <p>{draftSummary}</p>
        </>
      )}

      <form onSubmit={handleSubmit}>
        {questions.map((q, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>{q}</label>
            <textarea
              value={answers[i]}
              onChange={(e) => updateAnswer(i, e.target.value)}
              style={{ width: '100%', height: 80, padding: 8 }}
            />
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? 'Finalizing...' : 'Generate Final Report'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}