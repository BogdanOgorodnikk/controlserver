const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'accountPayments',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        payment_id: {
            type: Sequelize.INTEGER
        },
        date: {
            type: Sequelize.DATE
        },
        date_create: {
            type: Sequelize.DATE
        },
        amount: {
            type: Sequelize.FLOAT
        },
        payment_number: {
            type: Sequelize.STRING
        },
        creater_id: {
            type: Sequelize.INTEGER
        },
    },
    {
        timestamps: false
    }
)