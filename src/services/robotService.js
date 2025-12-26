/**
 * Robot Service
 * Business logic for robot fleet management
 */

const { v4: uuidv4 } = require('uuid');

// In-memory data store (simulating database)
const robots = [
  {
    id: 'rb-001',
    name: 'Atlas Prime',
    type: 'assembly',
    status: 'active',
    location: 'factory-floor-a',
    batteryLevel: 87,
    lastMaintenance: '2024-01-10T14:30:00Z',
    createdAt: '2023-06-15T09:00:00Z'
  },
  {
    id: 'rb-002',
    name: 'Welder X7',
    type: 'welding',
    status: 'active',
    location: 'factory-floor-b',
    batteryLevel: 92,
    lastMaintenance: '2024-01-12T10:00:00Z',
    createdAt: '2023-07-20T11:30:00Z'
  },
  {
    id: 'rb-003',
    name: 'Inspector Bot',
    type: 'quality-control',
    status: 'maintenance',
    location: 'maintenance-bay',
    batteryLevel: 45,
    lastMaintenance: '2024-01-18T08:00:00Z',
    createdAt: '2023-08-05T14:00:00Z'
  },
  {
    id: 'rb-004',
    name: 'Cargo Hauler',
    type: 'logistics',
    status: 'active',
    location: 'warehouse-1',
    batteryLevel: 78,
    lastMaintenance: '2024-01-08T16:00:00Z',
    createdAt: '2023-05-10T08:00:00Z'
  },
  {
    id: 'rb-005',
    name: 'Precision Arm',
    type: 'assembly',
    status: 'offline',
    location: 'factory-floor-a',
    batteryLevel: 12,
    lastMaintenance: '2023-12-20T12:00:00Z',
    createdAt: '2023-04-01T10:00:00Z'
  }
];

class RobotService {
  getAllRobots() {
    return [...robots];
  }

  getRobotById(id) {
    return robots.find((r) => r.id === id) || null;
  }

  createRobot({ name, type, location = 'unassigned' }) {
    const robot = {
      id: `rb-${uuidv4().slice(0, 8)}`,
      name,
      type,
      status: 'inactive',
      location,
      batteryLevel: 100,
      lastMaintenance: null,
      createdAt: new Date().toISOString()
    };

    robots.push(robot);
    return robot;
  }

  updateRobot(id, updates) {
    const index = robots.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const allowedUpdates = ['name', 'status', 'location', 'batteryLevel'];
    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    robots[index] = { ...robots[index], ...filteredUpdates };
    return robots[index];
  }

  deleteRobot(id) {
    const index = robots.findIndex((r) => r.id === id);
    if (index === -1) return false;

    robots.splice(index, 1);
    return true;
  }

  scheduleMaintenance(id, { type, scheduledDate }) {
    const robot = this.getRobotById(id);
    if (!robot) return null;

    return {
      robotId: id,
      robotName: robot.name,
      maintenanceType: type || 'routine',
      scheduledDate: scheduledDate || new Date().toISOString(),
      estimatedDuration: '2 hours',
      status: 'scheduled'
    };
  }

  getRobotsByStatus(status) {
    return robots.filter((r) => r.status === status);
  }

  getRobotsByLocation(location) {
    return robots.filter((r) => r.location === location);
  }
}

module.exports = RobotService;
