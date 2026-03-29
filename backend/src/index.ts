import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


import appointmentsRouter from './routes/appointments';
import forumRouter from './routes/forum';
import profileRouter from './routes/profile';
import reportsRouter from './routes/reports';



const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/appointments', appointmentsRouter);
app.use('/api/forum', forumRouter);
app.use('/api/profile', profileRouter);
app.use('/api/reports', reportsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 MedConnect API running on http://localhost:${PORT}`);
});

export default app;
