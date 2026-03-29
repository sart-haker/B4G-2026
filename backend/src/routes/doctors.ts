import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.get('/match', async (req, res) => {
  try {
    const speciality = String(req.query.speciality || '').trim();

    if (!speciality) {
      return res.status(400).json({ error: 'speciality is required' });
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .ilike('speciality', speciality);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const sorted = (data || []).sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

    return res.json(sorted);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to match doctors' });
  }
});

router.get('/:id/reports', async (req, res) => {
  try {
    const doctorId = req.params.id;

    const { data, error } = await supabase
      .from('appointment_data')
      .select(`
        *,
        patients (*)
      `)
      .eq('doctorId', doctorId)
      .order('createdAt', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load doctor reports' });
  }
});//2nd route to get all reports for a doctor, used in doctor profile page to show past appointments and patient details

export default router;