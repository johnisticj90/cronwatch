const express = require('express');
const statsRouter = require('./stats');
const jobsRouter = require('./jobs');

const router = express.Router();

router.use('/stats', statsRouter);
router.use('/jobs', jobsRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
