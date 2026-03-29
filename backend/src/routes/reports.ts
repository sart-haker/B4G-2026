import { Router } from 'express';
import { supabase } from '../lib/supabase';
import {
  finalizeIntakeReport,
  generateFollowUpQuestions,
} from '../services/ai';

const router = Router();

router.post('/intake', async (req, res) => {
  try {
    const { patientId, title, description, needAsap } = req.body;

    if (!patientId || !description) {
      return res.status(400).json({
        error: 'patientId and description are required',
      });
    }

    const aiResult = await generateFollowUpQuestions(description);

    const { data, error } = await supabase
      .from('appointment_data')
      .insert([
        {
          patientId,
          title: title || 'New intake report',
          reportType: 'intake',
          status: 'awaiting_followup',
          needAsap: !!needAsap,
          initial_prompt: description,
          follow_up_questions: aiResult.follow_up_questions,
          recommended_speciality: aiResult.recommended_speciality,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      id: data.id,
      status: data.status,
      follow_up_questions: data.follow_up_questions,
      recommended_speciality: data.recommended_speciality,
      draft_summary: aiResult.draft_summary,
    });
  } catch (error: any) {
    console.error('Intake route error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create intake report',
    });
  }
});

router.post('/:id/follow-up-answers', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('appointment_data')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const finalReport = await finalizeIntakeReport({
      description: existing.initial_prompt || '',
      followUpQuestions: existing.follow_up_questions || [],
      followUpAnswers: answers,
    });

    const { data, error } = await supabase
      .from('appointment_data')
      .update({
        follow_up_answers: answers,
        formatted_report: finalReport,
        recommended_speciality: finalReport.recommended_speciality,
        status: 'report_ready',
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Follow-up finalize error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to finalize report',
    });
  }
});

router.post('/:id/book', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { doctorId, selected_time } = req.body;

    const { data, error } = await supabase
      .from('appointment_data')
      .update({
        doctorId,
        selected_time,
        status: 'booked',
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Booking failed' });
  }
});

export default router;