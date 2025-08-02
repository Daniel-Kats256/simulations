const { Simulation, User } = require('../models');
const sequelize = require('../config/database');

class DatabaseHelper {
  // Check database connection and table status
  static async checkDatabaseHealth() {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection is healthy');
      
      // Check if tables exist
      const tables = await sequelize.showAllSchemas();
      console.log('📋 Available tables:', tables.map(t => t.name));
      
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  // Get simulation statistics
  static async getSimulationStats() {
    try {
      const totalSimulations = await Simulation.count();
      const completedSimulations = await Simulation.count({ where: { status: 'completed' } });
      const failedSimulations = await Simulation.count({ where: { status: 'failed' } });
      const runningSimulations = await Simulation.count({ where: { status: 'running' } });
      
      const stats = {
        total: totalSimulations,
        completed: completedSimulations,
        failed: failedSimulations,
        running: runningSimulations,
        successRate: totalSimulations > 0 ? (completedSimulations / totalSimulations * 100).toFixed(2) : 0
      };
      
      console.log('📊 Simulation Statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Failed to get simulation stats:', error);
      return null;
    }
  }

  // Validate simulation data integrity
  static async validateSimulationData() {
    try {
      const simulations = await Simulation.findAll();
      const issues = [];
      
      simulations.forEach((sim, index) => {
        const simData = sim.toJSON();
        
        // Check for missing required fields
        if (!simData.simulationName) {
          issues.push(`Simulation ${simData.id}: Missing simulation name`);
        }
        
        if (!simData.simulationType) {
          issues.push(`Simulation ${simData.id}: Missing simulation type`);
        }
        
        if (!simData.launchedBy) {
          issues.push(`Simulation ${simData.id}: Missing launchedBy field`);
        }
        
        // Check result field
        if (simData.result) {
          try {
            JSON.parse(simData.result);
          } catch (e) {
            issues.push(`Simulation ${simData.id}: Invalid JSON in result field`);
          }
        }
        
        // Check for orphaned simulations (no user)
        if (simData.launchedBy) {
          // This would need to be checked against the users table
        }
      });
      
      if (issues.length === 0) {
        console.log('✅ All simulation data is valid');
      } else {
        console.log('⚠️ Data validation issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      return issues;
    } catch (error) {
      console.error('❌ Failed to validate simulation data:', error);
      return ['Validation failed due to error'];
    }
  }

  // Clean up invalid or corrupted data
  static async cleanupInvalidData() {
    try {
      const simulations = await Simulation.findAll();
      let cleanedCount = 0;
      
      for (const sim of simulations) {
        const simData = sim.toJSON();
        let needsUpdate = false;
        let updatedData = {};
        
        // Fix missing simulation names
        if (!simData.simulationName || simData.simulationName.trim() === '') {
          updatedData.simulationName = `Unnamed ${simData.simulationType} Simulation`;
          needsUpdate = true;
        }
        
        // Fix invalid result JSON
        if (simData.result) {
          try {
            JSON.parse(simData.result);
          } catch (e) {
            updatedData.result = JSON.stringify({
              error: 'Invalid result data',
              originalData: simData.result,
              timestamp: new Date().toISOString()
            });
            needsUpdate = true;
          }
        }
        
        // Fix missing status
        if (!simData.status) {
          updatedData.status = 'unknown';
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await sim.update(updatedData);
          cleanedCount++;
        }
      }
      
      console.log(`🧹 Cleaned up ${cleanedCount} simulation records`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup invalid data:', error);
      return 0;
    }
  }

  // Get detailed simulation information
  static async getSimulationDetails(simulationId) {
    try {
      const simulation = await Simulation.findByPk(simulationId);
      
      if (!simulation) {
        console.log(`❌ Simulation ${simulationId} not found`);
        return null;
      }
      
      const simData = simulation.toJSON();
      const details = {
        id: simData.id,
        name: simData.simulationName,
        type: simData.simulationType,
        status: simData.status,
        launchedBy: simData.launchedBy,
        createdAt: simData.createdAt,
        updatedAt: simData.updatedAt,
        config: simData.config,
        result: simData.result ? JSON.parse(simData.result) : null
      };
      
      console.log('📋 Simulation Details:', details);
      return details;
    } catch (error) {
      console.error(`❌ Failed to get simulation ${simulationId} details:`, error);
      return null;
    }
  }

  // Export simulation data for analysis
  static async exportSimulationData() {
    try {
      const simulations = await Simulation.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      const exportData = simulations.map(sim => {
        const simData = sim.toJSON();
        return {
          id: simData.id,
          simulationName: simData.simulationName,
          simulationType: simData.simulationType,
          status: simData.status,
          launchedBy: simData.launchedBy,
          createdAt: simData.createdAt,
          updatedAt: simData.updatedAt,
          config: simData.config,
          result: simData.result ? JSON.parse(simData.result) : null
        };
      });
      
      console.log(`📤 Exported ${exportData.length} simulation records`);
      return exportData;
    } catch (error) {
      console.error('❌ Failed to export simulation data:', error);
      return [];
    }
  }

  // Reset database (use with caution)
  static async resetDatabase() {
    try {
      console.log('⚠️ Resetting database...');
      await sequelize.sync({ force: true });
      console.log('✅ Database reset completed');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      return false;
    }
  }
}

module.exports = DatabaseHelper;