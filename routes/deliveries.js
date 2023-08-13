const Router = require('koa-router')
const router = new Router()
const Delivery = require('../models/Deliveries')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/deliveries', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT deliveries.id, deliveries.delivery_start, deliveries.delivery_end, deliveries.car_id, deliveries.cash, deliveries.cashless,
             DATE_FORMAT(deliveries.date, '%d.%m.%Y') as date, DATE_FORMAT(deliveries.date_create, '%d.%m.%Y') as date_create,
             users.login, cars.car_number
             FROM deliveries 
             JOIN users ON deliveries.creater_id = users.id
             JOIN cars ON deliveries.car_id = cars.id`
        )
        return ctx.body = cars[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/deliveries', authMiddleware, async ctx => {
    const {car_id, delivery_start, delivery_end, date, cash, cashless} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const delivery = await Delivery.create({
            car_id,
            delivery_start,
            delivery_end,
            date,
            cash,
            cashless,
            creater_id: ctx.user.id,
            date_create: new Date()
        })

        const newDelivery = await sequelize.query(
            `SELECT deliveries.id, deliveries.delivery_start, deliveries.delivery_end, deliveries.car_id, deliveries.cash, deliveries.cashless,
             DATE_FORMAT(deliveries.date, '%d.%m.%Y') as date, DATE_FORMAT(deliveries.date_create, '%d.%m.%Y') as date_create,
             users.login, cars.car_number
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
    const {id, car_id, delivery_start, delivery_end, date, cash, cashless} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        await Delivery.update(
            {
                car_id,
                delivery_start,
                delivery_end,
                date,
                cash,
                cashless
            },
            {where: {id: id}}
        )

        const newDelivery = await sequelize.query(
            `SELECT deliveries.id, deliveries.delivery_start, deliveries.delivery_end, deliveries.car_id, deliveries.cash, deliveries.cashless,
             DATE_FORMAT(deliveries.date, '%d.%m.%Y') as date, DATE_FORMAT(deliveries.date_create, '%d.%m.%Y') as date_create,
             users.login, cars.car_number
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