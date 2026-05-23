import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import statsRouter from './stats.js';
import { clearStore, recordExecution } from '../store/jobStore.js';

const app = express();
app.use(express.json());
app.use('/stats', statsRouter);

beforeEach(() => {
  clearStore();
});

describe('GET /stats', () => {
  it('returns 200 with empty stats', async () => {
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.jobCount).toBe(0);
  });

  it('reflects recorded executions', async () => {
    recordExecution('k1', '/bin/k1', '* * * * *', new Date(), 0, 100);
    const res = await request(app).get('/stats');
    expect(res.body.data.jobCount).toBe(1);
    expect(res.body.data.totalRuns).toBe(1);
  });
});

describe('GET /stats/jobs', () => {
  it('returns empty array when no jobs', async () => {
    const res = await request(app).get('/stats/jobs');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns jobs sorted by failCount', async () => {
    recordExecution('alpha', '/bin/alpha', '* * * * *', new Date(), 0, 50);
    recordExecution('beta', '/bin/beta', '* * * * *', new Date(), 1, 50);
    recordExecution('beta', '/bin/beta', '* * * * *', new Date(), 1, 50);
    const res = await request(app).get('/stats/jobs');
    expect(res.body.data[0].key).toBe('beta');
  });
});

describe('GET /stats/jobs/:key', () => {
  it('returns 404 for unknown job', async () => {
    const res = await request(app).get('/stats/jobs/nope');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  it('returns stats for known job', async () => {
    recordExecution('myjob', '/usr/bin/myjob', '0 1 * * *', new Date(), 0, 400);
    const res = await request(app).get('/stats/jobs/myjob');
    expect(res.status).toBe(200);
    expect(res.body.data.runCount).toBe(1);
    expect(res.body.data.avgDurationMs).toBe(400);
  });
});
