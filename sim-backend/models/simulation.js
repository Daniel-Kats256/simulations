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
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Simulation;
