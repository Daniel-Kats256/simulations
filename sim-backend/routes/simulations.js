const express = require('express');
const { Simulation } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Enhanced simulation function with better data capture
const simulateAttack = async (simulationType, config = {}) => {
  console.log(`🚀 Starting ${simulationType} simulation...`);
  
  const startTime = Date.now();
  const delay = Math.random() * 3000 + 2000; // 2-5 seconds simulation time
  
  try {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const simulations = {
      'DDoS': {
        success: Math.random() > 0.3,
        metrics: {
          requestsPerSecond: Math.floor(Math.random() * 10000) + 1000,
          targetResponseTime: Math.floor(Math.random() * 500) + 100,
          successfulBlocks: Math.floor(Math.random() * 80) + 20,
          duration: Math.floor(delay / 1000),
          totalRequests: Math.floor(Math.random() * 50000) + 10000,
          blockedRequests: Math.floor(Math.random() * 40000) + 8000,
          averageLatency: Math.floor(Math.random() * 200) + 50
        }
      },
      'Malware': {
        success: Math.random() > 0.25,
        metrics: {
          detectionRate: Math.floor(Math.random() * 40) + 60,
          filesScanned: Math.floor(Math.random() * 50000) + 10000,
          threatsFound: Math.floor(Math.random() * 5) + 1,
          quarantined: Math.floor(Math.random() * 3) + 1,
          scanDuration: Math.floor(delay / 1000),
          falsePositives: Math.floor(Math.random() * 2),
          systemImpact: Math.floor(Math.random() * 20) + 5
        }
      },
      'Phishing': {
        success: Math.random() > 0.4,
        metrics: {
          emailsSent: Math.floor(Math.random() * 100) + 50,
          clickRate: Math.floor(Math.random() * 30) + 5,
          credentialsHarvested: Math.floor(Math.random() * 10) + 1,
          detected: Math.random() > 0.6,
          campaignDuration: Math.floor(delay / 1000),
          targetsReached: Math.floor(Math.random() * 200) + 100,
          securityAlerts: Math.floor(Math.random() * 15) + 5
        }
      },
      'Ransomware': {
        success: Math.random() > 0.2,
        metrics: {
          filesEncrypted: Math.floor(Math.random() * 1000) + 100,
          encryptionTime: Math.floor(Math.random() * 30) + 5,
          detectionTime: Math.floor(Math.random() * 60) + 10,
          recoveryPossible: Math.random() > 0.3,
          ransomDemand: Math.floor(Math.random() * 50000) + 10000,
          affectedSystems: Math.floor(Math.random() * 10) + 1,
          backupStatus: Math.random() > 0.7
        }
      },
      'SQL Injection': {
        success: Math.random() > 0.35,
        metrics: {
          queriesAttempted: Math.floor(Math.random() * 20) + 5,
          successful: Math.floor(Math.random() * 8) + 1,
          dataExfiltrated: Math.floor(Math.random() * 1000) + 100,
          blocked: Math.random() > 0.5,
          attackDuration: Math.floor(delay / 1000),
          vulnerableEndpoints: Math.floor(Math.random() * 5) + 1,
          securityPatches: Math.floor(Math.random() * 3)
        }
      }
    };

    const result = simulations[simulationType] || simulations['DDoS'];
    const endTime = Date.now();
    const actualDuration = Math.floor((endTime - startTime) / 1000);
    
    console.log(`✅ ${simulationType} simulation completed in ${actualDuration}s`);
    
    return {
      status: result.success ? 'completed' : 'failed',
      result: JSON.stringify({
        simulationType,
        success: result.success,
        metrics: result.metrics,
        timestamp: new Date().toISOString(),
        duration: actualDuration,
        message: result.success ? 
          `${simulationType} simulation completed successfully` : 
          `${simulationType} simulation failed - countermeasures effective`,
        details: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          config: config,
          performance: {
            cpuUsage: Math.floor(Math.random() * 80) + 20,
            memoryUsage: Math.floor(Math.random() * 60) + 40,
            networkTraffic: Math.floor(Math.random() * 1000) + 100
          }
        }
      })
    };
  } catch (error) {
    console.error(`❌ ${simulationType} simulation failed:`, error);
    return {
      status: 'failed',
      result: JSON.stringify({
        simulationType,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        message: `Simulation execution failed: ${error.message}`
      })
    };
  }
};

