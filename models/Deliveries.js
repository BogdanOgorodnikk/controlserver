const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'deliveries',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        car_id: {
            type: Sequelize.INTEGER
        },
        delivery_start: {
            type: Sequelize.STRING
        },
        delivery_end: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.DATE
        },
        date_create: {
            type: Sequelize.DATE
        },
        creater_id: {
            type: Sequelize.INTEGER
        },
    },
    {
        timestamps: false
    }
)