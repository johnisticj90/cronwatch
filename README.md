# cronwatch

Simple dashboard to monitor and log cron job execution history on Linux servers.

## Installation

```bash
npm install -g cronwatch
```

## Usage

Start the dashboard by pointing cronwatch at your cron log file:

```bash
cronwatch --log /var/log/syslog --port 3000
```

Then open your browser at `http://localhost:3000` to view the execution history dashboard.

You can also run it as a background service:

```bash
cronwatch start --config cronwatch.config.js
```

Example `cronwatch.config.js`:

```js
module.exports = {
  port: 3000,
  logFile: '/var/log/syslog',
  pollInterval: 5000,
  timezone: 'UTC'
};
```

## Features

- Real-time cron job execution history
- Success/failure status tracking
- Execution duration logging
- Filter and search past runs
- Lightweight, no database required

## Requirements

- Node.js >= 14
- Linux server with syslog or cron-specific log file

## License

[MIT](LICENSE)