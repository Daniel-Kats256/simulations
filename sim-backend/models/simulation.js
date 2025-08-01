const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Simulation = sequelize.define('Simulation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  simulationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  simulationType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  config: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  launchedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  result: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'simulations',
  timestamps: true,
  underscored: true,
});

module.exports = Simulation;
