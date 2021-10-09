const Sequelize = require('sequelize')
const config = require('../config');

const db = {}
const sequelize = new Sequelize(config.DATABASE, config.USER, config.PASSWORD, {
    host: config.HOST,
    dialect: 'mysql',
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
        port: '8889',
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db