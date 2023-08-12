const Router = require('koa-router')
const router = new Router()
const Car = require('../models/Car')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/cars', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT *
             FROM cars`
        )
        return ctx.body = cars[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/car', authMiddleware, async ctx => {
    const {car_number} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const car = await Car.create({
            car_number
        })

        const newCar = await sequelize.query(
            `SELECT id, car_number
             FROM cars
             WHERE id = ${car.id}`
        )

        return ctx.body = newCar[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/car', authMiddleware, async ctx => {
    const {car_number, id} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        await Car.update(
            {
                car_number: car_number,
            },
            {where: {id: id}}
        )

        const newCar = await sequelize.query(
            `SELECT id, car_number
             FROM cars
             WHERE id = ${id}`
        )

        return ctx.body = newCar[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/car/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const car = await Car.destroy({
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