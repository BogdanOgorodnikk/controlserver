const Router = require('koa-router')
const router = new Router()
const Client_prices = require('../models/Client_prices')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/allClientPrices', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const prices = await sequelize.query(
            `SELECT client_prices.id, client_prices.price, client_prices.clientId,
             clients.name as clientName, product_names.name as productName, client_prices.productId
            FROM client_prices
            JOIN clients ON client_prices.clientId = clients.id
            JOIN product_names ON client_prices.productId = product_names.id
            ORDER BY id`
        )
        return ctx.body = prices[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/clientPrices/:clientId', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firms = await sequelize.query(
            `SELECT client_prices.id, client_prices.price, client_prices.clientId,
             clients.name as clientName, product_names.name as productName, client_prices.productId
            FROM client_prices
            JOIN clients ON client_prices.clientId = clients.id
            JOIN product_names ON client_prices.productId = product_names.id
            where client_prices.clientId = ${ctx.params.clientId}`
        )
        return ctx.body = firms[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/allClientPrices', authMiddleware, async ctx => {
    const {price, clientId, productId} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const prices = await Client_prices.create({
            price: price,
            clientId,
            productId,
        })

        const newPrice = await sequelize.query(
            `SELECT client_prices.id, client_prices.price, client_prices.clientId,
             clients.name as clientName, product_names.name as productName, client_prices.productId
            FROM client_prices
            JOIN clients ON client_prices.clientId = clients.id
            JOIN product_names ON client_prices.productId = product_names.id
            where client_prices.id = ${prices.id}`
        )

        return ctx.body = newPrice[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/allClientPrices/:id', authMiddleware, async ctx => {
    const {price, productId} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firm = await Client_prices.update(
            {price: price, productId},
            {where: {id: ctx.params.id}}
        )

        const newFirm = await sequelize.query(
            `SELECT client_prices.id, client_prices.price, client_prices.clientId,
             clients.name as clientName, product_names.name as productName, client_prices.productId
            FROM client_prices
            JOIN clients ON client_prices.clientId = clients.id
            JOIN product_names ON client_prices.productId = product_names.id
            where client_prices.id = ${ctx.params.id}`
        )


        return ctx.body = newFirm[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/allClientPrices/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firm = await Client_prices.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = firm
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router