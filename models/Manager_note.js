const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'manager_notes',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: Sequelize.STRING
        },
        creater_id: {
            type: Sequelize.INTEGER
        },
        manager_id: {
            type: Sequelize.INTEGER
        },
        data_create: {
            type: Sequelize.DATE
        },
    },
    {
        timestamps: false
    }
)