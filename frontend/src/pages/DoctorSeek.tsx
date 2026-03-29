import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Camera, Video, MessageSquare, FileText,
  ArrowRight, ArrowLeft, CheckCircle, Stethoscope, Upload, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createIntakeReport, submitFollowUpAnswers } from '../lib/api';
import type { Patient, Doctor } from '../types';

const STEPS = ['Symptoms', 'Photos', 'Video', 'Follow-up', 'Review'];

type FollowUpQuestion = string;
type ProfileType = Patient | Doctor;
const isDoctor = (p: ProfileType): p is Doctor => 'speciality' in p;

export default function DoctorSeek() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Only patients can use Doctor Seek
  const isPatient = profile && !isDoctor(profile as any);

  if (!profile || !isPatient) {
    return (
      <div className="max-w-2xl mx-auto card p-8 text-center">
        <p className="text-red-600 font-medium">Only patients can use Doctor Seek.</p>
        <p className="text-gray-500 text-sm mt-2">Please switch to a patient account or create one to access this feature.</p>
      </div>
    );
  }

  const [step, setStep] = useState(0);
  const [symptomsText, setSymptomsText] = useState('');
  const [_photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [_videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

  const [reportId, setReportId] = useState<string>('');
  const [draftSummary, setDraftSummary] = useState('');
  const [recommendedSpeciality, setRecommendedSpeciality] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoUrls((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setVideoFile(f);
      setVideoUrl(URL.createObjectURL(f));
    }
  };

  const handleContinue = async () => {
    setError('');

    // Step 0 validation
    if (step === 0 && !symptomsText.trim()) {
      setError('Please describe your symptoms before continuing.');
      return;
    }

    // Step 0 -> 1
    if (step === 0) {
      setStep(1);
      return;
    }

    // Step 1 -> 2
    if (step === 1) {
      setStep(2);
      return;
    }

    // Step 2 -> call real intake API, then go to follow-up
    if (step === 2) {
      try {
        setSubmitting(true);

        const data = await createIntakeReport({
          patientId: profile?.id || '',
          title: 'Doctor Consultation',
          description: symptomsText,
          needAsap: false,
        });

        setReportId(data.id);
        setDraftSummary(data.draft_summary || '');
        setRecommendedSpeciality(data.recommended_speciality || '');
        setFollowUpQuestions(data.follow_up_questions || []);
        setFollowUpAnswers(new Array((data.follow_up_questions || []).length).fill(''));

        setStep(3);
      } catch (err: any) {
        setError(err.message || 'Failed to generate follow-up questions');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Step 3 -> submit follow-up answers, then go to review
    if (step === 3) {
      try {
        setSubmitting(true);

        const data = await submitFollowUpAnswers(reportId, followUpAnswers);

        setFinalReport(data);
        setRecommendedSpeciality(data.recommended_speciality || recommendedSpeciality);
        setStep(4);
      } catch (err: any) {
        setError(err.message || 'Failed to finalize report');
      } finally {
        setSubmitting(false);
      }
      return;
    }
  };

  const handleSubmit = async () => {
    // After review, go to the result / booking page with finalized report
    navigate('/report-result', {
      state: {
        report: finalReport,
      },
    });
  };

  const updateAnswer = (index: number, value: string) => {
    const next = [...followUpAnswers];
    next[index] = value;
    setFollowUpAnswers(next);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Search className="w-5 h-5 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Seek</h1>
        </div>
        <p className="text-gray-500">
          Describe your health concern and we'll generate a structured report for your doctor.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, idx) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${idx < step
                ? 'bg-green-500 text-white'
                : idx === step
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                }`}
            >
              {idx < step ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <span className={`text-xs hidden sm:block ${idx === step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
            {idx < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 ml-1" />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Describe Your Symptoms
            </h2>
            <p className="text-sm text-gray-500">
              Be as detailed as possible — location, when it started, what makes it better or worse.
            </p>
            <textarea
              className="input h-40 resize-none"
              placeholder="e.g. I've had a sharp chest pain on the left side for the past 3 days..."
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-600" />
              Add Photos <span className="text-sm font-normal text-gray-400">(optional)</span>
            </h2>
            <p className="text-sm text-gray-500">
              Upload photos of visible symptoms like rashes, swelling, or injuries.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload photos</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </label>
            {photoUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`symptom-${i}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-primary-600" />
              Add a Short Video Note <span className="text-sm font-normal text-gray-400">(optional)</span>
            </h2>
            <p className="text-sm text-gray-500">
              Record or upload a short video explaining your symptoms.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload a video</span>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            </label>
            {videoUrl && (
              <div className="relative">
                <video src={videoUrl} controls className="w-full rounded-lg border border-gray-200" />
                <button
                  onClick={() => { setVideoFile(null); setVideoUrl(''); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Smart Follow-up Questions
            </h2>
            {draftSummary && (
              <div className="bg-primary-50 rounded-lg px-4 py-3 text-sm text-primary-700">
                <strong>What we understood so far:</strong> {draftSummary}
              </div>
            )}
            <div className="space-y-4">
              {followUpQuestions.map((q, i) => (
                <div key={i}>
                  <label className="label">{q}</label>
                  <textarea
                    className="input h-20 resize-none"
                    placeholder="Your answer…"
                    value={followUpAnswers[i] || ''}
                    onChange={(e) => updateAnswer(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Review Your Final Report
            </h2>

            <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Structured Intake Report
                </p>
                <pre className="whitespace-pre-wrap text-gray-800">
                  {JSON.stringify(finalReport?.pre_appointment_report, null, 2)}
                </pre>
              </div>

              <div className="bg-primary-50 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1">
                  Suggested Specialist
                </p>
                <p className="text-primary-800 font-semibold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  {recommendedSpeciality}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || submitting}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleContinue}
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? 'Working…' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              Continue to Booking
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}