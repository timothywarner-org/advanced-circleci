/**
 * Integration Tests: API Endpoints
 * Tests the HTTP layer and route handling
 */

const request = require('supertest');
const app = require('../../src/index');

describe('API Integration Tests', () => {
  describe('Root Endpoint', () => {
    it('GET / should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service', 'Globomantics Robot Fleet API');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Health Endpoints', () => {
    it('GET /api/health should return healthy status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('uptime');
    });

    it('GET /api/health/live should return alive status', async () => {
      const response = await request(app).get('/api/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
    });

    it('GET /api/health/ready should return ready status', async () => {
      const response = await request(app).get('/api/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('checks');
    });

    it('GET /api/health/version should return version info', async () => {
      const response = await request(app).get('/api/health/version');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('nodeVersion');
    });
  });

  describe('Robot Endpoints', () => {
    it('GET /api/robots should return all robots', async () => {
      const response = await request(app).get('/api/robots');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('robots');
      expect(Array.isArray(response.body.robots)).toBe(true);
    });

    it('GET /api/robots?status=active should filter by status', async () => {
      const response = await request(app).get('/api/robots?status=active');

      expect(response.status).toBe(200);
      response.body.robots.forEach((robot) => {
        expect(robot.status).toBe('active');
      });
    });

    it('GET /api/robots/:id should return specific robot', async () => {
      const response = await request(app).get('/api/robots/rb-001');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'rb-001');
    });

    it('GET /api/robots/:id should return 404 for missing robot', async () => {
      const response = await request(app).get('/api/robots/rb-999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Robot not found');
    });

    it('POST /api/robots should create a new robot', async () => {
      const newRobot = {
        name: 'Integration Test Bot',
        type: 'testing',
        location: 'test-facility'
      };

      const response = await request(app)
        .post('/api/robots')
        .send(newRobot)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Integration Test Bot');
    });

    it('POST /api/robots should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/robots')
        .send({ name: 'Only Name' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('Metrics Endpoints', () => {
    it('GET /api/metrics should return fleet metrics', async () => {
      const response = await request(app).get('/api/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fleet');
      expect(response.body.fleet).toHaveProperty('total');
      expect(response.body.fleet).toHaveProperty('byStatus');
    });

    it('GET /api/metrics/performance should return performance metrics', async () => {
      const response = await request(app).get('/api/metrics/performance');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('throughput');
    });

    it('GET /api/metrics/uptime should return uptime stats', async () => {
      const response = await request(app).get('/api/metrics/uptime');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentSession');
      expect(response.body).toHaveProperty('historical');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});
