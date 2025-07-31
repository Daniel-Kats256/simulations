const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,         // name is required
      validate: {
        notEmpty: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,         // username is required
      validate: {
        notEmpty: true,
        len: [3, 50],           // minimum 3, max 50 characters
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,         // password required (hashed)
    },
    role: {
      type: DataTypes.ENUM('admin', 'analyst', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer',
      validate: {
        isIn: [['admin', 'analyst', 'viewer']],
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,          // createdAt, updatedAt
    underscored: true,         // snake_case columns: created_at, updated_at
  }
);

module.exports = User;
