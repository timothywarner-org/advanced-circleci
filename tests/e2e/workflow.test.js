/**
 * End-to-End Tests: User Workflows
 * Tests complete user scenarios from start to finish
 */

const request = require('supertest');
const app = require('../../src/index');

describe('E2E Workflow Tests', () => {
  describe('Robot Lifecycle Workflow', () => {
    let createdRobotId;

    it('should complete full robot lifecycle: create -> update -> maintenance -> delete', async () => {
      // Step 1: Create a new robot
      const createResponse = await request(app)
        .post('/api/robots')
        .send({
          name: 'E2E Test Robot',
          type: 'e2e-testing',
          location: 'test-warehouse'
        });

      expect(createResponse.status).toBe(201);
      createdRobotId = createResponse.body.id;
      expect(createdRobotId).toBeDefined();

      // Step 2: Verify robot exists
      const getResponse = await request(app).get(
        `/api/robots/${createdRobotId}`
      );

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe('E2E Test Robot');
      expect(getResponse.body.status).toBe('inactive');

      // Step 3: Activate the robot
      const activateResponse = await request(app)
        .put(`/api/robots/${createdRobotId}`)
        .send({ status: 'active' });

      expect(activateResponse.status).toBe(200);
      expect(activateResponse.body.status).toBe('active');

      // Step 4: Schedule maintenance
      const maintenanceResponse = await request(app)
        .post(`/api/robots/${createdRobotId}/maintenance`)
        .send({
          type: 'routine',
          scheduledDate: '2024-03-01T10:00:00Z'
        });

      expect(maintenanceResponse.status).toBe(200);
      expect(maintenanceResponse.body.status).toBe('scheduled');

      // Step 5: Move to maintenance status
      const updateResponse = await request(app)
        .put(`/api/robots/${createdRobotId}`)
        .send({
          status: 'maintenance',
          location: 'maintenance-bay'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.status).toBe('maintenance');

      // Step 6: Decommission the robot
      const deleteResponse = await request(app).delete(
        `/api/robots/${createdRobotId}`
      );

      expect(deleteResponse.status).toBe(204);

      // Step 7: Verify robot no longer exists
      const verifyResponse = await request(app).get(
        `/api/robots/${createdRobotId}`
      );

      expect(verifyResponse.status).toBe(404);
    });
  });

  describe('Fleet Monitoring Workflow', () => {
    it('should retrieve comprehensive fleet status', async () => {
      // Get all robots
      const robotsResponse = await request(app).get('/api/robots');
      expect(robotsResponse.status).toBe(200);

      // Get fleet metrics
      const metricsResponse = await request(app).get('/api/metrics');
      expect(metricsResponse.status).toBe(200);

      // Verify metrics match robot count
      expect(metricsResponse.body.fleet.total).toBe(
        robotsResponse.body.count
      );

      // Get performance metrics
      const perfResponse = await request(app).get('/api/metrics/performance');
      expect(perfResponse.status).toBe(200);
      expect(perfResponse.body.response.avgLatencyMs).toBeDefined();

      // Get uptime stats
      const uptimeResponse = await request(app).get('/api/metrics/uptime');
      expect(uptimeResponse.status).toBe(200);
      expect(uptimeResponse.body.historical.last24h).toBeDefined();
    });
  });

  describe('Health Monitoring Workflow', () => {
    it('should pass all health checks for production readiness', async () => {
      // Basic health
      const healthResponse = await request(app).get('/api/health');
      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.status).toBe('healthy');

      // Liveness probe
      const liveResponse = await request(app).get('/api/health/live');
      expect(liveResponse.status).toBe(200);
      expect(liveResponse.body.status).toBe('alive');

      // Readiness probe
      const readyResponse = await request(app).get('/api/health/ready');
      expect(readyResponse.status).toBe(200);
      expect(readyResponse.body.status).toBe('ready');

      // All checks passed = production ready
      expect(readyResponse.body.checks.database).toBe('connected');
      expect(readyResponse.body.checks.cache).toBe('connected');
    });
  });

  describe('Filtering and Search Workflow', () => {
    it('should filter robots by multiple criteria', async () => {
      // Get active robots
      const activeResponse = await request(app).get('/api/robots?status=active');
      expect(activeResponse.status).toBe(200);
      activeResponse.body.robots.forEach((robot) => {
        expect(robot.status).toBe('active');
      });

      // Get robots in specific location
      const locationResponse = await request(app).get(
        '/api/robots?location=factory-floor-a'
      );
      expect(locationResponse.status).toBe(200);
      locationResponse.body.robots.forEach((robot) => {
        expect(robot.location).toBe('factory-floor-a');
      });
    });
  });
});
