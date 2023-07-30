const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'orders', 
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_number: {
            type: Sequelize.INTEGER
        },
        comment: {
          type: Sequelize.BOOLEAN
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
        price_cash: {
            type: Sequelize.DOUBLE
        },
        price_cashless: {
            type: Sequelize.DOUBLE
        },
        count: {
            type: Sequelize.DOUBLE
        },
        sumseller: {
            type: Sequelize.DOUBLE
        },
        delivery_cash: {
            type: Sequelize.DOUBLE
        },
        delivery_cashless: {
            type: Sequelize.DOUBLE
        },
        general_sum: {
            type: Sequelize.DOUBLE
        },
        pay_cash: {
            type: Sequelize.DOUBLE
        },
        pay_cashless: {
            type: Sequelize.DOUBLE
        },
        delta_cashless: {
            type: Sequelize.DOUBLE
        },
        delta_mas_cashless: {
            type: Sequelize.DOUBLE
        },
        delta_cash: {
            type: Sequelize.DOUBLE
        },
        delta_mas_cash: {
            type: Sequelize.DOUBLE
        },
        creater: {
            type: Sequelize.INTEGER
        },
        region: {
            type: Sequelize.STRING
        },
        debt: {
            type: Sequelize.DOUBLE
        },
        client_id: {
            type: Sequelize.INTEGER
        },
        isSelfCar: {
            type: Sequelize.BOOLEAN
        },
        account_number: {
            type: Sequelize.STRING
        },
        original_data_create: {
            type: Sequelize.DATE
        },
        original_data_update: {
            type: Sequelize.DATE,
        }
    },
    {
        timestamps: false
    }
)