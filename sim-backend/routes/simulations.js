const express = require('express');
const { Simulation } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Launch new simulation (admin and analyst only)
router.post('/', authenticateToken, authorizeRoles('admin', 'analyst'), async (req, res) => {
    console.log('Authenticated user:', req.user);
  try {
    const simulation = await Simulation.create({
      config: req.body.config,
      launchedBy: req.user.id,
      result: null,
    });
    res.status(201).json(simulation);
  } catch (err) {
    res.status(400).json({ message: 'Failed to launch simulation', error: err.message });
  }
});

// Get simulations for user (all roles)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let simulations;
    if (req.user.role === 'admin') {
      simulations = await Simulation.findAll();
    } else {
      simulations = await Simulation.findAll({ where: { launchedBy: req.user.id } });
    }
    res.json(simulations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching simulations' });
  }
});

module.exports = router;
