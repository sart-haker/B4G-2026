//POST /api/reports - should be first endpoint inside this route
//first job is to accept patient symptoms form data. Then create a row in reports

import { Router } from 'express';

const router = Router();

router.get('/test', (_req, res) => {
  res.json({ message: 'reports route works' });
});

// POST /api/reports
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

    // For now, just log it so you know route works
    console.log('Incoming report:', req.body);

    // Later this is where you insert into Supabase
    return res.status(201).json({
      message: 'Report route works',
      data: {
        patientId,
        title,
        patient_description,
        symptoms,
        medications,
        duration,
        severity,
        history,
        needAsap,
      },
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

export default router;
