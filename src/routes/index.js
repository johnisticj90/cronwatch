import express from 'express';
import jobsRouter from '../api/jobs.js';
import statsRouter from './stats.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Job history endpoints
router.use('/jobs', jobsRouter);

// Statistics endpoints
router.use('/stats', statsRouter);

export default router;
