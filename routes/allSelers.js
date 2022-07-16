const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/allselers', authMiddleware, async ctx => {
    const start = ctx.query.start;
    const end = ctx.query.end;

    let [startDay, startMonth, startYear] = start.split(".");
    let [day, month, year] = end.split(".");

    const preparedDataStart = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");
    const preparedDataEnd = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id == 1 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm,
                DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, 
                orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, orders.pay_cash, 
                orders.pay_cashless, orders.delta_cashless, orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, 
                orders.creater, orders.region, orders.debt, orders.client_id, clients.name, users.login, towns.name as town_name, 
                towns.area FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                JOIN towns ON clients.town_id = towns.id
                where firm != "" and pay_cashless = 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0],
            }
        } else if(ctx.user.role_id == 2 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.product_name,
                orders.opt_price, orders.count, orders.delivery_cash, orders.delivery_cashless,
                orders.region, orders.client_id, clients.name
                FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != "" and pay_cashless = 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 3 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.note, orders.comment, orders.order_number, orders.car_number, orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.pay_cash, orders.pay_cashless, orders.region, orders.client_id, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != "" and pay_cashless = 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 4 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.note, orders.comment, orders.order_number, orders.car_number, orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, orders.delivery_cash, orders.delivery_cashless, orders.pay_cashless, orders.region, orders.client_id, orders.delta_mas_cashless, clients.name FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                where firm != "" and pay_cashless = 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'
                ORDER BY orders.id`
            )
            return ctx.body = {
                allSelers: allSelers[0]
            }
        } else if(ctx.user.role_id == 5 && ctx.user.ban == 0) {
            const allSelers = await sequelize.query(
                `SELECT orders.id, orders.note, orders.comment, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.product_name, orders.creater,
                orders.price_cash, orders.price_cashless, orders.count, orders.delivery_cash, orders.delivery_cashless,
                orders.region, orders.client_id, clients.name, orders.sumseller, orders.general_sum, towns.name as town_name
                FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN towns ON clients.town_id = towns.id 
                where (towns.manager_id = ${ctx.user.id} or towns.safemanager_id = ${ctx.user.id} or towns.securitymanager_id = ${ctx.user.id} or towns.second_security_manager_id = ${ctx.user.id} or towns.third_security_manager_id = ${ctx.user.id}) and firm != "" and pay_cashless = 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'
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

module.exports = router