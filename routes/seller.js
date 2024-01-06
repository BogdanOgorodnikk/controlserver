const Router = require('koa-router')
const router = new Router()
const Seller = require('../models/Seller')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/sellers', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const products = await sequelize.query(
            `SELECT * FROM sellers
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allSellers', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 4 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const products = await sequelize.query(
            `SELECT * FROM sellers
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/seller', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Seller.create({
            name: name
        })

        const newProduct = await sequelize.query(
            `SELECT * FROM sellers
            where sellers.id = ${product.id}`
        )

        return ctx.body = newProduct[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/seller/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Seller.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )

        const newProduct = await sequelize.query(
            `SELECT * FROM sellers
            where sellers.id = ${ctx.params.id}`
        )

        return ctx.body = newProduct[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/seller/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Seller.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = product
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router