const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'cars',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        car_number: {
            type: Sequelize.STRING
        },
    },
    {
        timestamps: false
    }
)