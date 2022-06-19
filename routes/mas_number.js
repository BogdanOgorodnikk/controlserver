const Router = require('koa-router')
const router = new Router()
const Mas_number = require('../models/Mas_number')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/masnumber', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const masnumbers = await sequelize.query(
            `SELECT * FROM mas_numbers
            ORDER BY id`
        )
        return ctx.body = masnumbers[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allMas', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const masnumbers = await sequelize.query(
            `SELECT * FROM mas_numbers
            ORDER BY id`
        )
        return ctx.body = masnumbers[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/masnumber', authMiddleware, async ctx => {
    const {number} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const masnumber = await Mas_number.create({
            number: number
        })

        const newMas = await sequelize.query(
            `SELECT * FROM mas_numbers
            where mas_numbers.id = ${masnumber.id}`
        )

        return ctx.body = newMas[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/masnumber/:id', authMiddleware, async ctx => {
    const {number} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const masnumber = await Mas_number.update(
            {number: number},
            {where: {id: ctx.params.id}}
        )

        const newMas = await sequelize.query(
            `SELECT * FROM mas_numbers
            where mas_numbers.id = ${ctx.params.id}`
        )

        return ctx.body = newMas[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/masnumber/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const masnumber = await Mas_number.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = masnumber
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router