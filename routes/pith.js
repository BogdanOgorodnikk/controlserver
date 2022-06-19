const Router = require('koa-router')
const router = new Router()
const Pith = require('../models/Pith')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/pith/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const client = await sequelize.query(
            `SELECT id, name, town_id FROM clients where id = ${client_id} ORDER BY id`
        )
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${client[0][0].town_id} ORDER BY id`
        )

        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }

        const piths = await sequelize.query(
            `SELECT piths.id, DATE_FORMAT(piths.data, '%d.%m.%Y') as data,
               piths.name, piths.number, piths.price_cash,
               piths.price_rosdb, piths.math, piths.client_id, piths.creater,
               DATE_FORMAT(piths.data_create, '%d.%m.%Y') as data_create, users.login
            FROM piths 
            LEFT JOIN users ON piths.creater = users.id
            where client_id = ${client_id}
            ORDER BY piths.id`
        )
        return ctx.body = piths[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/pithSum/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const client = await sequelize.query(
            `SELECT id, name, town_id FROM clients where id = ${client_id} ORDER BY id`
        )
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${client[0][0].town_id} ORDER BY id`
        )

        const sumPith = await sequelize.query(
            `SELECT sum(price_cash*(number * 1.6)) as sumPith FROM piths where client_id = ${client_id} and math = 1`
        )

        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }

        return ctx.body = sumPith[0][0];
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/townpith/:town_id', authMiddleware, async ctx => {
    const town_id = ctx.params.town_id
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${town_id} ORDER BY id`
        )
        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }
        const clients = await sequelize.query(
            `SELECT id, name, town_id FROM clients where town_id = ${town_id} ORDER BY id`
        )
        const piths = await sequelize.query(
            `SELECT clients.id, piths.data, piths.name, piths.number, piths.price_cash, piths.price_rosdb, piths.client_id FROM clients 
            LEFT JOIN piths ON clients.id = piths.client_id 
            where clients.town_id = ${town_id}
            ORDER BY clients.id`
        )
        return ctx.body = {
            piths: piths[0],
            clients: clients[0]
        }
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allpith', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id != 3 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const piths = await sequelize.query(
            `SELECT piths.id, DATE_FORMAT(piths.data, '%d.%m.%Y') as data, piths.name, piths.number, piths.price_cash, piths.price_rosdb, piths.math, piths.client_id, clients.name as client_name FROM piths
            LEFT JOIN clients ON piths.client_id = clients.id 
            ORDER BY piths.id`
        )
        return ctx.body = {
            piths: piths[0]
        }
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/pith/:client_id', authMiddleware, async ctx => {
    const {data, name, number, price_cash, price_rosdb} = ctx.request.body
    const client_id = ctx.params.client_id
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const client = await sequelize.query(
            `SELECT * FROM clients where id = ${client_id}`
        )
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${client[0][0].town_id}`
        )
        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const pith = await Pith.create({
            data: preparedData,
            name: name, 
            number: number, 
            price_cash: price_cash, 
            price_rosdb: price_rosdb,
            client_id: client_id,
            creater: ctx.user.id
        })

        const newPith = await sequelize.query(
            `SELECT piths.id, DATE_FORMAT(piths.data, '%d.%m.%Y') as data,
               piths.name, piths.number, piths.price_cash,
               piths.price_rosdb, piths.math, piths.client_id, piths.creater,
               DATE_FORMAT(piths.data_create, '%d.%m.%Y') as data_create, users.login
            FROM piths 
            LEFT JOIN users ON piths.creater = users.id
            where piths.id = ${pith.id}`
        )


        return ctx.body = newPith[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/pith/:id', authMiddleware, async ctx => {
    const {data, name, number, price_cash, price_rosdb} = ctx.request.body
    const id = ctx.params.id
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const pith = await Pith.update(
            {
                data: preparedData,
                name: name, 
                number: number, 
                price_cash: price_cash, 
                price_rosdb: price_rosdb
            },
            {where: {id: id}}
        )

        const newPith = await sequelize.query(
            `SELECT piths.id, DATE_FORMAT(piths.data, '%d.%m.%Y') as data,
               piths.name, piths.number, piths.price_cash,
               piths.price_rosdb, piths.math, piths.client_id, piths.creater,
               DATE_FORMAT(piths.data_create, '%d.%m.%Y') as data_create, users.login
            FROM piths 
            LEFT JOIN users ON piths.creater = users.id
            where piths.id = ${id}`
        )

        return ctx.body = newPith[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/mathpith/:id', authMiddleware, async ctx => {
    const {math} = ctx.request.body
    const id = ctx.params.id
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id != 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const piths = await sequelize.query(
            `SELECT client_id FROM piths where id = ${id}`
        )
        const client = await sequelize.query(
            `SELECT * FROM clients where id = ${piths[0][0].client_id}`
        )
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${client[0][0].town_id}`
        )
        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }
        const pith = await Pith.update(
            {
                math: math
            },
            {where: {id: id}}
        )

        const newPith = await sequelize.query(
            `SELECT piths.id, DATE_FORMAT(piths.data, '%d.%m.%Y') as data,
               piths.name, piths.number, piths.price_cash,
               piths.price_rosdb, piths.math, piths.client_id, piths.creater,
               DATE_FORMAT(piths.data_create, '%d.%m.%Y') as data_create, users.login
            FROM piths 
            LEFT JOIN users ON piths.creater = users.id
            where piths.id = ${id}`
        )

        return ctx.body = newPith[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/pith/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const pith = await Pith.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = pith
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router