// Launch new simulation (admin and analyst only)
router.post('/', authenticateToken, authorizeRoles('admin', 'analyst'), async (req, res) => {
  console.log('🔐 Authenticated user:', req.user);
  console.log('📝 Request body:', req.body);
  
  try {
    const { simulationName, simulationType, status, result } = req.body;
    
    // Validate required fields
    if (!simulationName || !simulationType) {
      return res.status(400).json({ 
        message: 'simulationName and simulationType are required' 
      });
    }

    // Create initial simulation record with enhanced data
    const simulation = await Simulation.create({
      simulationName: simulationName.trim(),
      simulationType,
      config: req.body.config || {},
      launchedBy: req.user.id,
      status: 'running',
      result: JSON.stringify({
        status: 'initializing',
        message: 'Simulation is starting...',
        timestamp: new Date().toISOString()
      }),
    });

    console.log(`📊 Created simulation record with ID: ${simulation.id}`);

    // Run the simulation asynchronously with better error handling
    simulateAttack(simulationType, req.body.config)
      .then(async (simulationResult) => {
        try {
          console.log(`🔄 Updating simulation ${simulation.id} with results:`, simulationResult.status);
          
          // Update simulation with results
          await simulation.update({
            status: simulationResult.status,
            result: simulationResult.result
          });
          
          console.log(`✅ Simulation ${simulation.id} updated successfully`);
        } catch (updateError) {
          console.error(`❌ Failed to update simulation ${simulation.id}:`, updateError);
          
          // Try to update with error information
          await simulation.update({
            status: 'failed',
            result: JSON.stringify({
              error: 'Failed to update simulation results',
              originalError: updateError.message,
              timestamp: new Date().toISOString()
            })
          });
        }
      })
      .catch(async (error) => {
        console.error(`❌ Simulation ${simulation.id} execution error:`, error);
        
        try {
          await simulation.update({
            status: 'failed',
            result: JSON.stringify({
              error: 'Simulation execution failed',
              message: error.message,
              timestamp: new Date().toISOString(),
              stack: error.stack
            })
          });
        } catch (updateError) {
          console.error(`❌ Failed to update failed simulation ${simulation.id}:`, updateError);
        }
      });

    res.status(201).json({
      message: 'Simulation launched successfully',
      simulation: {
        id: simulation.id,
        simulationName: simulation.simulationName,
        simulationType: simulation.simulationType,
        status: simulation.status,
        launchedBy: simulation.launchedBy,
        createdAt: simulation.createdAt
      }
    });
  } catch (err) {
    console.error('❌ Error creating simulation:', err);
    res.status(400).json({ 
      message: 'Failed to launch simulation', 
      error: err.message 
    });
  }
});

// Get simulations for user (all roles) with enhanced error handling
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`📋 Fetching simulations for user: ${req.user.id} (role: ${req.user.role})`);
    
    let simulations;
    if (req.user.role === 'admin') {
      simulations = await Simulation.findAll({
        include: [{
          model: User,
          as: 'Launcher',
          attributes: ['id', 'name', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      simulations = await Simulation.findAll({ 
        where: { launchedBy: req.user.id },
        include: [{
          model: User,
          as: 'Launcher',
          attributes: ['id', 'name', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });
    }
    
    console.log(`📊 Found ${simulations.length} simulations`);
    
    // Validate and clean simulation data
    const cleanedSimulations = simulations.map(sim => {
      const simData = sim.toJSON();
      
      // Ensure all required fields are present
      if (!simData.result) {
        simData.result = JSON.stringify({
          status: 'no_data',
          message: 'No result data available',
          timestamp: new Date().toISOString()
        });
      }
      
      // Validate result is valid JSON
      try {
        JSON.parse(simData.result);
      } catch (e) {
        simData.result = JSON.stringify({
          error: 'Invalid result data',
          originalData: simData.result,
          timestamp: new Date().toISOString()
        });
      }
      
      return simData;
    });
    
    res.json(cleanedSimulations);
  } catch (err) {
    console.error('❌ Error fetching simulations:', err);
    res.status(500).json({ message: 'Error fetching simulations', error: err.message });
  }
});

// Get specific simulation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let whereClause = { id };
    
    // Non-admin users can only see their own simulations
    if (req.user.role !== 'admin') {
      whereClause.launchedBy = req.user.id;
    }
    
    const simulation = await Simulation.findOne({ where: whereClause });
    
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }
    
    res.json(simulation);
  } catch (err) {
    console.error('Error fetching simulation:', err);
    res.status(500).json({ message: 'Error fetching simulation' });
  }
});

// Delete simulation (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const simulation = await Simulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }
    await simulation.destroy();
    res.json({ message: 'Simulation deleted' });
  } catch (err) {
    console.error('Error deleting simulation:', err);
    res.status(500).json({ message: 'Error deleting simulation' });
  }
});

module.exports = router;
