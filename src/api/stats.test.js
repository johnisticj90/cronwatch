import { describe, it, expect, beforeEach } from 'vitest';
import { clearStore, recordExecution } from '../store/jobStore.js';
import { getOverallStats, getJobStats, getAllJobStats } from './stats.js';

beforeEach(() => {
  clearStore();
});

describe('getOverallStats', () => {
  it('returns zero counts on empty store', () => {
    const stats = getOverallStats();
    expect(stats.jobCount).toBe(0);
    expect(stats.totalRuns).toBe(0);
    expect(stats.successRate).toBeNull();
  });

  it('counts jobs and runs correctly', () => {
    recordExecution('job1', '/bin/job1', '* * * * *', new Date(), 0, 120);
    recordExecution('job1', '/bin/job1', '* * * * *', new Date(), 1, 80);
    recordExecution('job2', '/bin/job2', '0 * * * *', new Date(), 0, 200);
    const stats = getOverallStats();
    expect(stats.jobCount).toBe(2);
    expect(stats.totalRuns).toBe(3);
    expect(stats.totalFailures).toBe(1);
  });

  it('computes success rate', () => {
    recordExecution('job1', '/bin/job1', '* * * * *', new Date(), 0, 100);
    recordExecution('job1', '/bin/job1', '* * * * *', new Date(), 0, 100);
    const stats = getOverallStats();
    expect(stats.successRate).toBeCloseTo(1.0);
  });
});

describe('getJobStats', () => {
  it('returns null for unknown key', () => {
    expect(getJobStats('nonexistent')).toBeNull();
  });

  it('returns correct stats for a known job', () => {
    recordExecution('myjob', '/usr/bin/myjob', '5 4 * * *', new Date(), 0, 300);
    recordExecution('myjob', '/usr/bin/myjob', '5 4 * * *', new Date(), 2, 150);
    const stats = getJobStats('myjob');
    expect(stats.runCount).toBe(2);
    expect(stats.failCount).toBe(1);
    expect(stats.successCount).toBe(1);
    expect(stats.avgDurationMs).toBe(225);
  });
});

describe('getAllJobStats', () => {
  it('returns all jobs sorted by failCount desc', () => {
    recordExecution('a', '/bin/a', '* * * * *', new Date(), 0, 50);
    recordExecution('b', '/bin/b', '* * * * *', new Date(), 1, 50);
    recordExecution('b', '/bin/b', '* * * * *', new Date(), 1, 50);
    const all = getAllJobStats();
    expect(all[0].key).toBe('b');
    expect(all[1].key).toBe('a');
  });
});
