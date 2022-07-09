const Router = require('koa-router')
const router = new Router()
const Client = require('../models/Client')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/client/:town_id', authMiddleware, async ctx => {
    const town_id = ctx.params.town_id
    try {
        const townManagers = await sequelize.query(
            `SELECT * FROM towns where id = ${town_id}
            ORDER BY id`
        )
        if(ctx.user.role_id < 1 || ctx.user.role_id > 6 || ctx.user.ban == 1) {
            return ctx.status = 400
        } else if(ctx.user.role_id == 5 && townManagers[0][0].manager_id != ctx.user.id && townManagers[0][0].safemanager_id != ctx.user.id && townManagers[0][0].securitymanager_id != ctx.user.id && townManagers[0][0].second_security_manager_id != ctx.user.id && townManagers[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }
        const client = await sequelize.query(
            `SELECT * FROM clients where town_id = ${town_id}
            ORDER BY id`
        )
        if(ctx.user.role_id == 1 || ctx.user.role_id == 3) {
            const orderSum = await sequelize.query(
                `SELECT clients.id, sum(debt) as sumDebt FROM clients 
                LEFT JOIN orders ON clients.id = orders.client_id 
                where clients.town_id = ${town_id} and orders.product_name != "Перевірка"
                GROUP BY clients.id`
            )
            const pithSum = await sequelize.query(
                `SELECT clients.id, sum(price_cash*(number * 1.4)) as sumPith FROM clients 
                LEFT JOIN piths ON clients.id = piths.client_id 
                where clients.town_id = ${town_id} and piths.math = 1
                GROUP BY clients.id`
            )
            return ctx.body = {
                client: client[0],
                townManagers: townManagers[0],
                orderSum: orderSum[0],
                pithSum: pithSum[0]
            }
        } else {
            return ctx.body = {
                client: client[0],
                townManagers: townManagers[0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/allclients', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 ||  ctx.user.ban == 1) {
            return ctx.status = 400
        }

            const clients = await sequelize.query(
                `SELECT id, name FROM clients
            ORDER BY id`
            )
            return ctx.body = {
                clients: clients[0]
            }



    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/clientinfo/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban === 1) {
            return ctx.status = 400
        }

        const client = await sequelize.query(
            `SELECT clients.id, clients.name, clients.phone, clients.shop_street, clients.shop_name, 
             clients.reserve_name, clients.reserve_phone, clients.town_id, towns.name as townName
             FROM clients
             LEFT JOIN towns ON clients.town_id = towns.id
             WHERE clients.id = ${ctx.params.id}`
        )
        return ctx.body = {
            client: client[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

router.post('/api/client/:town_id', authMiddleware, async ctx => {
    const {name, phone, shopStreet, shopName, reserveName, reservePhone} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 2 && ctx.user.role_id != 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const client = await Client.create({
            name: name, 
            phone: phone, 
            shop_street: shopStreet, 
            shop_name: shopName, 
            reserve_name: reserveName, 
            reserve_phone: reservePhone,
            town_id: ctx.params.town_id
        })
        return ctx.body = client
    } catch (e) {
        ctx.body = e
    }
})

router.put('/api/client/:client_id', authMiddleware, async ctx => {
    const {name, phone, shopStreet, shopName, reserveName, reservePhone} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 2 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const townManagers = await sequelize.query(
            `SELECT clients.town_id, towns.manager_id, towns.safemanager_id, towns.securitymanager_id, towns.second_security_manager_id, towns.third_security_manager_id
            from clients 
            LEFT JOIN towns ON town_id = towns.id 
            where clients.id = ${ctx.params.client_id}`
        )
        if(ctx.user.role_id == 5 && townManagers[0][0].manager_id != ctx.user.id && townManagers[0][0].safemanager_id != ctx.user.id && townManagers[0][0].securitymanager_id != ctx.user.id && townManagers[0][0].second_security_manager_id != ctx.user.id && townManagers[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }
        const client = await Client.update(
            {
            name: name, 
            phone: phone, 
            shop_street: shopStreet, 
            shop_name: shopName, 
            reserve_name: reserveName, 
            reserve_phone: reservePhone,
            },
            {where: {id: ctx.params.client_id}})
        ctx.body = client
    } catch (e) {
        ctx.body = e
    }
})

router.delete('/api/client/:client_id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const client = await Client.destroy({
            where: {
                id: ctx.params.client_id
            }
        })
        ctx.body = client
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router