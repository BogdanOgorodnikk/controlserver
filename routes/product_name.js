const Router = require('koa-router')
const router = new Router()
const Product_name = require('../models/Product_name')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/productname', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const products = await sequelize.query(
            `SELECT * FROM product_names
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allProducts', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const products = await sequelize.query(
            `SELECT * FROM product_names
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/productname', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Product_name.create({
            name: name
        })

        const newProduct = await sequelize.query(
            `SELECT * FROM product_names
            where product_names.id = ${product.id}`
        )

        return ctx.body = newProduct[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/productname/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Product_name.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )

        const newProduct = await sequelize.query(
            `SELECT * FROM product_names
            where product_names.id = ${ctx.params.id}`
        )

        return ctx.body = newProduct[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/productname/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Product_name.destroy({
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