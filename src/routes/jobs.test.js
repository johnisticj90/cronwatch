const request = require('supertest');
const express = require('express');
const jobsRouter = require('./jobs');
const { clearStore, recordExecution } = require('../store/jobStore');

const app = express();
app.use(express.json());
app.use('/jobs', jobsRouter);

beforeEach(() => {
  clearStore();
});

describe('GET /jobs', () => {
  test('returns empty list when no jobs', async () => {
    const res = await request(app).get('/jobs');
    expect(res.status).toBe(200);
    expect(res.body.jobs).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  test('returns jobs after ingestion', async () => {
    recordExecution('backup', '/etc/cron.d/backup', new Date(), 'success', 60);
    const res = await request(app).get('/jobs');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.jobs[0].name).toBe('backup');
  });
});

describe('GET /jobs/:name', () => {
  test('returns 400 if source param missing', async () => {
    const res = await request(app).get('/jobs/backup');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/source/);
  });

  test('returns 404 for unknown job', async () => {
    const res = await request(app).get('/jobs/ghost?source=/etc/crontab');
    expect(res.status).toBe(404);
  });

  test('returns job detail with history', async () => {
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T02:00:00Z'), 'success', 90);
    recordExecution('backup', '/etc/cron.d/backup', new Date('2024-01-15T03:00:00Z'), 'failure', 2);
    const res = await request(app).get('/jobs/backup?source=/etc/cron.d/backup');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('backup');
    expect(res.body.history).toHaveLength(2);
    expect(res.body.successCount).toBe(1);
    expect(res.body.failureCount).toBe(1);
  });

  test('history sorted newest first', async () => {
    recordExecution('sync', '/etc/crontab', new Date('2024-01-15T01:00:00Z'), 'success', 10);
    recordExecution('sync', '/etc/crontab', new Date('2024-01-15T05:00:00Z'), 'success', 15);
    const res = await request(app).get('/jobs/sync?source=/etc/crontab');
    expect(res.status).toBe(200);
    const times = res.body.history.map(h => new Date(h.timestamp).getTime());
    expect(times[0]).toBeGreaterThan(times[1]);
  });
});
