const watchStore = require('../store/watchStore');
const jobStore = require('../store/jobStore');
const { getWatchList, getWatchDetail, upsertWatch, removeWatch } = require('./watches');

beforeEach(() => {
  watchStore.clearWatchStore();
  jobStore.clearStore();
});

describe('getWatchList', () => {
  it('returns empty array when no watches', () => {
    expect(getWatchList()).toEqual([]);
  });

  it('returns watched jobs with basic info', () => {
    watchStore.watchJob('root', '/usr/bin/backup.sh', { label: 'Backup' });
    const list = getWatchList();
    expect(list).toHaveLength(1);
    expect(list[0].user).toBe('root');
    expect(list[0].command).toBe('/usr/bin/backup.sh');
    expect(list[0].label).toBe('Backup');
    expect(list[0].lastRun).toBeNull();
  });

  it('includes stats when job has executions', () => {
    watchStore.watchJob('deploy', '/opt/deploy.sh', {});
    jobStore.recordExecution('deploy', '/opt/deploy.sh', { exitCode: 0, duration: 12 });
    const list = getWatchList();
    expect(list[0].lastStatus).toBe('success');
    expect(list[0].successRate).toBe(1);
  });
});

describe('getWatchDetail', () => {
  it('returns null for unwatched job', () => {
    expect(getWatchDetail('root', '/missing.sh')).toBeNull();
  });

  it('returns detail with executions', () => {
    watchStore.watchJob('root', '/usr/bin/cleanup.sh', { notifyOnFailure: true });
    jobStore.recordExecution('root', '/usr/bin/cleanup.sh', { exitCode: 1, duration: 5 });
    const detail = getWatchDetail('root', '/usr/bin/cleanup.sh');
    expect(detail).not.toBeNull();
    expect(detail.executions).toHaveLength(1);
    expect(detail.stats).not.toBeNull();
    expect(detail.notifyOnFailure).toBe(true);
  });
});

describe('upsertWatch', () => {
  it('throws if user or command missing', () => {
    expect(() => upsertWatch('', '/cmd.sh')).toThrow();
    expect(() => upsertWatch('root', '')).toThrow();
  });

  it('adds a new watch and returns detail', () => {
    const result = upsertWatch('www-data', '/var/cron/task.sh', { label: 'Task' });
    expect(result.user).toBe('www-data');
    expect(result.label).toBe('Task');
  });
});

describe('removeWatch', () => {
  it('returns false if watch does not exist', () => {
    expect(removeWatch('root', '/nope.sh')).toBe(false);
  });

  it('removes existing watch and returns true', () => {
    watchStore.watchJob('root', '/usr/bin/prune.sh', {});
    expect(removeWatch('root', '/usr/bin/prune.sh')).toBe(true);
    expect(watchStore.isWatched('root', '/usr/bin/prune.sh')).toBe(false);
  });
});
