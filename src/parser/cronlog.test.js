const { parseLine, parseLog } = require('./cronlog');

const YEAR = 2024;

const sampleLine =
  'Jan 15 03:00:01 myserver CRON[12345]: (root) CMD (/usr/bin/backup.sh >> /var/log/backup.log 2>&1)';

const sessionLine =
  'Jan 15 03:00:01 myserver CRON[12346]: (root) SESSION ()';

const junkLine = 'Some random syslog entry that is not cron related';

describe('parseLine', () => {
  test('parses a valid CMD cron line', () => {
    const result = parseLine(sampleLine, YEAR);
    expect(result).not.toBeNull();
    expect(result.host).toBe('myserver');
    expect(result.pid).toBe(12345);
    expect(result.user).toBe('root');
    expect(result.type).toBe('CMD');
    expect(result.command).toBe('/usr/bin/backup.sh >> /var/log/backup.log 2>&1');
    expect(result.timestamp).toMatch(/^2024-01-15/);
  });

  test('parses SESSION lines correctly', () => {
    const result = parseLine(sessionLine, YEAR);
    expect(result).not.toBeNull();
    expect(result.type).toBe('SESSION');
  });

  test('returns null for non-cron lines', () => {
    expect(parseLine(junkLine, YEAR)).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseLine('', YEAR)).toBeNull();
  });
});

describe('parseLog', () => {
  const multiLine = [sampleLine, sessionLine, junkLine, sampleLine].join('\n');

  test('returns only CMD entries', () => {
    const results = parseLog(multiLine, YEAR);
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.type).toBe('CMD'));
  });

  test('returns empty array for empty input', () => {
    expect(parseLog('', YEAR)).toEqual([]);
  });
});
