const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/allselers', authMiddleware, async ctx => {
    const start = ctx.query.start;
    const end = ctx.query.end;

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id == 1 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm, orders.data, orders.data_create, 
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, 
                orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, orders.pay_cash, 
                orders.pay_cashless, orders.delta_cashless, orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, 
                orders.creater, orders.region, orders.debt, orders.client_id, clients.name, users.login, towns.name as town_name, 
                towns.area FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                JOIN towns ON clients.town_id = towns.id
                where firm != "" and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0],
            }
        } else if(ctx.user.role_id == 2 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm, orders.data, orders.product_name, orders.opt_price, orders.count, orders.delivery_cash, orders.delivery_cashless, orders.region, orders.client_id, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != "" and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 3 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.note, orders.comment, orders.order_number, orders.car_number, orders.firm, orders.data, orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.pay_cash, orders.pay_cashless, orders.region, orders.client_id, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != "" and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 4 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.note, orders.comment, orders.order_number, orders.car_number, orders.firm, orders.data, orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, orders.delivery_cash, orders.delivery_cashless, orders.pay_cashless, orders.region, orders.client_id, orders.delta_mas_cashless, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != "" and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 5 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.note, orders.comment, orders.data, orders.product_name, orders.creater,
                orders.price_cash, orders.price_cashless, orders.count, orders.delivery_cash, orders.delivery_cashless,
                orders.region, orders.client_id, clients.name, orders.sumseller, orders.general_sum
                FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN towns ON clients.town_id = towns.id 
                where (towns.manager_id = ${ctx.user.id} or towns.safemanager_id = ${ctx.user.id} or towns.securitymanager_id = ${ctx.user.id} or towns.second_security_manager_id = ${ctx.user.id} or towns.third_security_manager_id = ${ctx.user.id}) and firm != "" and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/allselersinfo', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const allFirms = await sequelize.query(`
            SELECT * FROM firm_names
            ORDER BY id
        `)

        const allProductNames = await sequelize.query(`
            SELECT * FROM product_names
            ORDER BY id
        `)

        const allRegions = await sequelize.query(`
            SELECT * FROM regions
            ORDER BY id
        `)

        return ctx.body = {
            allFirms: allFirms[0],
            allProductNames: allProductNames[0],
            allRegions: allRegions[0],
        }
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router