const { getAllJobs, getJob } = require('../store/jobStore');

/**
 * Returns a summary list of all known cron jobs.
 */
function getJobList() {
  const jobs = getAllJobs();
  return jobs.map(job => ({
    name: job.name,
    source: job.source,
    lastRun: job.lastRun || null,
    status: job.lastStatus || 'unknown',
    totalRuns: job.executions.length,
    successCount: job.executions.filter(e => e.status === 'success').length,
    failureCount: job.executions.filter(e => e.status === 'failure').length,
  }));
}

/**
 * Returns detailed info for a single job including full execution history.
 * @param {string} name
 * @param {string} source
 */
function getJobDetail(name, source) {
  const job = getJob(name, source);
  if (!job) return null;

  const history = [...job.executions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const successCount = history.filter(e => e.status === 'success').length;
  const failureCount = history.filter(e => e.status === 'failure').length;
  const durations = history.map(e => e.duration).filter(d => d != null);
  const avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  return {
    name: job.name,
    source: job.source,
    lastRun: job.lastRun || null,
    lastStatus: job.lastStatus || 'unknown',
    totalRuns: history.length,
    successCount,
    failureCount,
    avgDuration,
    history,
  };
}

module.exports = { getJobList, getJobDetail };
