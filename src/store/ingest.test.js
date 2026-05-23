const { ingestLine, ingestFile } = require('./ingest');
const { clearStore, getAllJobs, getJob } = require('./jobStore');
const fs = require('fs');
const path = require('path');

beforeEach(() => {
  clearStore();
});

describe('ingestLine', () => {
  test('ingests a valid cron log line', () => {
    const line = 'Nov 15 03:00:01 myserver CRON[12345]: (root) CMD (/usr/bin/backup.sh)';
    ingestLine(line);
    const jobs = getAllJobs();
    expect(jobs.length).toBe(1);
    expect(jobs[0].user).toBe('root');
    expect(jobs[0].command).toBe('/usr/bin/backup.sh');
  });

  test('ignores non-CMD lines', () => {
    const line = 'Nov 15 03:00:01 myserver CRON[12345]: (root) MAIL (mailed 1 byte of output)';
    ingestLine(line);
    expect(getAllJobs().length).toBe(0);
  });

  test('ignores unparseable lines', () => {
    ingestLine('not a cron line at all');
    expect(getAllJobs().length).toBe(0);
  });

  test('accumulates executions for the same job', () => {
    const line1 = 'Nov 15 03:00:01 myserver CRON[1001]: (root) CMD (/usr/bin/backup.sh)';
    const line2 = 'Nov 16 03:00:01 myserver CRON[1002]: (root) CMD (/usr/bin/backup.sh)';
    ingestLine(line1);
    ingestLine(line2);
    const jobs = getAllJobs();
    expect(jobs.length).toBe(1);
    expect(jobs[0].executions.length).toBe(2);
  });

  test('tracks different jobs separately', () => {
    ingestLine('Nov 15 03:00:01 myserver CRON[1001]: (root) CMD (/usr/bin/backup.sh)');
    ingestLine('Nov 15 04:00:01 myserver CRON[1002]: (www-data) CMD (/usr/bin/cleanup.sh)');
    expect(getAllJobs().length).toBe(2);
  });
});

describe('ingestFile', () => {
  const tmpFile = path.join(__dirname, '__test_syslog.tmp');

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  test('ingests multiple lines from a file', () => {
    const content = [
      'Nov 15 03:00:01 myserver CRON[1001]: (root) CMD (/usr/bin/backup.sh)',
      'Nov 15 04:00:01 myserver CRON[1002]: (www-data) CMD (/usr/bin/cleanup.sh)',
      'Nov 15 03:00:01 myserver CRON[1003]: (root) MAIL (mailed 0 bytes)',
    ].join('\n');
    fs.writeFileSync(tmpFile, content);
    ingestFile(tmpFile);
    expect(getAllJobs().length).toBe(2);
  });

  test('returns count of ingested lines', () => {
    const content = [
      'Nov 15 03:00:01 myserver CRON[1001]: (root) CMD (/usr/bin/backup.sh)',
      'Nov 15 04:00:01 myserver CRON[1002]: (www-data) CMD (/usr/bin/cleanup.sh)',
    ].join('\n');
    fs.writeFileSync(tmpFile, content);
    const count = ingestFile(tmpFile);
    expect(count).toBe(2);
  });

  test('throws if file does not exist', () => {
    expect(() => ingestFile('/nonexistent/path/syslog')).toThrow();
  });
});
