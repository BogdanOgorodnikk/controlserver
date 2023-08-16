const Router = require('koa-router')
const router = new Router()
const AccountPayments = require('../models/AccountPayments')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/account-payments/:id', authMiddleware, async ctx => {
    const paymentId = ctx.params.id

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT id, payment_id, DATE_FORMAT(date, '%d.%m.%Y') as date, amount, payment_number
             FROM accountPayments
             WHERE payment_id = ${paymentId}`
        )

        const accountInfo = await sequelize.query(
            `SELECT id, account_number
             FROM accounts
             WHERE id = ${paymentId}`
        )

        return ctx.body = {
            cars: cars[0],
            accountInfo: accountInfo[0][0]
        }
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/account-payments', authMiddleware, async ctx => {
    const {payment_id, date, amount, payment_number} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");


        const account = await AccountPayments.create({
            date: preparedDate,
            payment_id,
            amount,
            payment_number,
            creater_id: ctx.user.id,
            date_create: new Date()
        })

        const newAccount = await sequelize.query(
            `SELECT id, payment_id, DATE_FORMAT(date, '%d.%m.%Y') as date, amount, payment_number
             FROM accountPayments
             WHERE id = ${account.id}`
        )

        return ctx.body = newAccount[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/account-payments', authMiddleware, async ctx => {
    const {id, date, amount, payment_number} = ctx.request.body

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");

        await AccountPayments.update(
            {
                date: preparedDate,
                amount,
                payment_number,
            },
            {where: {id: id}}
        )

        const newAccount = await sequelize.query(
            `SELECT id, payment_id, DATE_FORMAT(date, '%d.%m.%Y') as date, amount, payment_number
             FROM accountPayments
             WHERE id = ${id}`
        )

        return ctx.body = newAccount[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/account-payments/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const car = await AccountPayments.destroy({
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