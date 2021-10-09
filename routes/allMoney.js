const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/cashmoney', authMiddleware, async ctx => {
    const start = ctx.query.start;
    const end = ctx.query.end;

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 3 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id === 1 || ctx.user.role_id === 3) {
            const cashmoneys = await sequelize.query(
                `SELECT orders.id, orders.data, orders.comment, DATE_FORMAT(orders.data_create, '%Y-%m-%d %H:%i') as data_create, orders.creater, orders.client_id, orders.product_name, orders.pay_cash, 
                IFNULL(clients.name, '') AS name, users.login FROM orders
                LEFT JOIN clients ON orders.client_id = clients.id
                JOIN users ON orders.creater = users.id 
                WHERE firm = "" and pay_cash != 0 and product_name != "Перевірка" and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                cashmoneys: cashmoneys[0]
            }
        } else if(ctx.user.role_id === 5) {
            const cashmoneys = await sequelize.query(
                `SELECT orders.id, orders.data, orders.comment, orders.creater, orders.client_id, orders.product_name, orders.pay_cash, IFNULL(clients.name, '') AS name, users.login FROM orders
                LEFT JOIN clients ON orders.client_id = clients.id
                JOIN users ON orders.creater = users.id 
                WHERE ((clients.id IS NULL and product_name = "Перевірка" and orders.creater = ${ctx.user.id}) or (firm = "" and pay_cash != 0 and product_name != "Перевірка" and orders.creater = ${ctx.user.id})) and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                cashmoneys: cashmoneys[0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/cashlessmoney', authMiddleware, async ctx => {
    const start = ctx.query.start;
    const end = ctx.query.end;

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 3 && ctx.user.role_id != 4 && ctx.user.role_id != 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id === 1 || ctx.user.role_id === 3 || ctx.user.role_id === 4) {
            const cashlessmoneys = await sequelize.query(
                `SELECT orders.id, orders.data, orders.comment, DATE_FORMAT(orders.data_create, '%Y-%m-%d %H:%i') as data_create, orders.creater, orders.client_id, orders.product_name, orders.pay_cashless, clients.name, users.login FROM orders
                LEFT JOIN clients ON orders.client_id = clients.id
                JOIN users ON orders.creater = users.id 
                WHERE firm = "" and pay_cashless != 0 and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                cashlessmoneys: cashlessmoneys[0]
            }
        } else if(ctx.user.role_id === 5) {
            const cashlessmoneys = await sequelize.query(
                `SELECT orders.id, orders.data, orders.comment, orders.creater, orders.client_id, orders.product_name, 
                 orders.pay_cashless, clients.name, users.login 
                FROM orders
                LEFT JOIN clients ON orders.client_id = clients.id
                JOIN users ON orders.creater = users.id 
                JOIN towns ON clients.town_id = towns.id 
                WHERE (towns.manager_id = ${ctx.user.id} or towns.safemanager_id = ${ctx.user.id} or towns.securitymanager_id = ${ctx.user.id} or towns.second_security_manager_id = ${ctx.user.id} or towns.third_security_manager_id = ${ctx.user.id}) and firm = "" and pay_cashless != 0 and DATE(orders.data) BETWEEN '${start}' AND '${end}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                cashlessmoneys: cashlessmoneys[0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router