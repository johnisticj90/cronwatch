const {
  recordExecution,
  getAllJobs,
  getJob,
  clearStore,
  makeKey,
} = require('./jobStore');

beforeEach(() => {
  clearStore();
});

describe('makeKey', () => {
  it('combines user and command with separator', () => {
    expect(makeKey('root', '/usr/bin/backup.sh')).toBe('root::/usr/bin/backup.sh');
  });
});

describe('recordExecution', () => {
  it('creates a new job entry on first record', () => {
    recordExecution({
      timestamp: new Date('2024-01-15T02:00:00Z'),
      user: 'root',
      command: '/usr/bin/backup.sh',
      message: 'CMD (/usr/bin/backup.sh)',
    });
    const jobs = getAllJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0].user).toBe('root');
    expect(jobs[0].command).toBe('/usr/bin/backup.sh');
    expect(jobs[0].runCount).toBe(1);
  });

  it('appends executions for the same job', () => {
    const base = { user: 'deploy', command: '/opt/cleanup.sh', message: 'CMD' };
    recordExecution({ ...base, timestamp: new Date('2024-01-15T01:00:00Z') });
    recordExecution({ ...base, timestamp: new Date('2024-01-15T02:00:00Z') });
    const job = getJob('deploy', '/opt/cleanup.sh');
    expect(job.executions).toHaveLength(2);
  });

  it('tracks separate entries for different jobs', () => {
    recordExecution({ user: 'root', command: '/bin/a.sh', message: 'CMD', timestamp: new Date() });
    recordExecution({ user: 'root', command: '/bin/b.sh', message: 'CMD', timestamp: new Date() });
    expect(getAllJobs()).toHaveLength(2);
  });
});

describe('getAllJobs', () => {
  it('returns lastRun as the most recent timestamp', () => {
    const t1 = new Date('2024-01-15T01:00:00Z');
    const t2 = new Date('2024-01-15T03:00:00Z');
    recordExecution({ user: 'root', command: '/bin/job.sh', message: 'CMD', timestamp: t1 });
    recordExecution({ user: 'root', command: '/bin/job.sh', message: 'CMD', timestamp: t2 });
    const [job] = getAllJobs();
    expect(job.lastRun).toEqual(t2);
  });

  it('returns null lastRun when no executions exist after clear', () => {
    expect(getAllJobs()).toEqual([]);
  });
});

describe('getJob', () => {
  it('returns null for unknown job', () => {
    expect(getJob('nobody', '/bin/missing.sh')).toBeNull();
  });

  it('returns the job object when found', () => {
    recordExecution({ user: 'cron', command: '/bin/task.sh', message: 'CMD', timestamp: new Date() });
    const job = getJob('cron', '/bin/task.sh');
    expect(job).not.toBeNull();
    expect(job.command).toBe('/bin/task.sh');
  });
});
