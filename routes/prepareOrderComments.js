const Router = require('koa-router')
const router = new Router()
const PrepareOrderComment = require('../models/Prepare_order_comment')
const PrepareOrder = require('../models/Prepare_order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/preparecomment/:order_id', authMiddleware, async ctx => {
    const order_id = ctx.params.order_id

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comments = await sequelize.query(
            `SELECT prepare_order_comments.id, prepare_order_comments.description, prepare_order_comments.creater_id, prepare_order_comments.order_id, prepare_order_comments.data_create,
                users.login as createrName
             FROM prepare_order_comments
             LEFT JOIN users ON prepare_order_comments.creater_id = users.id
             WHERE order_id = ${order_id}`
        )
        return ctx.body = comments[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/preparecomment', authMiddleware, async ctx => {
    const {description, order_id} = ctx.request.body

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await PrepareOrderComment.create({
            description: description,
            order_id: order_id,
            creater_id: ctx.user.id
        })

        await PrepareOrder.update(
            {comment: true},
            {where: {id: order_id}}
        )

        const comments = await sequelize.query(
            `SELECT prepare_order_comments.id, prepare_order_comments.description, prepare_order_comments.creater_id, prepare_order_comments.order_id, prepare_order_comments.data_create,
                users.login as createrName
             FROM prepare_order_comments
             LEFT JOIN users ON prepare_order_comments.creater_id = users.id
             WHERE prepare_order_comments.id = ${comment.id}`
        )

        return ctx.body = comments[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/preparecomment', authMiddleware, async ctx => {
    const {description, id} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await PrepareOrderComment.update(
            {
                description: description,
            },
            {where: {id: id}}
        )

        const comments = await sequelize.query(
            `SELECT prepare_order_comments.id, prepare_order_comments.description, prepare_order_comments.creater_id, prepare_order_comments.order_id, prepare_order_comments.data_create,
                users.login as createrName
             FROM prepare_order_comments
             LEFT JOIN users ON prepare_order_comments.creater_id = users.id
             WHERE prepare_order_comments.id = ${id}`
        )

        return ctx.body = comments[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/preparecomment/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const deleteComment = await sequelize.query(
            `SELECT prepare_order_comments.id, prepare_order_comments.order_id
             FROM prepare_order_comments
             WHERE id = ${ctx.params.id}`
        )

        const comment = await PrepareOrderComment.destroy({
            where: {
                id: ctx.params.id
            }
        })

        const newComments = await sequelize.query(
            `SELECT id, order_id
             FROM prepare_order_comments
             WHERE order_id = ${deleteComment[0][0].order_id}`
        )

        if(!!newComments[0].length !== true) {
            await PrepareOrder.update(
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