const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/managermoney', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 3 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const managers = await sequelize.query(
            `SELECT id, login FROM users WHERE role_id = 5
            ORDER BY id`
        )
        return ctx.body = {
            managers: managers[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/managermoney/:id', authMiddleware, async ctx => {
    const id = ctx.params.id
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 3 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const manager = await sequelize.query(
            `SELECT id, login, role_id FROM users where id = ${id}`
        )
        if(manager[0][0].role_id != 5) {
            return ctx.status = 400
        }
        const managerMoney = await sequelize.query(
            `SELECT orders.id, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.comment, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create, orders.product_name, 
            orders.client_id, orders.pay_cash, 
            IFNULL(clients.name, '') AS name
            FROM orders 
            LEFT JOIN clients ON orders.client_id = clients.id
            where (creater = ${id} and orders.product_name != "Перевірка") or (creater = ${id} and orders.product_name = "Перевірка" and orders.client_id = 0)
            ORDER BY orders.id`
        )
        return ctx.body = {
            managerMoney: managerMoney[0],
            manager: manager[0],
        }
    } catch (e) {
        ctx.body = e
    }
})

router.post('/api/managercheckmoney/:id', authMiddleware, async ctx => {
    const {data, pay_cash} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const checkmoney = await Order.create({
            data: preparedData,
            product_name: "Перевірка", 
            pay_cash: pay_cash,
            creater: ctx.params.id
        })

        const managerMoney = await sequelize.query(
            `SELECT orders.id, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.comment, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create, orders.product_name, 
            orders.client_id, orders.pay_cash, 
            IFNULL(clients.name, '') AS name
            FROM orders 
            LEFT JOIN clients ON orders.client_id = clients.id
            where orders.id = ${checkmoney.id}`
        )

        return ctx.body = managerMoney[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/managermoneyedit/:id', authMiddleware, async ctx => {
    const {pay_cash} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const money = await Order.update(
            {pay_cash: pay_cash,
            debt: 0 - pay_cash},
            {where: {id: ctx.params.id}}
        )

        const managerMoney = await sequelize.query(
            `SELECT orders.id, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.comment, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create, orders.product_name, 
            orders.client_id, orders.pay_cash, 
            IFNULL(clients.name, '') AS name
            FROM orders 
            LEFT JOIN clients ON orders.client_id = clients.id
            where orders.id = ${ctx.params.id}`
        )

        return ctx.body = managerMoney[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router