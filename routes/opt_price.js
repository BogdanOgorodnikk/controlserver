const Router = require('koa-router')
const router = new Router()
const Opt_price = require('../models/Opt_price')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/optprice', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const optprices = await sequelize.query(
            `SELECT * FROM opt_prices`
        )
        return ctx.body = optprices[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/optprice', authMiddleware, async ctx => {
    const {number} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const optprice = await Opt_price.create({
            number: number
        })
        return ctx.body = optprice
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/optprice/:id', authMiddleware, async ctx => {
    const {number} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const optprice = await Opt_price.update(
            {number: number},
            {where: {id: ctx.params.id}}
        )
        return ctx.body = optprice
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/optprice/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const optprice = await Opt_price.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = optprice
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router