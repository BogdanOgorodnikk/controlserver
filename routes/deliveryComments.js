const Router = require('koa-router')
const router = new Router()
const DeliveryComments = require('../models/Delivery_comments')
const Deliveries = require('../models/Deliveries')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/deliverycomment/:delivery_id', authMiddleware, async ctx => {
    const delivery_id = ctx.params.delivery_id

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const comments = await sequelize.query(
            `SELECT delivery_comments.id, delivery_comments.description, delivery_comments.creater_id, 
                delivery_comments.delivery_id, delivery_comments.data_create,
                users.login as createrName
             FROM delivery_comments
             LEFT JOIN users ON delivery_comments.creater_id = users.id
             WHERE delivery_id = ${delivery_id}`
        )
        return ctx.body = comments[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/deliverycomment', authMiddleware, async ctx => {
    const {description, delivery_id} = ctx.request.body

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await DeliveryComments.create({
            description: description,
            delivery_id: delivery_id,
            creater_id: ctx.user.id
        })

        await Deliveries.update(
            {comment: true},
            {where: {id: delivery_id}}
        )

        const newComment = await sequelize.query(
            `SELECT delivery_comments.id, delivery_comments.description, delivery_comments.creater_id, 
                delivery_comments.delivery_id, delivery_comments.data_create,
                users.login as createrName
             FROM delivery_comments
             LEFT JOIN users ON delivery_comments.creater_id = users.id
             WHERE delivery_comments.id = ${comment.id}`
        )

        return ctx.body = newComment[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/deliverycomment', authMiddleware, async ctx => {
    const {description, id} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await DeliveryComments.update(
            {
                description: description,
            },
            {where: {id: id}}
        )

        const newComment = await sequelize.query(
            `SELECT delivery_comments.id, delivery_comments.description, delivery_comments.creater_id,
                delivery_comments.delivery_id, delivery_comments.data_create,
                users.login as createrName
             FROM delivery_comments
             LEFT JOIN users ON delivery_comments.creater_id = users.id
             WHERE delivery_comments.id = ${id}`
        )

        return ctx.body = newComment[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/deliverycomment/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const deleteComment = await sequelize.query(
            `SELECT delivery_comments.id, delivery_comments.delivery_id
             FROM delivery_comments
             WHERE id = ${ctx.params.id}`
        )

        const comment = await DeliveryComments.destroy({
            where: {
                id: ctx.params.id
            }
        })

        const newComments = await sequelize.query(
            `SELECT id, delivery_id
             FROM delivery_comments
             WHERE delivery_id = ${deleteComment[0][0].delivery_id}`
        )

        if(!!newComments[0].length !== true) {
            await Deliveries.update(
                {comment: false},
                {where: {id: deleteComment[0][0].delivery_id}}
            )
        }

        return ctx.body = comment
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router