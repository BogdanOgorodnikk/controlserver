const Router = require('koa-router')
const router = new Router()
const PersonalExpenseComment = require('../models/Personal_expense_comment')
const PersonalExpense = require('../models/Personal_expense')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/personalexpensecomment/:expense_id', authMiddleware, async ctx => {
    const expense_id = ctx.params.expense_id

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comments = await sequelize.query(
            `SELECT personal_expense_comments.id, personal_expense_comments.description, personal_expense_comments.creater_id, personal_expense_comments.expense_id, personal_expense_comments.data_create,
                users.login as createrName
             FROM personal_expense_comments
             LEFT JOIN users ON personal_expense_comments.creater_id = users.id
             WHERE expense_id = ${expense_id}`
        )
        return ctx.body = comments[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/personalexpensecomment', authMiddleware, async ctx => {
    const {description, expense_id} = ctx.request.body

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await PersonalExpenseComment.create({
            description: description,
            expense_id: expense_id,
            creater_id: ctx.user.id
        })

        await PersonalExpense.update(
            {comment: true},
            {where: {id: expense_id}}
        )

        return ctx.body = comment
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/personalexpensecomment', authMiddleware, async ctx => {
    const {description, id} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const comment = await PersonalExpenseComment.update(
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

router.delete('/api/personalexpensecomment/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const deleteComment = await sequelize.query(
            `SELECT personal_expense_comments.id, personal_expense_comments.expense_id
             FROM personal_expense_comments
             WHERE id = ${ctx.params.id}`
        )

        const comment = await PersonalExpenseComment.destroy({
            where: {
                id: ctx.params.id
            }
        })

        const newComments = await sequelize.query(
            `SELECT id, expense_id
             FROM personal_expense_comments
             WHERE expense_id = ${deleteComment[0][0].expense_id}`
        )

        if(!!newComments[0].length !== true) {
            await PersonalExpense.update(
                {comment: false},
                {where: {id: deleteComment[0][0].expense_id}}
            )
        }

        return ctx.body = comment
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router