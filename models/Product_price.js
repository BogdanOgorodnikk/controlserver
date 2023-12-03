const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'product_prices',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_name: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.DOUBLE
        },
        firm: {
            type: Sequelize.STRING
        },
    },
    {
        timestamps: false
    }
)