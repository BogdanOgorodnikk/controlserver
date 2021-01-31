const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/alldebts', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const debts = await sequelize.query(
            `SELECT sum(orders.debt) as sumDebt, orders.client_id, clients.name FROM orders 
            LEFT JOIN clients ON orders.client_id = clients.id
            GROUP BY clients.id
            `
        )
        const pithDebts = await sequelize.query(
            `SELECT sum(piths.price_cash*(piths.number * 1.4)) as sumPith, piths.client_id FROM piths 
            LEFT JOIN clients ON piths.client_id = clients.id
            WHERE piths.math = 1
            GROUP BY clients.id
            `
        )
        return ctx.body = {
            debts: debts[0],
            pithDebts: pithDebts[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router