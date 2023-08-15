const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'accounts',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: Sequelize.DATE
        },
        date_create: {
            type: Sequelize.DATE
        },
        account_number: {
            type: Sequelize.STRING
        },
        account_amount: {
            type: Sequelize.FLOAT
        },
        firm: {
            type: Sequelize.STRING
        },
        manager: {
            type: Sequelize.STRING
        },
        payment_date: {
            type: Sequelize.DATE
        },
        payment_amount: {
            type: Sequelize.FLOAT
        },
        payment_number: {
            type: Sequelize.STRING
        },
        debt: {
            type: Sequelize.FLOAT
        },
        creater_id: {
            type: Sequelize.INTEGER
        },
    },
    {
        timestamps: false
    }
)