const Router = require('koa-router')
const router = new Router()
const Firm_name = require('../models/Firm_name')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/firmname', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firms = await sequelize.query(
            `SELECT * FROM firm_names
            ORDER BY id`
        )
        return ctx.body = firms[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allFirms', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firms = await sequelize.query(
            `SELECT * FROM firm_names
            ORDER BY id`
        )
        return ctx.body = firms[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/firmname', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firm = await Firm_name.create({
            name: name
        })

        const newFirm = await sequelize.query(
            `SELECT * FROM firm_names
            where firm_names.id = ${firm.id}`
        )

        return ctx.body = newFirm[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/firmname/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firm = await Firm_name.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )

        const newFirm = await sequelize.query(
            `SELECT * FROM firm_names
            where firm_names.id = ${ctx.params.id}`
        )


        return ctx.body = newFirm[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/firmname/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const firm = await Firm_name.destroy({
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