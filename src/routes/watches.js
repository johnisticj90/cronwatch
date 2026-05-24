const express = require('express');
const router = express.Router();
const { watchJob, unwatchJob, getWatchedJob, getAllWatchedJobs } = require('../store/watchStore');
const { getJob } = require('../store/jobStore');

// GET /watches - list all watched jobs
router.get('/', (req, res) => {
  const watched = getAllWatchedJobs();
  res.json({ watched });
});

// GET /watches/:key - get a specific watched job
router.get('/:key', (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const entry = getWatchedJob(key);
  if (!entry) {
    return res.status(404).json({ error: 'Watch not found' });
  }
  res.json(entry);
});

// POST /watches - add a watch for a job
router.post('/', (req, res) => {
  const { key, alertOnFailure, alertOnMissed, thresholdSeconds } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'key is required' });
  }
  const job = getJob(key);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  const options = {};
  if (alertOnFailure !== undefined) options.alertOnFailure = alertOnFailure;
  if (alertOnMissed !== undefined) options.alertOnMissed = alertOnMissed;
  if (thresholdSeconds !== undefined) options.thresholdSeconds = thresholdSeconds;
  const entry = watchJob(key, options);
  res.status(201).json(entry);
});

// DELETE /watches/:key - remove a watch
router.delete('/:key', (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const removed = unwatchJob(key);
  if (!removed) {
    return res.status(404).json({ error: 'Watch not found' });
  }
  res.json({ removed: true, key });
});

module.exports = router;
