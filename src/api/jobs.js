/**
 * Express router for job-related API endpoints.
 * Exposes the job store over HTTP for the dashboard frontend.
 */
const express = require('express');
const { getAllJobs, getJob } = require('../store/jobStore');
const { ingestFile } = require('../store/ingest');

const router = express.Router();

/**
 * GET /api/jobs
 * Returns all tracked cron jobs with their execution history.
 * Query params:
 *   - user: filter by unix user
 *   - limit: max number of jobs to return (default 100)
 */
router.get('/', (req, res) => {
  try {
    let jobs = getAllJobs();

    if (req.query.user) {
      jobs = jobs.filter(j => j.user === req.query.user);
    }

    const limit = parseInt(req.query.limit, 10) || 100;
    jobs = jobs.slice(0, limit);

    res.json({ jobs, total: jobs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/jobs/:key
 * Returns a single job by its store key (user:command).
 */
router.get('/:key', (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const job = getJob(key);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/jobs/ingest
 * Triggers ingestion of a log file on the server.
 * Body: { filePath: string }
 */
router.post('/ingest', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }
  try {
    const count = ingestFile(filePath);
    res.json({ ingested: count, filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
