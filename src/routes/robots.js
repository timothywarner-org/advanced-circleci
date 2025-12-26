/**
 * Robot Fleet Management Routes
 * Handles CRUD operations for robot units
 */

const express = require('express');
const router = express.Router();
const RobotService = require('../services/robotService');

const robotService = new RobotService();

// GET /api/robots - List all robots
router.get('/', (req, res) => {
  const { status, location } = req.query;
  let robots = robotService.getAllRobots();

  if (status) {
    robots = robots.filter((r) => r.status === status);
  }
  if (location) {
    robots = robots.filter((r) => r.location === location);
  }

  res.json({
    count: robots.length,
    robots
  });
});

// GET /api/robots/:id - Get specific robot
router.get('/:id', (req, res) => {
  const robot = robotService.getRobotById(req.params.id);

  if (!robot) {
    return res.status(404).json({
      error: 'Robot not found',
      robotId: req.params.id
    });
  }

  res.json(robot);
});

// POST /api/robots - Create new robot
router.post('/', (req, res) => {
  const { name, type, location } = req.body;

  if (!name || !type) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Name and type are required fields'
    });
  }

  const robot = robotService.createRobot({ name, type, location });
  res.status(201).json(robot);
});

// PUT /api/robots/:id - Update robot
router.put('/:id', (req, res) => {
  const robot = robotService.updateRobot(req.params.id, req.body);

  if (!robot) {
    return res.status(404).json({
      error: 'Robot not found',
      robotId: req.params.id
    });
  }

  res.json(robot);
});

// DELETE /api/robots/:id - Decommission robot
router.delete('/:id', (req, res) => {
  const success = robotService.deleteRobot(req.params.id);

  if (!success) {
    return res.status(404).json({
      error: 'Robot not found',
      robotId: req.params.id
    });
  }

  res.status(204).send();
});

// POST /api/robots/:id/maintenance - Schedule maintenance
router.post('/:id/maintenance', (req, res) => {
  const { type, scheduledDate } = req.body;
  const result = robotService.scheduleMaintenance(req.params.id, {
    type,
    scheduledDate
  });

  if (!result) {
    return res.status(404).json({
      error: 'Robot not found',
      robotId: req.params.id
    });
  }

  res.json(result);
});

module.exports = router;
