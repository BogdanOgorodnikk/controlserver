const Router = require('koa-router')
const router = new Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/allusers', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const allusers = await sequelize.query(
            'SELECT * FROM users'
        )
        return ctx.body = allusers[0]
    } catch (e) {
        ctx.body = e
    }
})

router.put('/api/allusers/:id', authMiddleware, async ctx => {
    const {role_id, ban} = ctx.request.body

    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const user = await User.update(
            {role_id, ban, count: ban ? 3 : 0},
            {where: {id: ctx.params.id}}
        )
        const updatedUser = await sequelize.query(
            `SELECT id, login, password, role_id, ban FROM users where id = ${ctx.params.id}`
        )

        ctx.body = updatedUser[0][0]
    } catch (e) {
        ctx.body = e
    }
})

router.put('/api/allusers/edit/:id', authMiddleware, async ctx => {
    const {login, password} = ctx.request.body
    const hash = await bcrypt.hashSync(password, 10);

    try {
        if(ctx.user.role_id != 1 || ctx.user.role_id == 1 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const user = await User.update(
            {login: login, password: hash},
            {where: {id: ctx.params.id}}
        )

        const updatedUser = await sequelize.query(
            `SELECT id, login, password, role_id, ban FROM users where id = ${ctx.params.id}`
        )

        ctx.body = updatedUser[0][0]
    } catch (e) {
        ctx.body = e
    }
})

module.exports = router