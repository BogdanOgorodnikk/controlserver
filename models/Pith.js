const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
    'piths', 
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        data: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        number: {
            type: Sequelize.FLOAT
        },
        price_cash: {
            type: Sequelize.FLOAT
        },
        price_rosdb: {
            type: Sequelize.FLOAT
        },
        math: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        client_id: {
            type: Sequelize.INTEGER
        },
        creater: {
            type: Sequelize.INTEGER
        },
        data_create: {
            type: Sequelize.DATE
        }
    },
    {
        timestamps: false
    }
)