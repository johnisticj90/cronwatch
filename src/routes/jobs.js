const express = require('express');
const { getJobList, getJobDetail } = require('../api/jobs');

const router = express.Router();

/**
 * GET /jobs
 * List all cron jobs with summary info.
 */
router.get('/', (req, res) => {
  try {
    const jobs = getJobList();
    res.json({ jobs, count: jobs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve jobs', detail: err.message });
  }
});

/**
 * GET /jobs/:name
 * Get detail for a specific job. Optionally filter by source via ?source=
 */
router.get('/:name', (req, res) => {
  const { name } = req.params;
  const source = req.query.source || null;

  if (!source) {
    return res.status(400).json({ error: 'Query param "source" is required' });
  }

  try {
    const detail = getJobDetail(name, source);
    if (!detail) {
      return res.status(404).json({ error: `Job "${name}" not found for source "${source}"` });
    }
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve job detail', detail: err.message });
  }
});

module.exports = router;
