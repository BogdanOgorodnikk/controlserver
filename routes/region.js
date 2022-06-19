const Router = require('koa-router')
const router = new Router()
const Region = require('../models/Region')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/region', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const regions = await sequelize.query(
            `SELECT * FROM regions
            ORDER BY id`
        )
        return ctx.body = regions[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allRegions', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const regions = await sequelize.query(
            `SELECT * FROM regions
            ORDER BY id`
        )
        return ctx.body = regions[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/region', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const region = await Region.create({
            name: name
        })

        const newRegion = await sequelize.query(
            `SELECT * FROM regions
            where regions.id = ${region.id}`
        )

        return ctx.body = newRegion[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/region/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const region = await Region.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )

        const newRegion = await sequelize.query(
            `SELECT * FROM regions
            where regions.id = ${ctx.params.id}`
        )

        return ctx.body = newRegion[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/region/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const region = await Region.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = region
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router