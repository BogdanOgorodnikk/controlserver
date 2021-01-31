const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/cashmoney', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 3 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const cashmoneys = await sequelize.query(
            `SELECT orders.id, orders.data, orders.creater, orders.client_id, orders.product_name, orders.pay_cash, clients.name, users.login FROM orders
            LEFT JOIN clients ON orders.client_id = clients.id
            JOIN users ON orders.creater = users.id 
            WHERE firm = "" and pay_cash != 0 and product_name != "Перевірка"`
        )
        return ctx.body = {
            cashmoneys: cashmoneys[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/cashlessmoney', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 3 && ctx.user.role_id != 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const cashlessmoneys = await sequelize.query(
            `SELECT orders.id, orders.data, orders.creater, orders.client_id, orders.product_name, orders.pay_cashless, clients.name, users.login FROM orders
            LEFT JOIN clients ON orders.client_id = clients.id
            JOIN users ON orders.creater = users.id 
            WHERE firm = "" and pay_cashless != 0`
        )
        return ctx.body = {
            cashlessmoneys: cashlessmoneys[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router