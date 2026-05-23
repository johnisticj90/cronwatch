/**
 * cronlog.js
 * Parses cron job execution entries from /var/log/syslog or journald output.
 */

const CRON_PATTERN = /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+CRON\[(\d+)\]:\s+\((.+?)\)\s+(CMD|SESSION)\s+(.*)$/;

/**
 * Parse a single log line into a structured cron entry.
 * Returns null if the line doesn't match a cron entry.
 *
 * @param {string} line
 * @param {number} year - defaults to current year (syslog omits year)
 * @returns {object|null}
 */
function parseLine(line, year = new Date().getFullYear()) {
  const match = line.match(CRON_PATTERN);
  if (!match) return null;

  const [, timestamp, host, pid, user, type, command] = match;
  const parsedDate = new Date(`${timestamp} ${year}`);

  return {
    timestamp: isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString(),
    host,
    pid: parseInt(pid, 10),
    user,
    type,
    command: command.trim(),
  };
}

/**
 * Parse multiple log lines and return only valid cron CMD entries.
 *
 * @param {string} rawLog - multiline string
 * @param {number} [year]
 * @returns {object[]}
 */
function parseLog(rawLog, year) {
  return rawLog
    .split('\n')
    .map((line) => parseLine(line, year))
    .filter((entry) => entry !== null && entry.type === 'CMD');
}

module.exports = { parseLine, parseLog };
