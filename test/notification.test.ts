
import request from 'supertest';
import {start} from '../src/server';

describe('Notification API', () => {
  let app;

  beforeAll(async () => {
    app = await start();
  });

  it('should return a 200 response for the health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return a 404 response for an unknown route', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });

  it('should create a new notification and return a 201 response', async () => {
    const response = await request(app)
      .post('/api/notifications')
      .send({
        user_id: 'test-user',
        message: 'This is a test notification',
      });
    expect(response.status).toBe(201);
  });

  it('should return a 400 response if the request body is invalid', async () => {
    const response = await request(app)
      .post('/api/notifications')
      .send({});
    expect(response.status).toBe(400);
  });
});
