/**
 * jobStore.js
 * In-memory store for cron job execution history.
 * Keyed by job identifier (user + command).
 */

const jobs = new Map();

/**
 * Build a stable key from a log entry or cron entry.
 * @param {string} user
 * @param {string} command
 * @returns {string}
 */
function makeKey(user, command) {
  return `${user}::${command}`;
}

/**
 * Record a parsed log line into the store.
 * @param {{ timestamp: Date, user: string, command: string, message: string }} entry
 */
function recordExecution(entry) {
  const key = makeKey(entry.user, entry.command);
  if (!jobs.has(key)) {
    jobs.set(key, { user: entry.user, command: entry.command, executions: [] });
  }
  jobs.get(key).executions.push({
    timestamp: entry.timestamp,
    message: entry.message,
  });
}

/**
 * Return all jobs as an array, each with execution history.
 * @returns {Array}
 */
function getAllJobs() {
  return Array.from(jobs.values()).map((job) => ({
    ...job,
    executions: [...job.executions],
    lastRun: job.executions.length
      ? job.executions[job.executions.length - 1].timestamp
      : null,
    runCount: job.executions.length,
  }));
}

/**
 * Get a single job by user + command.
 * @param {string} user
 * @param {string} command
 * @returns {object|null}
 */
function getJob(user, command) {
  return jobs.get(makeKey(user, command)) ?? null;
}

/**
 * Clear all stored data (useful for tests).
 */
function clearStore() {
  jobs.clear();
}

module.exports = { recordExecution, getAllJobs, getJob, clearStore, makeKey };
