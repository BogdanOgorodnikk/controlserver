const Router = require('koa-router')
const router = new Router()
const Prepare_order = require('../models/Prepare_order')
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/prepareorders', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        if(ctx.user.role_id == 1 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.price_cash, prepare_orders.comment, prepare_orders.note,
                 prepare_orders.firm, prepare_orders.order_number,
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create, 
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless,
                 prepare_orders.count, is_deleted,
                 prepare_orders.creater, prepare_orders.client_id, users.login, 
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders 
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 JOIN clients ON prepare_orders.client_id = clients.id 
                 JOIN towns ON clients.town_id = towns.id 
                 WHERE prepare_orders.order_number = ""
                 ORDER BY prepare_orders.id`
            )
            return ctx.body = {
                order: order[0],
            }
        } else if(ctx.user.role_id == 2 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.price_cash, prepare_orders.note,
                 prepare_orders.firm, prepare_orders.order_number,
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create,
                 prepare_orders.count,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id, users.login,
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders 
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 JOIN clients ON prepare_orders.client_id = clients.id
                 JOIN towns ON clients.town_id = towns.id
                 WHERE prepare_orders.order_number = "" and (is_deleted = 0 or is_deleted IS NULL)
                 ORDER BY prepare_orders.id`
            )
            return ctx.body = {
                order: order[0],
            }
        } else if(ctx.user.role_id == 3 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.price_cash, prepare_orders.note,
                 prepare_orders.firm, prepare_orders.order_number,
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless, 
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create,
                 prepare_orders.count,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id, users.login,
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders 
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 JOIN clients ON prepare_orders.client_id = clients.id
                 JOIN towns ON clients.town_id = towns.id
                 WHERE prepare_orders.order_number = "" and (is_deleted = 0 or is_deleted IS NULL)
                 ORDER BY prepare_orders.id`
            )
            return ctx.body = {
                order: order[0],
            }
        } else if(ctx.user.role_id == 4 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.note,
                 prepare_orders.firm, prepare_orders.order_number,
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create,
                 prepare_orders.count,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id, users.login,
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders 
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 JOIN clients ON prepare_orders.client_id = clients.id
                 JOIN towns ON clients.town_id = towns.id
                 WHERE prepare_orders.order_number = "" and (is_deleted = 0 or is_deleted IS NULL)
                 ORDER BY prepare_orders.id`
            )
            return ctx.body = {
                order: order[0],
            }
        } else if(ctx.user.role_id == 5 && ctx.user.ban == 0) {
            const town = await sequelize.query(
                `SELECT * 
                FROM towns 
                where manager_id = ${ctx.user.id} or 
                safemanager_id = ${ctx.user.id} or
                securitymanager_id = ${ctx.user.id} or
                second_security_manager_id = ${ctx.user.id} or
                third_security_manager_id = ${ctx.user.id} or
                fourth_security_manager_id = ${ctx.user.id} or
                fiveth_security_manager_id = ${ctx.user.id}`
            )

            const newTownsList = town[0].map((item) => {
                return item.id
            })

            const client = await sequelize.query(
                `SELECT * FROM clients 
                where town_id in (${newTownsList.join()})
                ORDER BY id`
            )

            const newClientsList = client[0].map((item) => {
                return item.id
            })

            const order = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.price_cash, prepare_orders.note,
                 prepare_orders.firm, prepare_orders.order_number,
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create,
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless,
                 prepare_orders.count,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id,
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders
                 JOIN clients ON prepare_orders.client_id = clients.id
                 JOIN towns ON clients.town_id = towns.id
                 WHERE prepare_orders.client_id in (${newClientsList.join()}) && prepare_orders.order_number = "" and (is_deleted = 0 or is_deleted IS NULL)
                 ORDER BY prepare_orders.id`
            )

            return ctx.body = {
                order: order[0],
            }
        }
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/prepareorder', authMiddleware, async ctx => {
    const {note, product_name, count, client_id, price_cash} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 2 && ctx.user.role_id != 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const order = await Prepare_order.create({
            note: note,
            product_name: product_name,
            count: count,
            client_id: client_id,
            price_cash: price_cash,
            creater: ctx.user.id
        })

        let prepareOrders = await sequelize.query(
            `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.price_cash, prepare_orders.note,
                 prepare_orders.firm,
                 prepare_orders.product_name,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data,
                 prepare_orders.count, is_deleted,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id, users.login
                 FROM prepare_orders
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 WHERE prepare_orders.id = ${order.id}`
        );

        prepareOrders = {
            ...prepareOrders[0][0],
            isPreparedOrders: true,
        }

        return ctx.body = prepareOrders;
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/prepareorder/:id', authMiddleware, async ctx => {
    const {order_number, note, car_number, firm, region, data, product_name, opt_price, count, delivery_cash, delivery_cashless, client_id, price_cash, isSelfCar} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !== 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const prepareOrder = await Prepare_order.update(
            {
                order_number: order_number,
                note: note,
                car_number: car_number,
                firm: firm,
                region: region,
                data: preparedData,
                product_name: product_name,
                opt_price: opt_price,
                count: count,
                delivery_cash: delivery_cash,
                delivery_cashless: delivery_cashless,
                price_cash: price_cash,
            },
            {where: {id: ctx.params.id}}
        )

        const order = await Order.create({
            order_number: order_number,
            note: note,
            car_number: car_number,
            firm: firm,
            region: region,
            data: preparedData,
            product_name: product_name,
            opt_price: opt_price,
            count: count,
            delivery_cash: delivery_cash,
            delivery_cashless: delivery_cashless,
            client_id: client_id,
            isSelfCar,
            creater: ctx.user.id,
            original_data_create: new Date()
        })

        if(price_cash) {
            const orderInfo = await sequelize.query(
                `SELECT * FROM orders where id = ${order.dataValues.id}`
            )

            await Order.update(
                {
                    price_cash: price_cash,
                    general_sum: (price_cash * orderInfo[0][0].count) - orderInfo[0][0].delivery_cash,
                    debt: (price_cash * orderInfo[0][0].count) - orderInfo[0][0].delivery_cash,
                    delta_cash: ((price_cash-orderInfo[0][0].price_cashless)*orderInfo[0][0].count) - orderInfo[0][0].delivery_cash,
                    delta_cashless: ((orderInfo[0][0].price_cashless - orderInfo[0][0].opt_price) * orderInfo[0][0].count) - orderInfo[0][0].delivery_cashless,
                    sumseller: price_cash * orderInfo[0][0].count,
                    delta_mas_cash: orderInfo[0][0].delta_cash / orderInfo[0][0].count,
                    delta_mas_cashless: orderInfo[0][0].delta_cashless / orderInfo[0][0].count
                },
                {where: {id: order.dataValues.id}}
            )
            const newOrderInfo = await sequelize.query(
                `SELECT delta_cash, count FROM orders where id = ${order.dataValues.id}`
            )
            const updateMas = await Order.update(
                {
                    delta_mas_cash: (newOrderInfo[0][0].delta_cash / newOrderInfo[0][0].count),
                },
                {where: {id: order.dataValues.id}}
            )
        }

        return ctx.body = {
            prepareOrder
        }
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/editprepareorder/:id', authMiddleware, async ctx => {
    const {note, product_name, count, price_cash, car_number, firm, region, data, opt_price, delivery_cash, delivery_cashless} = ctx.request.body

    let [day, month, year] = data.split(".");

    const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !== 2 && ctx.user.role_id !== 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const prepareOrder = await Prepare_order.update(
            {
                note: note,
                product_name: product_name,
                count: count,
                price_cash: price_cash,
                car_number: car_number,
                firm: firm,
                region: region,
                data: preparedData,
                opt_price: opt_price,
                delivery_cash: delivery_cash,
                delivery_cashless: delivery_cashless,
            },
            {where: {id: ctx.params.id}}
        )

        const updatedPrepareOrder = await sequelize.query(
            `SELECT prepare_orders.id, prepare_orders.price_cash, prepare_orders.comment, prepare_orders.note,
                 prepare_orders.firm, 
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create, 
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless,
                 prepare_orders.count, is_deleted,
                 prepare_orders.creater, prepare_orders.client_id, users.login, 
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders 
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 JOIN clients ON prepare_orders.client_id = clients.id 
                 JOIN towns ON clients.town_id = towns.id 
                 WHERE prepare_orders.id = ${ctx.params.id}`
        )

        return ctx.body = updatedPrepareOrder[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/prepareorder-remove/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }


        await Prepare_order.update(
            {
                is_deleted: true
            },
            {where: {id: ctx.params.id}}
        )

        return ctx.body = 1
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/prepareorder-return/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }


        await Prepare_order.update(
            {
                is_deleted: false
            },
            {where: {id: ctx.params.id}}
        )

        const newDelivery = await sequelize.query(
            `SELECT prepare_orders.id, prepare_orders.price_cash, prepare_orders.comment, prepare_orders.note,
                 prepare_orders.firm, 
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create, 
                 prepare_orders.car_number, DATE_FORMAT(prepare_orders.data, '%d.%m.%Y') as data, prepare_orders.opt_price,
                 prepare_orders.product_name, prepare_orders.delivery_cash, prepare_orders.delivery_cashless,
                 prepare_orders.count, is_deleted,
                 prepare_orders.creater, prepare_orders.client_id, users.login, 
                 clients.name as clientName, clients.id as clientId,
                 towns.region as region, towns.name as townName
                 FROM prepare_orders 
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 JOIN clients ON prepare_orders.client_id = clients.id 
                 JOIN towns ON clients.town_id = towns.id 
                 WHERE prepare_orders.id = ${ctx.params.id}`
        )

        return ctx.body = newDelivery[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/prepareorder/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const order = await Prepare_order.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = order
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router