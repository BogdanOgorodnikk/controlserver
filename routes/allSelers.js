const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/allselers', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id == 1 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.car_number, orders.firm, orders.data, orders.data_create, orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless, orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, orders.creater, orders.region, orders.debt, orders.client_id, clients.name, users.login FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                where firm != ""`
            )
            return ctx.body = {
                allSelers: allSelers[0],
            }
        } else if(ctx.user.role_id == 2 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.order_number, orders.car_number, orders.firm, orders.data, orders.product_name, orders.opt_price, orders.count, orders.delivery_cash, orders.delivery_cashless, orders.region, orders.client_id, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != ""`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 3 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.car_number, orders.firm, orders.data, orders.product_name, orders.opt_price, orders.price_cash, orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.pay_cash, orders.pay_cashless, orders.region, orders.client_id, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != ""`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 4 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.car_number, orders.firm, orders.data, orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, orders.delivery_cash, orders.delivery_cashless, orders.pay_cashless, orders.region, orders.client_id, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != ""`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})


module.exports = router