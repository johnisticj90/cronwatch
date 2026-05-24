/**
 * watchStore.js
 * Manages watched cron job definitions (from crontab entries)
 * so we can track expected vs actual executions.
 */

const watchedJobs = new Map();

/**
 * Add or update a watched job entry.
 * @param {string} key - unique job key (user:command)
 * @param {object} entry - parsed cron entry
 */
function watchJob(key, entry) {
  if (!key || !entry) throw new Error('key and entry are required');
  watchedJobs.set(key, {
    key,
    schedule: entry.schedule,
    command: entry.command,
    user: entry.user || null,
    addedAt: new Date().toISOString(),
  });
}

/**
 * Remove a watched job by key.
 * @param {string} key
 * @returns {boolean} true if removed, false if not found
 */
function unwatchJob(key) {
  return watchedJobs.delete(key);
}

/**
 * Get a single watched job by key.
 * @param {string} key
 * @returns {object|undefined}
 */
function getWatchedJob(key) {
  return watchedJobs.get(key);
}

/**
 * Get all watched jobs as an array.
 * @returns {object[]}
 */
function getAllWatchedJobs() {
  return Array.from(watchedJobs.values());
}

/**
 * Check if a job key is currently being watched.
 * @param {string} key
 * @returns {boolean}
 */
function isWatched(key) {
  return watchedJobs.has(key);
}

/**
 * Clear all watched jobs (useful for testing).
 */
function clearWatchStore() {
  watchedJobs.clear();
}

module.exports = {
  watchJob,
  unwatchJob,
  getWatchedJob,
  getAllWatchedJobs,
  isWatched,
  clearWatchStore,
};
