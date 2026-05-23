import { getAllJobs, getJob } from '../store/jobStore.js';

/**
 * Compute summary stats across all tracked jobs.
 */
export function getOverallStats() {
  const jobs = getAllJobs();
  const total = jobs.length;
  const successful = jobs.filter(j => j.lastExitCode === 0).length;
  const failed = jobs.filter(j => j.lastExitCode !== 0 && j.lastExitCode !== null).length;
  const unknown = jobs.filter(j => j.lastExitCode === null).length;

  const totalRuns = jobs.reduce((sum, j) => sum + (j.runCount || 0), 0);
  const totalFailures = jobs.reduce((sum, j) => sum + (j.failCount || 0), 0);

  return {
    jobCount: total,
    successful,
    failed,
    unknown,
    totalRuns,
    totalFailures,
    successRate: totalRuns > 0 ? ((totalRuns - totalFailures) / totalRuns) : null,
  };
}

/**
 * Compute per-job stats for a specific job key.
 */
export function getJobStats(key) {
  const job = getJob(key);
  if (!job) return null;

  const runCount = job.runCount || 0;
  const failCount = job.failCount || 0;
  const successCount = runCount - failCount;

  return {
    key,
    command: job.command,
    schedule: job.schedule,
    runCount,
    failCount,
    successCount,
    successRate: runCount > 0 ? successCount / runCount : null,
    lastRun: job.lastRun || null,
    lastExitCode: job.lastExitCode !== undefined ? job.lastExitCode : null,
    avgDurationMs: job.totalDurationMs && runCount > 0
      ? Math.round(job.totalDurationMs / runCount)
      : null,
  };
}

/**
 * Return stats for all jobs, sorted by failure count descending.
 */
export function getAllJobStats() {
  const jobs = getAllJobs();
  return jobs
    .map(j => getJobStats(j.key))
    .filter(Boolean)
    .sort((a, b) => b.failCount - a.failCount);
}
