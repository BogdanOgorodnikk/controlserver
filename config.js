const dotenv = require('dotenv')
const path = require('path')

const root = path.join.bind(this, __dirname)
dotenv.config({path: root('.env')});

module.exports = {
    PORT: process.env.PORT || 3000,
    USER: process.env.USER,
    HOST: process.env.HOST,
    DATABASE: process.env.DATABASE,
    PASSWORD: process.env.PASSWORD,
    SECRETKEY: process.env.SECRETKEY
}