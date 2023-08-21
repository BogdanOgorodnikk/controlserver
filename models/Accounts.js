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
            type: Sequelize.DOUBLE
        },
        firm: {
            type: Sequelize.STRING
        },
        curator_id: {
            type: Sequelize.INTEGER
        },
        client: {
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