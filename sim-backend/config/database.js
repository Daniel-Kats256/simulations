const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for development - no separate database server needed
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;