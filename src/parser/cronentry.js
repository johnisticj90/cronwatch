/**
 * Parses and validates individual cron job entries from /etc/cron* files
 */

const CRON_FIELDS = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

/**
 * Parse a cron schedule expression into its components
 * @param {string} schedule - e.g. "*/5 * * * *"
 * @returns {object|null}
 */
function parseSchedule(schedule) {
  if (!schedule || typeof schedule !== 'string') return null;

  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const result = {};
  CRON_FIELDS.forEach((field, i) => {
    result[field] = parts[i];
  });

  return result;
}

/**
 * Parse a single line from a crontab file into a structured entry
 * @param {string} line
 * @param {string} [user] - optional username context
 * @returns {object|null}
 */
function parseCronEntry(line, user = null) {
  if (!line || typeof line !== 'string') return null;

  const trimmed = line.trim();

  // Skip comments and empty lines
  if (trimmed.startsWith('#') || trimmed === '') return null;

  // System crontab format: min hour dom month dow user command
  // User crontab format:   min hour dom month dow command
  const parts = trimmed.split(/\s+/);
  if (parts.length < 6) return null;

  const scheduleStr = parts.slice(0, 5).join(' ');
  const schedule = parseSchedule(scheduleStr);
  if (!schedule) return null;

  // Detect if system format (has username field)
  let entryUser = user;
  let command;

  if (parts.length >= 7 && /^[a-z_][a-z0-9_-]*$/.test(parts[5])) {
    entryUser = parts[5];
    command = parts.slice(6).join(' ');
  } else {
    command = parts.slice(5).join(' ');
  }

  return {
    schedule,
    scheduleRaw: scheduleStr,
    user: entryUser,
    command,
    raw: trimmed
  };
}

/**
 * Parse all entries from a crontab file content
 * @param {string} content
 * @param {string} [user]
 * @returns {object[]}
 */
function parseCrontab(content, user = null) {
  if (!content || typeof content !== 'string') return [];

  return content
    .split('\n')
    .map(line => parseCronEntry(line, user))
    .filter(Boolean);
}

module.exports = { parseSchedule, parseCronEntry, parseCrontab };
