import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/appointments – list for authenticated user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as Request & { user: { id: string } }).user;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const col = profile?.role === 'doctor' ? 'doctor_id' : 'patient_id';

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patient:patient_id(full_name,avatar_url), doctor:doctor_id(full_name,specialty), symptom_report:symptom_report_id(*)')
    .eq(col, user.id)
    .order('requested_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/appointments/:id
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patient:patient_id(*), doctor:doctor_id(*), symptom_report:symptom_report_id(*)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Appointment not found' });
  return res.json(data);
});

// PATCH /api/appointments/:id/done
router.patch('/:id/done', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as Request & { user: { id: string } }).user;

  const { data: appt, error: apptError } = await supabase
    .from('appointments')
    .select('doctor_id')
    .eq('id', id)
    .single();

  if (apptError || !appt) return res.status(404).json({ error: 'Appointment not found' });
  if (appt.doctor_id !== user.id) return res.status(403).json({ error: 'Only the assigned doctor can mark this done' });

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/patient/:id/appointments', async (req, res) => {
  try {
    const patientId = req.params.id;

    const { data, error } = await supabase
      .from('appointment_data')
      .select(`
        *,
        doctors (*)
      `)
      .eq('patientId', patientId)
      .order('createdAt', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load appointments' });
  }
});

export default router;
