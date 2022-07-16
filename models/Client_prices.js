const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'client_prices',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        price: {
            type: Sequelize.STRING
        },
        clientId: {
            type: Sequelize.INTEGER,
        },
        productId: {
            type: Sequelize.INTEGER,
        },
        note: {
            type: Sequelize.STRING,
        },
    },
    {
        timestamps: false
    }
)