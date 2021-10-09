const Router = require('koa-router')
const router = new Router()
const Comment = require('../models/Comment')
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/comment/:order_id', authMiddleware, async ctx => {
    const order_id = ctx.params.order_id

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comments = await sequelize.query(
            `SELECT comments.id, comments.description, comments.creater_id, comments.order_id, comments.data_create,
                users.login as createrName
             FROM comments
             LEFT JOIN users ON comments.creater_id = users.id
             WHERE order_id = ${order_id}`
        )
        return ctx.body = comments[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/comment', authMiddleware, async ctx => {
    const {description, order_id} = ctx.request.body

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await Comment.create({
            description: description,
            order_id: order_id,
            creater_id: ctx.user.id
        })

        await Order.update(
            {comment: true},
            {where: {id: order_id}}
        )

        return ctx.body = comment
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/comment', authMiddleware, async ctx => {
    const {description, id} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await Comment.update(
            {
                description: description,
            },
            {where: {id: id}}
        )
        return ctx.body = {
            comment
        }
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/comment/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const deleteComment = await sequelize.query(
            `SELECT comments.id, comments.order_id
             FROM comments
             WHERE id = ${ctx.params.id}`
        )

        const comment = await Comment.destroy({
            where: {
                id: ctx.params.id
            }
        })

        const newComments = await sequelize.query(
            `SELECT id, order_id
             FROM comments
             WHERE order_id = ${deleteComment[0][0].order_id}`
        )

        if(!!newComments[0].length !== true) {
            await Order.update(
                {comment: false},
                {where: {id: deleteComment[0][0].order_id}}
            )
        }

        return ctx.body = comment
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router