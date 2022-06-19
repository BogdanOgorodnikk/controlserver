const Router = require('koa-router')
const router = new Router()
const Personal_expense = require('../models/Personal_expense')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/myexpenses/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id <= 0 || ctx.user.role_id >= 6 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.id != ctx.params.id) {
            return ctx.status = 404
        }
        const myexpenses = await sequelize.query(
            `SELECT id, name, DATE_FORMAT(data, '%d.%m.%Y') as data, number, comment
            FROM personal_expenses 
            where creater = ${ctx.params.id}
            ORDER BY id`
        )
        return ctx.body = myexpenses[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allpersonalexpenses', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const pesonal = await sequelize.query(
            `SELECT id, login FROM users ORDER BY id`
        )
        return ctx.body = pesonal[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/personalexpenses/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const personalExpenses = await sequelize.query(
            `SELECT id, name, number, 
            DATE_FORMAT(data, '%d.%m.%Y') as data, DATE_FORMAT(data_create, '%d.%m.%Y') as data_create, comment
            FROM personal_expenses 
            where creater = ${ctx.params.id}
            ORDER BY id`
        )
        return ctx.body = personalExpenses[0];

    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/personalexpense', authMiddleware, async ctx => {
    const {name, number, data} = ctx.request.body
    
    try {
        if(ctx.user.role_id <= 0 || ctx.user.role_id >= 6 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const personalExpense = await Personal_expense.create({
            name: name,
            number: number,
            data: preparedData,
            creater: ctx.user.id
        })

        const myexpenses = await sequelize.query(
            `SELECT id, name, DATE_FORMAT(data, '%d.%m.%Y') as data, number, comment
            FROM personal_expenses 
            where id = ${personalExpense.id}`
        )

        return ctx.body = myexpenses[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/checkexpensesmoney/:id', authMiddleware, async ctx => {
    const {number, data} = ctx.request.body
    
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const checkmoney = await Personal_expense.create({
            name: 'Перевірка',
            number: number,
            data: preparedData,
            creater: ctx.params.id
        })

        const myexpenses = await sequelize.query(
            `SELECT id, name,
                DATE_FORMAT(data, '%d.%m.%Y') as data, DATE_FORMAT(data_create, '%d.%m.%Y') as data_create,
                number, comment
            FROM personal_expenses 
            where id = ${checkmoney.id}`
        )

        return ctx.body = myexpenses[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/personalexpense/:id', authMiddleware, async ctx => {
    const {name, number, data} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const personalExpense = await Personal_expense.update(
            {name: name,
             number: number,
             data: preparedData
            },
            {where: {id: ctx.params.id}}
        )

        const myexpenses = await sequelize.query(
            `SELECT id, name, 
            DATE_FORMAT(data, '%d.%m.%Y') as data, DATE_FORMAT(data_create, '%d.%m.%Y') as data_create,
             number, comment
            FROM personal_expenses 
            where id = ${ctx.params.id}`
        )

        return ctx.body = myexpenses[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/personalexpense/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const personalExpense = await Personal_expense.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = personalExpense
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router