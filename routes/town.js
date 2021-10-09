const Router = require('koa-router')
const router = new Router()
const Town = require('../models/Town')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/town', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 6 || ctx.user.ban == 1) {
            return ctx.status = 400
        } else if(ctx.user.role_id > 0 && ctx.user.role_id < 5) {
            const towns = await sequelize.query(
                'SELECT * FROM towns'
            )
            return ctx.body = towns[0]
        } else if(ctx.user.role_id == 5) {
            const towns = await sequelize.query(
                `SELECT * FROM towns where manager_id = ${ctx.user.id} or safemanager_id = ${ctx.user.id} or securitymanager_id = ${ctx.user.id} or second_security_manager_id = ${ctx.user.id} or third_security_manager_id = ${ctx.user.id}`
            )
            return ctx.body = towns[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/town/:id', authMiddleware, async ctx => {
    const id = ctx.params.id
    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const towns = await sequelize.query(
            `SELECT * FROM towns where id = ${id}`
        )
        return ctx.body = towns[0]
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/townstate', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 2 || ctx.user.role_id == 1  && ctx.user.ban == 1 || ctx.user.role_id == 2  && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const regions = await sequelize.query(
            `SELECT * FROM regions`
        )
        const areas = await sequelize.query(
            `SELECT * FROM areas`
        )
        return ctx.body = {
            regions: regions[0],
            areas: areas[0]
        }
    } catch (e) {
        ctx.body = e
    }
})

router.post('/api/town', authMiddleware, async ctx => {
    const {name, region, area} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 2 || ctx.user.role_id == 1 && ctx.user.ban == 1 || ctx.user.role_id == 2 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const town = await Town.create({
            name: name,
            region: region,
            area: area
        })
        ctx.body = town
    } catch (e) {
        ctx.body = e
    }
})

router.put('/api/town/:id', authMiddleware, async ctx => {
    const {name, region, area} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const town = await Town.update(
            {
                name: name,
                region: region,
                area: area,
            },
            {where: {id: ctx.params.id}}
        )
        ctx.body = town
    } catch (e) {
        ctx.body = e
    }
})

router.put('/api/town/manager/:id', authMiddleware, async ctx => {
    const {manager_id, safemanager_id, securitymanager_id, second_security_manager_id, third_security_manager_id} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const town = await Town.update(
            {manager_id: manager_id, safemanager_id: safemanager_id, securitymanager_id: securitymanager_id, second_security_manager_id: second_security_manager_id, third_security_manager_id: third_security_manager_id},
            {where: {id: ctx.params.id}}
        )
        ctx.body = town
    } catch (e) {
        ctx.body = e
    }
})

router.delete('/api/town/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const town = await Town.destroy({
            where: {
                id: ctx.params.id
            }
        })
        ctx.body = town
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router