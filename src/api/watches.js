const watchStore = require('../store/watchStore');
const jobStore = require('../store/jobStore');
const { getJobStats } = require('./stats');

/**
 * Returns list of all watched jobs with current status info
 */
function getWatchList() {
  const watched = watchStore.getAllWatchedJobs();
  return watched.map(entry => {
    const job = jobStore.getJob(entry.user, entry.command);
    const stats = job ? getJobStats(entry.user, entry.command) : null;
    return {
      user: entry.user,
      command: entry.command,
      label: entry.label || null,
      notifyOnFailure: entry.notifyOnFailure ?? true,
      notifyOnMissed: entry.notifyOnMissed ?? false,
      watchedAt: entry.watchedAt,
      lastRun: stats ? stats.lastRun : null,
      lastStatus: stats ? stats.lastStatus : null,
      successRate: stats ? stats.successRate : null,
    };
  });
}

/**
 * Returns detail for a single watched job
 */
function getWatchDetail(user, command) {
  const entry = watchStore.getWatchedJob(user, command);
  if (!entry) return null;

  const job = jobStore.getJob(user, command);
  const stats = job ? getJobStats(user, command) : null;

  return {
    user: entry.user,
    command: entry.command,
    label: entry.label || null,
    notifyOnFailure: entry.notifyOnFailure ?? true,
    notifyOnMissed: entry.notifyOnMissed ?? false,
    watchedAt: entry.watchedAt,
    stats: stats || null,
    executions: job ? job.executions.slice(-20) : [],
  };
}

/**
 * Adds or updates a watch entry
 */
function upsertWatch(user, command, options = {}) {
  if (!user || !command) throw new Error('user and command are required');
  watchStore.watchJob(user, command, options);
  return getWatchDetail(user, command);
}

/**
 * Removes a watch entry
 */
function removeWatch(user, command) {
  const existed = watchStore.isWatched(user, command);
  if (!existed) return false;
  watchStore.unwatchJob(user, command);
  return true;
}

module.exports = { getWatchList, getWatchDetail, upsertWatch, removeWatch };
