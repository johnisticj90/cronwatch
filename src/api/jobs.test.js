const { getJob, getAllJobs, clearStore, recordExecution } = require('../store/jobStore');
const { getJobList, getJobDetail } = require('./jobs');

beforeEach(() => {
  clearStore();
});

describe('getJobList', () => {
  test('returns empty array when no jobs', () => {
    const result = getJobList();
    expect(result).toEqual([]);
  });

  test('returns list of jobs with summary fields', () => {
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T02:00:00Z'), 'success', 120);
    recordExecution('cleanup', '/etc/cron.d/cleanup', new Date('2024-01-15T03:00:00Z'), 'failure', 5);
    const result = getJobList();
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('lastRun');
    expect(result[0]).toHaveProperty('status');
  });

  test('each job has required fields', () => {
    recordExecution('sync', '/etc/crontab', new Date('2024-01-15T04:00:00Z'), 'success', 30);
    const result = getJobList();
    const job = result[0];
    expect(job).toHaveProperty('name');
    expect(job).toHaveProperty('source');
    expect(job).toHaveProperty('lastRun');
    expect(job).toHaveProperty('status');
    expect(job).toHaveProperty('totalRuns');
  });
});

describe('getJobDetail', () => {
  test('returns null for unknown job', () => {
    const result = getJobDetail('ghost', '/etc/crontab');
    expect(result).toBeNull();
  });

  test('returns job detail with history', () => {
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T02:00:00Z'), 'success', 120);
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T03:00:00Z'), 'failure', 3);
    const result = getJobDetail('backup', '/etc/cron.d/backup');
    expect(result).not.toBeNull();
    expect(result.history).toHaveLength(2);
    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(1);
  });

  test('history is sorted newest first', () => {
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T01:00:00Z'), 'success', 10);
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T02:00:00Z'), 'success', 20);
    const result = getJobDetail('backup', '/etc/cron.d/backup');
    expect(new Date(result.history[0].timestamp) >= new Date(result.history[1].timestamp)).toBe(true);
  });
});
