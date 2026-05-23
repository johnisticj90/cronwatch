import express from 'express';
import { getOverallStats, getJobStats, getAllJobStats } from '../api/stats.js';

const router = express.Router();

/**
 * GET /stats
 * Returns aggregate stats across all jobs.
 */
router.get('/', (req, res) => {
  try {
    const stats = getOverallStats();
    res.json({ ok: true, data: stats });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /stats/jobs
 * Returns per-job stats for all tracked jobs, sorted by failure count.
 */
router.get('/jobs', (req, res) => {
  try {
    const all = getAllJobStats();
    res.json({ ok: true, data: all });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /stats/jobs/:key
 * Returns stats for a single job identified by its key.
 */
router.get('/jobs/:key', (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const stats = getJobStats(key);
    if (!stats) {
      return res.status(404).json({ ok: false, error: `Job not found: ${key}` });
    }
    res.json({ ok: true, data: stats });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
