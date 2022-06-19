const Router = require('koa-router')
const router = new Router()
const Area = require('../models/Area')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/area', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const areas = await sequelize.query(
            `SELECT * FROM areas
            ORDER BY id`
        )
        return ctx.body = areas[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/area', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const area = await Area.create({
            name: name
        })

        const newArea = await sequelize.query(
            `SELECT * FROM areas
            where areas.id = ${area.id}`
        )

        return ctx.body = newArea[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/area/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const area = await Area.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )

        const newArea = await sequelize.query(
            `SELECT * FROM areas
            where areas.id = ${ctx.params.id}`
        )

        return ctx.body = newArea[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/area/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const area = await Area.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = area
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router