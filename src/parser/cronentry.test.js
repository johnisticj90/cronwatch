const { parseSchedule, parseCronEntry, parseCrontab } = require('./cronentry');

describe('parseSchedule', () => {
  test('parses a standard cron schedule', () => {
    const result = parseSchedule('*/5 * * * *');
    expect(result).toEqual({
      minute: '*/5',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });
  });

  test('returns null for invalid schedule', () => {
    expect(parseSchedule('* * *')).toBeNull();
    expect(parseSchedule('')).toBeNull();
    expect(parseSchedule(null)).toBeNull();
  });

  test('parses specific time schedule', () => {
    const result = parseSchedule('30 6 1 * 1');
    expect(result.minute).toBe('30');
    expect(result.hour).toBe('6');
    expect(result.dayOfWeek).toBe('1');
  });
});

describe('parseCronEntry', () => {
  test('parses a user crontab line', () => {
    const result = parseCronEntry('0 2 * * * /usr/bin/backup.sh');
    expect(result).not.toBeNull();
    expect(result.command).toBe('/usr/bin/backup.sh');
    expect(result.scheduleRaw).toBe('0 2 * * *');
    expect(result.user).toBeNull();
  });

  test('parses a system crontab line with user', () => {
    const result = parseCronEntry('15 3 * * * root /usr/sbin/logrotate');
    expect(result.user).toBe('root');
    expect(result.command).toBe('/usr/sbin/logrotate');
  });

  test('skips comment lines', () => {
    expect(parseCronEntry('# this is a comment')).toBeNull();
  });

  test('skips empty lines', () => {
    expect(parseCronEntry('')).toBeNull();
    expect(parseCronEntry('   ')).toBeNull();
  });

  test('returns null for malformed lines', () => {
    expect(parseCronEntry('* * *')).toBeNull();
    expect(parseCronEntry(null)).toBeNull();
  });

  test('uses provided user context', () => {
    const result = parseCronEntry('*/10 * * * * /opt/check.sh', 'deploy');
    expect(result.user).toBe('deploy');
  });
});

describe('parseCrontab', () => {
  test('parses multiple entries from crontab content', () => {
    const content = [
      '# Daily backup',
      '0 2 * * * /usr/bin/backup.sh',
      '',
      '*/5 * * * * /usr/bin/healthcheck.sh'
    ].join('\n');

    const entries = parseCrontab(content);
    expect(entries).toHaveLength(2);
    expect(entries[0].command).toBe('/usr/bin/backup.sh');
    expect(entries[1].scheduleRaw).toBe('*/5 * * * *');
  });

  test('returns empty array for empty content', () => {
    expect(parseCrontab('')).toEqual([]);
    expect(parseCrontab(null)).toEqual([]);
  });
});
