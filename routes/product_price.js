const Router = require('koa-router')
const router = new Router()
const Product_price = require('../models/Product_price')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/productprices', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const products = await sequelize.query(
            `SELECT * FROM product_prices
            ORDER BY id`
        )
        return ctx.body = products[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/productprice', authMiddleware, async ctx => {
    const {product_name, price, firm} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Product_price.create({
            product_name,
            price,
            firm
        })

        const newProduct = await sequelize.query(
            `SELECT * FROM product_prices
            where product_prices.id = ${product.id}`
        )

        return ctx.body = newProduct[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/productprice/:id', authMiddleware, async ctx => {
    const {product_name, price, firm} = ctx.request.body

    try {
        if(ctx.user.role_id !=1  && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Product_price.update(
            {product_name, price, firm},
            {where: {id: ctx.params.id}}
        )

        const newProduct = await sequelize.query(
            `SELECT * FROM product_prices
            where product_prices.id = ${ctx.params.id}`
        )

        return ctx.body = newProduct[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/productprice/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const product = await Product_price.destroy({
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