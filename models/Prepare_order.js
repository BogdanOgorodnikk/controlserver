const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'prepare_orders',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_number: {
            type: Sequelize.INTEGER
        },
        note: {
            type: Sequelize.STRING
        },
        car_number: {
            type: Sequelize.STRING
        },
        firm: {
            type: Sequelize.STRING
        },
        data: {
            type: Sequelize.STRING
        },
        data_create: {
            type: Sequelize.DATE
        },
        product_name: {
            type: Sequelize.STRING
        },
        opt_price: {
            type: Sequelize.DOUBLE
        },
        count: {
            type: Sequelize.DOUBLE
        },
        delivery_cash: {
            type: Sequelize.DOUBLE
        },
        delivery_cashless: {
            type: Sequelize.DOUBLE
        },
        creater: {
            type: Sequelize.INTEGER
        },
        region: {
            type: Sequelize.STRING
        },
        client_id: {
            type: Sequelize.INTEGER
        },
        comment: {
            type: Sequelize.BOOLEAN
        },
        price_cash: {
            type: Sequelize.DOUBLE,
        }
    },
    {
        timestamps: false
    }
)