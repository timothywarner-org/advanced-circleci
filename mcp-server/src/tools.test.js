import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { robotTools, handleToolCall } from './tools.js';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('robotTools', () => {
  describe('tool definitions', () => {
    test('list_robots has correct schema', () => {
      expect(robotTools.list_robots).toBeDefined();
      expect(robotTools.list_robots.description).toContain('List all robots');
      expect(robotTools.list_robots.inputSchema.type).toBe('object');
      expect(robotTools.list_robots.inputSchema.properties.status).toBeDefined();
      expect(robotTools.list_robots.inputSchema.properties.location).toBeDefined();
    });

    test('get_robot has correct schema', () => {
      expect(robotTools.get_robot).toBeDefined();
      expect(robotTools.get_robot.inputSchema.required).toContain('id');
    });

    test('create_robot has correct schema', () => {
      expect(robotTools.create_robot).toBeDefined();
      expect(robotTools.create_robot.inputSchema.required).toContain('name');
      expect(robotTools.create_robot.inputSchema.required).toContain('type');
    });

    test('update_robot has correct schema', () => {
      expect(robotTools.update_robot).toBeDefined();
      expect(robotTools.update_robot.inputSchema.required).toContain('id');
    });

    test('delete_robot has correct schema', () => {
      expect(robotTools.delete_robot).toBeDefined();
      expect(robotTools.delete_robot.inputSchema.required).toContain('id');
    });

    test('schedule_maintenance has correct schema', () => {
      expect(robotTools.schedule_maintenance).toBeDefined();
      expect(robotTools.schedule_maintenance.inputSchema.required).toContain('id');
    });
  });
});

describe('handleToolCall', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list_robots', () => {
    test('returns list of robots', async () => {
      const mockRobots = {
        count: 2,
        robots: [
          { id: 'rb-001', name: 'Atlas Prime', status: 'active' },
          { id: 'rb-002', name: 'Welder X7', status: 'active' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRobots)
      });

      const result = await handleToolCall('list_robots', {});

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toEqual(mockRobots);
    });

    test('applies status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ count: 1, robots: [] })
      });

      await handleToolCall('list_robots', { status: 'active' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots?status=active',
        expect.any(Object)
      );
    });

    test('applies location filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ count: 0, robots: [] })
      });

      await handleToolCall('list_robots', { location: 'factory-floor-a' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots?location=factory-floor-a',
        expect.any(Object)
      );
    });
  });

  describe('get_robot', () => {
    test('returns robot by ID', async () => {
      const mockRobot = { id: 'rb-001', name: 'Atlas Prime', status: 'active' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRobot)
      });

      const result = await handleToolCall('get_robot', { id: 'rb-001' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots/rb-001',
        expect.objectContaining({ method: 'GET' })
      );
      expect(JSON.parse(result.content[0].text)).toEqual(mockRobot);
    });

    test('returns error for not found robot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Robot not found' })
      });

      const result = await handleToolCall('get_robot', { id: 'rb-999' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Robot not found');
    });
  });

  describe('create_robot', () => {
    test('creates a new robot', async () => {
      const newRobot = {
        id: 'rb-abc123',
        name: 'Test Bot',
        type: 'assembly',
        status: 'inactive',
        location: 'unassigned'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(newRobot)
      });

      const result = await handleToolCall('create_robot', {
        name: 'Test Bot',
        type: 'assembly'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test Bot', type: 'assembly', location: undefined })
        })
      );
      expect(JSON.parse(result.content[0].text)).toEqual(newRobot);
    });

    test('creates robot with location', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'rb-xyz' })
      });

      await handleToolCall('create_robot', {
        name: 'Test Bot',
        type: 'welding',
        location: 'factory-floor-a'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots',
        expect.objectContaining({
          body: JSON.stringify({
            name: 'Test Bot',
            type: 'welding',
            location: 'factory-floor-a'
          })
        })
      );
    });
  });

  describe('update_robot', () => {
    test('updates robot status', async () => {
      const updatedRobot = { id: 'rb-001', name: 'Atlas Prime', status: 'maintenance' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updatedRobot)
      });

      const result = await handleToolCall('update_robot', {
        id: 'rb-001',
        status: 'maintenance'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots/rb-001',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'maintenance' })
        })
      );
      expect(JSON.parse(result.content[0].text)).toEqual(updatedRobot);
    });

    test('updates multiple fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'rb-001' })
      });

      await handleToolCall('update_robot', {
        id: 'rb-001',
        name: 'New Name',
        location: 'warehouse-1',
        batteryLevel: 50
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots/rb-001',
        expect.objectContaining({
          body: JSON.stringify({
            name: 'New Name',
            location: 'warehouse-1',
            batteryLevel: 50
          })
        })
      );
    });
  });

  describe('delete_robot', () => {
    test('deletes a robot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await handleToolCall('delete_robot', { id: 'rb-001' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots/rb-001',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
    });

    test('returns error for non-existent robot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Robot not found' })
      });

      const result = await handleToolCall('delete_robot', { id: 'rb-999' });

      expect(result.isError).toBe(true);
    });
  });

  describe('schedule_maintenance', () => {
    test('schedules maintenance for a robot', async () => {
      const maintenanceResult = {
        robotId: 'rb-001',
        robotName: 'Atlas Prime',
        maintenanceType: 'routine',
        status: 'scheduled'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(maintenanceResult)
      });

      const result = await handleToolCall('schedule_maintenance', {
        id: 'rb-001',
        type: 'routine'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots/rb-001/maintenance',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ type: 'routine', scheduledDate: undefined })
        })
      );
      expect(JSON.parse(result.content[0].text)).toEqual(maintenanceResult);
    });

    test('schedules maintenance with date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'scheduled' })
      });

      await handleToolCall('schedule_maintenance', {
        id: 'rb-001',
        type: 'repair',
        scheduledDate: '2024-12-30T10:00:00Z'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/robots/rb-001/maintenance',
        expect.objectContaining({
          body: JSON.stringify({
            type: 'repair',
            scheduledDate: '2024-12-30T10:00:00Z'
          })
        })
      );
    });
  });

  describe('error handling', () => {
    test('handles unknown tool', async () => {
      const result = await handleToolCall('unknown_tool', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool');
    });

    test('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handleToolCall('list_robots', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Network error');
    });
  });
});
