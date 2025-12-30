/**
 * Unit Tests: Robot Service
 * Tests the business logic layer
 */

const RobotService = require('../../src/services/robotService');

describe('RobotService', () => {
  let service;

  beforeEach(() => {
    service = new RobotService();
  });

  describe('getAllRobots', () => {
    it('should return an array of robots', () => {
      const robots = service.getAllRobots();
      expect(Array.isArray(robots)).toBe(true);
      expect(robots.length).toBeGreaterThan(0);
    });

    it('should return robots with required properties', () => {
      const robots = service.getAllRobots();
      const robot = robots[0];

      expect(robot).toHaveProperty('id');
      expect(robot).toHaveProperty('name');
      expect(robot).toHaveProperty('type');
      expect(robot).toHaveProperty('status');
      expect(robot).toHaveProperty('location');
    });
  });

  describe('getRobotById', () => {
    it('should return a robot when given a valid ID', () => {
      const robot = service.getRobotById('rb-001');
      expect(robot).not.toBeNull();
      expect(robot.id).toBe('rb-001');
    });

    it('should return null for non-existent ID', () => {
      const robot = service.getRobotById('rb-999');
      expect(robot).toBeNull();
    });
  });

  describe('createRobot', () => {
    it('should create a new robot with valid data', () => {
      const newRobot = service.createRobot({
        name: 'Test Bot',
        type: 'testing',
        location: 'test-lab'
      });

      expect(newRobot).toHaveProperty('id');
      expect(newRobot.name).toBe('Test Bot');
      expect(newRobot.type).toBe('testing');
      expect(newRobot.status).toBe('inactive');
      expect(newRobot.batteryLevel).toBe(100);
    });

    it('should assign default location when not provided', () => {
      const newRobot = service.createRobot({
        name: 'Minimal Bot',
        type: 'basic'
      });

      expect(newRobot.location).toBe('unassigned');
    });
  });

  describe('updateRobot', () => {
    it('should update robot properties', () => {
      const updated = service.updateRobot('rb-001', {
        status: 'maintenance',
        location: 'repair-bay'
      });

      expect(updated.status).toBe('maintenance');
      expect(updated.location).toBe('repair-bay');
    });

    it('should return null for non-existent robot', () => {
      const result = service.updateRobot('rb-999', { status: 'active' });
      expect(result).toBeNull();
    });

    it('should ignore non-allowed fields', () => {
      const original = service.getRobotById('rb-002');
      const updated = service.updateRobot('rb-002', {
        id: 'hacked-id',
        createdAt: '2000-01-01'
      });

      expect(updated.id).toBe(original.id);
      expect(updated.createdAt).toBe(original.createdAt);
    });
  });

  describe('deleteRobot', () => {
    it('should delete an existing robot', () => {
      const initialCount = service.getAllRobots().length;
      const result = service.deleteRobot('rb-005');

      expect(result).toBe(true);
      expect(service.getAllRobots().length).toBe(initialCount - 1);
    });

    it('should return false for non-existent robot', () => {
      const result = service.deleteRobot('rb-999');
      expect(result).toBe(false);
    });
  });

  describe('scheduleMaintenance', () => {
    it('should schedule maintenance for existing robot', () => {
      const result = service.scheduleMaintenance('rb-001', {
        type: 'repair',
        scheduledDate: '2024-02-01T10:00:00Z'
      });

      expect(result).toHaveProperty('robotId', 'rb-001');
      expect(result).toHaveProperty('maintenanceType', 'repair');
      expect(result).toHaveProperty('status', 'scheduled');
    });

    it('should return null for non-existent robot', () => {
      const result = service.scheduleMaintenance('rb-999', {});
      expect(result).toBeNull();
    });

    it('should use defaults when type and date not provided', () => {
      const result = service.scheduleMaintenance('rb-001', {});

      expect(result).toHaveProperty('maintenanceType', 'routine');
      expect(result).toHaveProperty('scheduledDate');
      expect(result).toHaveProperty('estimatedDuration', '2 hours');
    });
  });

  describe('getRobotsByStatus', () => {
    it('should return robots filtered by status', () => {
      const activeRobots = service.getRobotsByStatus('active');

      expect(Array.isArray(activeRobots)).toBe(true);
      activeRobots.forEach((robot) => {
        expect(robot.status).toBe('active');
      });
    });

    it('should return empty array for non-existent status', () => {
      const robots = service.getRobotsByStatus('nonexistent');
      expect(robots).toEqual([]);
    });
  });

  describe('getRobotsByLocation', () => {
    it('should return robots filtered by location', () => {
      const robots = service.getRobotsByLocation('factory-floor-a');

      expect(Array.isArray(robots)).toBe(true);
      robots.forEach((robot) => {
        expect(robot.location).toBe('factory-floor-a');
      });
    });

    it('should return empty array for non-existent location', () => {
      const robots = service.getRobotsByLocation('nonexistent-location');
      expect(robots).toEqual([]);
    });
  });
});
