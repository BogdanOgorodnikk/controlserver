const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'clients', 
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        shop_street: {
            type: Sequelize.STRING
        },
        shop_name: {
            type: Sequelize.STRING
        },
        reserve_name: {
            type: Sequelize.STRING
        },
        reserve_phone: {
            type: Sequelize.STRING
        },
        coefCash: {
            type: Sequelize.FLOAT
        },
        coefCashless: {
            type: Sequelize.FLOAT
        },
        town_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'towns',
                key: 'id'
            }
        },
        email: {
            type: Sequelize.STRING
        },
        birthday: {
            type: Sequelize.DATE
        }
    },
    {
        timestamps: false
    }
)