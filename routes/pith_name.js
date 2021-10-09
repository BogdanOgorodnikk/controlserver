const Router = require('koa-router')
const router = new Router()
const Pith_name = require('../models/Pith_name')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/pithname', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const products = await sequelize.query(
            `SELECT * FROM pith_names
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/pithnameall', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const products = await sequelize.query(
            `SELECT * FROM pith_names
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/pithname', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const pith = await Pith_name.create({
            name: name
        })
        return ctx.body = pith
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/pithname/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const pith = await Pith_name.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )
        return ctx.body = pith
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/pithname/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const pith = await Pith_name.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = pith
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router