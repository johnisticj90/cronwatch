const request = require('supertest');
const express = require('express');
const watchesRouter = require('./watches');
const { clearStore, recordExecution } = require('../store/jobStore');
const { clearWatchStore } = require('../store/watchStore');

const app = express();
app.use(express.json());
app.use('/watches', watchesRouter);

beforeEach(() => {
  clearStore();
  clearWatchStore();
  recordExecution('root', '/scripts/backup.sh', new Date('2024-01-10T02:00:00Z'), true, 0);
});

describe('GET /watches', () => {
  it('returns empty list when no watches', async () => {
    const res = await request(app).get('/watches');
    expect(res.status).toBe(200);
    expect(res.body.watched).toEqual([]);
  });

  it('returns all watched jobs', async () => {
    await request(app).post('/watches').send({ key: 'root::/scripts/backup.sh' });
    const res = await request(app).get('/watches');
    expect(res.status).toBe(200);
    expect(res.body.watched.length).toBe(1);
  });
});

describe('POST /watches', () => {
  it('returns 400 if key is missing', async () => {
    const res = await request(app).post('/watches').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 if job does not exist', async () => {
    const res = await request(app).post('/watches').send({ key: 'nobody::fake' });
    expect(res.status).toBe(404);
  });

  it('creates a watch for an existing job', async () => {
    const res = await request(app)
      .post('/watches')
      .send({ key: 'root::/scripts/backup.sh', alertOnFailure: true, thresholdSeconds: 300 });
    expect(res.status).toBe(201);
    expect(res.body.key).toBe('root::/scripts/backup.sh');
    expect(res.body.alertOnFailure).toBe(true);
  });
});

describe('GET /watches/:key', () => {
  it('returns 404 for unknown key', async () => {
    const res = await request(app).get('/watches/nobody%3A%3Afake');
    expect(res.status).toBe(404);
  });

  it('returns the watch entry', async () => {
    await request(app).post('/watches').send({ key: 'root::/scripts/backup.sh' });
    const res = await request(app).get('/watches/root%3A%3A%2Fscripts%2Fbackup.sh');
    expect(res.status).toBe(200);
    expect(res.body.key).toBe('root::/scripts/backup.sh');
  });
});

describe('DELETE /watches/:key', () => {
  it('returns 404 if watch not found', async () => {
    const res = await request(app).delete('/watches/nobody%3A%3Afake');
    expect(res.status).toBe(404);
  });

  it('removes an existing watch', async () => {
    await request(app).post('/watches').send({ key: 'root::/scripts/backup.sh' });
    const res = await request(app).delete('/watches/root%3A%3A%2Fscripts%2Fbackup.sh');
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(true);
  });
});
