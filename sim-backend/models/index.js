const sequelize = require('../config/database');
const User = require('./user');
const Simulation = require('./simulation');

// Define relationships
Simulation.belongsTo(User, {
  foreignKey: {
    name: 'launchedBy',
    allowNull: false,
  },
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  as: 'Launcher',
});


// Export the models and sequelize instance
module.exports = {
  sequelize,
  User,
  Simulation,
};
