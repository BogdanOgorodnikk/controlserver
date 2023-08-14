const Router = require('koa-router')
const router = new Router()
const Delivery = require('../models/Deliveries')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/deliveries', authMiddleware, async ctx => {
    const start = ctx.query.start;
    const end = ctx.query.end;

    const product = ctx.query.product;
    const client = ctx.query.client;
    const carNumber = ctx.query.carNumber;
    const isShownCash = ctx.query.isShownCash;
    const isShownCashless = ctx.query.isShownCashless;

    let [startDay, startMonth, startYear] = start.split(".");
    let [day, month, year] = end.split(".");

    const preparedDataStart = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");
    const preparedDataEnd = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    const productQuery = product ? `deliveries.product LIKE '%${product}%' and` : ''
    const clientQuery = client ? `deliveries.client LIKE '%${client}%' and` : ''
    const carNumberQuery = carNumber ? `cars.car_number = '${carNumber}' and` : ''
    const isShownCashQuery = !isShownCash ? `deliveries.cash = 0 and` : ''
    const isShownCashlessQuery = !isShownCashless ? `deliveries.cashless = 0 and` : ''

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT deliveries.id, deliveries.delivery_start, deliveries.delivery_end, deliveries.car_id, deliveries.cash, deliveries.cashless,
             DATE_FORMAT(deliveries.date, '%d.%m.%Y') as date, DATE_FORMAT(deliveries.date_create, '%d.%m.%Y') as date_create,
             users.login, cars.car_number, deliveries.product, deliveries.client
             FROM deliveries 
             JOIN users ON deliveries.creater_id = users.id
             JOIN cars ON deliveries.car_id = cars.id
             WHERE ${productQuery} ${clientQuery} ${carNumberQuery} ${isShownCashQuery} ${isShownCashlessQuery} DATE(deliveries.date) >= '${preparedDataStart}' AND DATE(deliveries.date) <= '${preparedDataEnd}'`
        )
        return ctx.body = cars[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/deliveries', authMiddleware, async ctx => {
    const {car_id, delivery_start, delivery_end, date, cash, cashless, product, client} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");

        const delivery = await Delivery.create({
            car_id,
            delivery_start,
            delivery_end,
            date: preparedDate,
            cash,
            cashless,
            product,
            client,
            creater_id: ctx.user.id,
            date_create: new Date()
        })

        const newDelivery = await sequelize.query(
            `SELECT deliveries.id, deliveries.delivery_start, deliveries.delivery_end, deliveries.car_id, deliveries.cash, deliveries.cashless,
             DATE_FORMAT(deliveries.date, '%d.%m.%Y') as date, DATE_FORMAT(deliveries.date_create, '%d.%m.%Y') as date_create,
             users.login, cars.car_number, deliveries.product, deliveries.client
             FROM deliveries 
             JOIN users ON deliveries.creater_id = users.id
             JOIN cars ON deliveries.car_id = cars.id
             WHERE deliveries.id = ${delivery.id}`
        )

        return ctx.body = newDelivery[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/deliveries', authMiddleware, async ctx => {
    const {id, car_id, delivery_start, delivery_end, date, cash, cashless, product, client} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");

        await Delivery.update(
            {
                car_id,
                delivery_start,
                delivery_end,
                date: preparedDate,
                cash,
                cashless,
                product,
                client
            },
            {where: {id: id}}
        )

        const newDelivery = await sequelize.query(
            `SELECT deliveries.id, deliveries.delivery_start, deliveries.delivery_end, deliveries.car_id, deliveries.cash, deliveries.cashless,
             DATE_FORMAT(deliveries.date, '%d.%m.%Y') as date, DATE_FORMAT(deliveries.date_create, '%d.%m.%Y') as date_create,
             users.login, cars.car_number, deliveries.product, deliveries.client
             FROM deliveries 
             JOIN users ON deliveries.creater_id = users.id
             JOIN cars ON deliveries.car_id = cars.id
             WHERE deliveries.id = ${id}`
        )

        return ctx.body = newDelivery[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/deliveries/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const car = await Delivery.destroy({
            where: {
                id: ctx.params.id
            }
        })

        return ctx.body = car
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router