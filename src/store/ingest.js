/**
 * ingest.js
 * Ties the log parser to the job store.
 * Reads a cron log file and populates the store with execution history.
 */

const fs = require('fs');
const readline = require('readline');
const { parseLine } = require('../parser/cronlog');
const { recordExecution } = require('./jobStore');

/**
 * Ingest a single raw log line into the store.
 * Lines that don't parse (non-CMD entries, etc.) are silently skipped.
 * @param {string} rawLine
 * @returns {boolean} true if the line was recorded
 */
function ingestLine(rawLine) {
  const entry = parseLine(rawLine);
  if (!entry || !entry.command) return false;
  recordExecution(entry);
  return true;
}

/**
 * Stream-ingest a log file line by line.
 * @param {string} filePath  Absolute path to the syslog / cron log file.
 * @returns {Promise<{ total: number, recorded: number }>}
 */
function ingestFile(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    stream.on('error', reject);

    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let total = 0;
    let recorded = 0;

    rl.on('line', (line) => {
      total += 1;
      if (ingestLine(line)) recorded += 1;
    });

    rl.on('close', () => resolve({ total, recorded }));
    rl.on('error', reject);
  });
}

module.exports = { ingestLine, ingestFile };
