const Router = require('koa-router')
const router = new Router()
const Curator = require('../models/Curator')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/curators', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT id, name
             FROM curators`
        )
        return ctx.body = cars[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/curators', authMiddleware, async ctx => {
    const {name} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const account = await Curator.create({
            name,
        })

        const newAccount = await sequelize.query(
            `SELECT id, name
             FROM curators 
             WHERE id = ${account.id}`
        )

        return ctx.body = newAccount[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/curators', authMiddleware, async ctx => {
    const {id, name} = ctx.request.body

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        await Curator.update(
            {
                name,
            },
            {where: {id: id}}
        )

        const newAccount = await sequelize.query(
            `SELECT id, name
             FROM curators 
             WHERE id = ${id}`
        )

        return ctx.body = newAccount[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/curators/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const car = await Curator.destroy({
            where: {
                id: ctx.params.id
            }
        })

        return ctx.body = car
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router