//POST /api/reports - should be first endpoint inside this route
//first job is to accept patient symptoms form data. Then create a row in reports

import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.get('/test', (_req, res) => {
  res.json({ message: 'reports route works' });
});

router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      title,
      patient_description,
      symptoms,
      medications,
      duration,
      severity,
      history,
      needAsap,
    } = req.body;

    const { data, error } = await supabase
      .from('appointment_data')
      .insert([
        {
          patientId,
          title,
          patient_description,
          symptoms,
          medications,
          duration,
          severity,
          history,
          needAsap,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

export default router;