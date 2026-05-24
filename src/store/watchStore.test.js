const {
  watchJob,
  unwatchJob,
  getWatchedJob,
  getAllWatchedJobs,
  isWatched,
  clearWatchStore,
} = require('./watchStore');

const sampleEntry = {
  schedule: '0 * * * *',
  command: '/usr/bin/backup.sh',
  user: 'root',
};

beforeEach(() => {
  clearWatchStore();
});

describe('watchJob', () => {
  it('adds a job to the watch store', () => {
    watchJob('root:/usr/bin/backup.sh', sampleEntry);
    expect(isWatched('root:/usr/bin/backup.sh')).toBe(true);
  });

  it('stores all expected fields', () => {
    watchJob('root:/usr/bin/backup.sh', sampleEntry);
    const job = getWatchedJob('root:/usr/bin/backup.sh');
    expect(job.schedule).toBe('0 * * * *');
    expect(job.command).toBe('/usr/bin/backup.sh');
    expect(job.user).toBe('root');
    expect(job.key).toBe('root:/usr/bin/backup.sh');
    expect(job.addedAt).toBeDefined();
  });

  it('throws if key is missing', () => {
    expect(() => watchJob(null, sampleEntry)).toThrow();
  });

  it('throws if entry is missing', () => {
    expect(() => watchJob('root:/usr/bin/backup.sh', null)).toThrow();
  });

  it('overwrites an existing entry with the same key', () => {
    watchJob('root:/usr/bin/backup.sh', sampleEntry);
    watchJob('root:/usr/bin/backup.sh', { ...sampleEntry, schedule: '30 6 * * *' });
    expect(getWatchedJob('root:/usr/bin/backup.sh').schedule).toBe('30 6 * * *');
  });
});

describe('unwatchJob', () => {
  it('removes a watched job', () => {
    watchJob('root:/usr/bin/backup.sh', sampleEntry);
    const result = unwatchJob('root:/usr/bin/backup.sh');
    expect(result).toBe(true);
    expect(isWatched('root:/usr/bin/backup.sh')).toBe(false);
  });

  it('returns false when key does not exist', () => {
    expect(unwatchJob('nonexistent')).toBe(false);
  });
});

describe('getAllWatchedJobs', () => {
  it('returns empty array when no jobs are watched', () => {
    expect(getAllWatchedJobs()).toEqual([]);
  });

  it('returns all watched jobs', () => {
    watchJob('root:/usr/bin/backup.sh', sampleEntry);
    watchJob('deploy:/opt/deploy.sh', { schedule: '0 2 * * *', command: '/opt/deploy.sh', user: 'deploy' });
    const all = getAllWatchedJobs();
    expect(all).toHaveLength(2);
    expect(all.map(j => j.key)).toContain('root:/usr/bin/backup.sh');
    expect(all.map(j => j.key)).toContain('deploy:/opt/deploy.sh');
  });
});
