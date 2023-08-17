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
    const curator_id = ctx.query.manager;
    const client = ctx.query.client;

    let [startDay, startMonth, startYear] = start.split(".");
    let [day, month, year] = end.split(".");

    const preparedDataStart = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");
    const preparedDataEnd = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    const firmQuery = firm ? `firm LIKE '%${firm}%' and` : ''
    const curatorQuery = curator_id ? `curator_id = ${curator_id} and` : ''
    const clientQuery = client ? `client LIKE '%${client}%' and` : ''

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const cars = await sequelize.query(
            `SELECT sub.*, 
               CASE
                   WHEN (sub.account_amount - sub.paymentAmount) > 0 THEN 1
                   WHEN (sub.account_amount - sub.paymentAmount) < 0 THEN 1
                   ELSE (sub.account_amount - sub.paymentAmount)
               END AS order_condition
            FROM (
                SELECT accounts.id, 
                       DATE_FORMAT(accounts.date, '%d.%m.%Y') as date, 
                       client, 
                       account_number, 
                       account_amount, 
                       firm, 
                       curators.name as curator, 
                       curator_id, 
                       SUM(accountPayments.amount) as paymentAmount
                FROM accounts 
                JOIN curators ON curators.id = accounts.curator_id
                LEFT JOIN accountPayments ON accountPayments.payment_id = accounts.id
                WHERE ${firmQuery} ${curatorQuery} ${clientQuery} DATE(accounts.date) >= '${preparedDataStart}' AND DATE(accounts.date) <= '${preparedDataEnd}'
                GROUP BY accounts.id
            ) AS sub
            ORDER BY 
                CASE
                    WHEN order_condition = 1 OR order_condition IS NULL THEN 0
                    ELSE 1
                END,
                order_condition`)
        return ctx.body = cars[0]
    } catch (e) {
        return ctx.body = e
    }
})


router.post('/api/accounts', authMiddleware, async ctx => {
    const {date, account_number, account_amount, firm, curator_id, client} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");


        const account = await Accounts.create({
            date: preparedDate,
            account_number,
            account_amount,
            firm,
            client,
            curator_id,
            creater_id: ctx.user.id,
            date_create: new Date()
        })

        const newAccount = await sequelize.query(
            `SELECT accounts.id, DATE_FORMAT(accounts.date, '%d.%m.%Y') as date, client, account_number, 
             account_amount, firm, curators.name as curator, curator_id, sum(amount) as paymentAmount
             FROM accounts 
             JOIN curators ON curators.id = accounts.curator_id
             JOIN accountPayments ON accountPayments.payment_id = accounts.id
             WHERE accounts.id = ${account.id}`
        )

        return ctx.body = newAccount[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/accounts', authMiddleware, async ctx => {
    const {id, date, account_number, account_amount, firm, curator_id, client } = ctx.request.body

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [startDay, startMonth, startYear] = date.split(".");

        const preparedDate = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");

        await Accounts.update(
            {
                date: preparedDate,
                account_number,
                account_amount,
                firm,
                curator_id,
                client
            },
            {where: {id: id}}
        )

        const newAccount = await sequelize.query(
            `SELECT accounts.id, DATE_FORMAT(accounts.date, '%d.%m.%Y') as date, client, account_number, 
             account_amount, firm, curators.name as curator, curator_id, sum(amount) as paymentAmount
             FROM accounts 
             JOIN curators ON curators.id = accounts.curator_id
             JOIN accountPayments ON accountPayments.payment_id = accounts.id
             WHERE accounts.id = ${id}`
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