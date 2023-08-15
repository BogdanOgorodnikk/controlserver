const Router = require('koa-router')
const router = new Router()
const Accounts = require('../models/Accounts')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/accounts', authMiddleware, async ctx => {
    const start = ctx.query.start;
    const end = ctx.query.end;

    const firm = ctx.query.firm;
    const manager = ctx.query.manager;

    let [startDay, startMonth, startYear] = start.split(".");
    let [day, month, year] = end.split(".");

    const preparedDataStart = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");
    const preparedDataEnd = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    const firmQuery = firm ? `firm LIKE '%${firm}%' and` : ''
    const managerQuery = manager ? `manager LIKE '%${manager}%' and` : ''

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT id, DATE_FORMAT(date, '%d.%m.%Y') as date, account_number, account_amount, firm, manager, DATE_FORMAT(payment_date, '%d.%m.%Y') as payment_date, payment_amount,
             payment_number, debt
             FROM accounts 
             WHERE ${firmQuery} ${managerQuery} DATE(date) >= '${preparedDataStart}' AND DATE(date) <= '${preparedDataEnd}'`
        )
        return ctx.body = cars[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/accounts', authMiddleware, async ctx => {
    const {date, account_number, account_amount, firm, manager, payment_date, payment_amount, payment_number, debt} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");

        let [startPaymentDay, startPaymentMonth, startPaymentYear] = payment_date.split(".");

        const preparedPaymentDate = format(new Date(startPaymentYear, startPaymentMonth - 1, startPaymentDay), "yyyy-MM-dd");

        const account = await Accounts.create({
            date: preparedDate,
            account_number,
            account_amount,
            firm,
            manager,
            payment_date: preparedPaymentDate,
            payment_amount,
            payment_number,
            debt,
            creater_id: ctx.user.id,
            date_create: new Date()
        })

        const newAccount = await sequelize.query(
            `SELECT id, DATE_FORMAT(date, '%d.%m.%Y') as date, account_number, account_amount, firm, manager, DATE_FORMAT(payment_date, '%d.%m.%Y') as payment_date, payment_amount,
             payment_number, debt
             FROM accounts 
             WHERE id = ${account.id}`
        )

        return ctx.body = newAccount[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/accounts', authMiddleware, async ctx => {
    const {id, date, account_number, account_amount, firm, manager, payment_date, payment_amount, payment_number, debt} = ctx.request.body

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");

        let [startPaymentDay, startPaymentMonth, startPaymentYear] = payment_date.split(".");

        const preparedPaymentDate = format(new Date(startPaymentYear, startPaymentMonth - 1, startPaymentDay), "yyyy-MM-dd");

        await Accounts.update(
            {
                date: preparedDate,
                account_number,
                account_amount,
                firm,
                manager,
                payment_date: preparedPaymentDate,
                payment_amount,
                payment_number,
                debt,
            },
            {where: {id: id}}
        )

        const newAccount = await sequelize.query(
            `SELECT id, DATE_FORMAT(date, '%d.%m.%Y') as date, account_number, account_amount, firm, manager, DATE_FORMAT(payment_date, '%d.%m.%Y') as payment_date, payment_amount,
             payment_number, debt
             FROM accounts 
             WHERE id = ${id}`
        )

        return ctx.body = newAccount[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/accounts/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const car = await Accounts.destroy({
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