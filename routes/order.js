const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.get('/api/orders/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id == 1 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash,
                orders.creater, orders.region, orders.debt, orders.client_id, users.login
                FROM orders 
                LEFT JOIN users ON orders.creater = users.id
                where client_id = ${client_id}
                ORDER BY orders.id`
            )

            let prepareOrders = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.price_cash, prepare_orders.note,
                 prepare_orders.firm,
                 prepare_orders.product_name,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data_create,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data,
                 prepare_orders.count,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id, users.login
                 FROM prepare_orders
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 WHERE prepare_orders.order_number = "" && prepare_orders.client_id = ${client_id}
                 ORDER BY prepare_orders.id`
            );

            prepareOrders = prepareOrders[0].map((item) => ({
                isPreparedOrders: true,
                ...item,
            }))

            const allOrders = [...order[0], ...prepareOrders]

            return ctx.body = {
                order: allOrders
            }
        } else if(ctx.user.role_id == 2 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT id, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, 
                    product_name, opt_price, count, delivery_cash, delivery_cashless, region 
                FROM orders 
                where client_id = ${client_id} and firm != ""
                ORDER BY id`
            )

            let prepareOrders = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.note,
                 prepare_orders.firm,
                 prepare_orders.product_name,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data,
                 prepare_orders.count,
                 prepare_orders.region
                 FROM prepare_orders
                 WHERE prepare_orders.order_number = "" && prepare_orders.client_id = ${client_id}
                 ORDER BY prepare_orders.id`
            );

            prepareOrders = prepareOrders[0].map((item) => ({
                isPreparedOrders: true,
                ...item,
            }))

            const allOrders = [...order[0], ...prepareOrders]

            return ctx.body = {
                order: allOrders
            }
        } else if(ctx.user.role_id == 3 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT id, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, product_name, opt_price, price_cash, price_cashless, count, sumseller, delivery_cash, delivery_cashless, pay_cash, pay_cashless, region
                FROM orders 
                where client_id = ${client_id}
                ORDER BY id`
            )
            return ctx.body = {
                order: order[0]
            }
        } else if(ctx.user.role_id == 4 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT id, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, product_name, opt_price, price_cash, delta_mas_cashless, price_cashless, count, delivery_cash, delivery_cashless, pay_cashless, region 
                FROM orders 
                where client_id = ${client_id}
                ORDER BY id`
            )
            return ctx.body = {
                order: order[0]
            }
        } else if(ctx.user.role_id == 5 && ctx.user.ban == 0) {
            const client = await sequelize.query(
                `SELECT * FROM clients where id = ${client_id}
                ORDER BY id`
            )
            const town = await sequelize.query(
                `SELECT * 
                FROM towns 
                where id = ${client[0][0].town_id}
                ORDER BY id`
            )
            if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
                return ctx.status = 400
            }
            const order = await sequelize.query(
                `SELECT id, firm, note, comment, DATE_FORMAT(data, '%d.%m.%Y') as data, product_name, price_cash, price_cashless, 
                    count, sumseller, delivery_cash, delivery_cashless, general_sum, 
                    pay_cash, pay_cashless, region 
                FROM orders 
                where client_id = ${client_id}
                ORDER BY id`
            )


            let prepareOrders = await sequelize.query(
                `SELECT prepare_orders.id, prepare_orders.comment, prepare_orders.note,
                 prepare_orders.firm,
                 prepare_orders.product_name,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data,
                 prepare_orders.count,
                 prepare_orders.region
                 FROM prepare_orders
                 WHERE prepare_orders.order_number = "" && prepare_orders.client_id = ${client_id}
                 ORDER BY prepare_orders.id`
            );

            prepareOrders = prepareOrders[0].map((item) => ({
                isPreparedOrders: true,
                ...item,
            }))

            const allOrders = [...order[0], ...prepareOrders]

            return ctx.body = {
                order: allOrders,
                client: client[0],
                town: town[0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/suminfo/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !=3 && ctx.user.role_id != 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const sumMas = await sequelize.query(
            `SELECT sum(count) as sumMas, sum(debt) as sumDebt FROM orders where client_id = ${client_id}`
        )
        const sumPith = await sequelize.query(
            `SELECT sum(price_cash*(number * 1.6)) as sumPith FROM piths where client_id = ${client_id} and math = 1`
        )
        return ctx.body = {
            sumMas: sumMas[0],
            sumPith: sumPith[0]
        }
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/ordersinfo/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const client = await sequelize.query(
            `SELECT * FROM clients where id = ${client_id} ORDER BY id`
        )
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${client[0][0].town_id} ORDER BY id`
        )
        const note = await sequelize.query(
            `SELECT * FROM notes ORDER BY id`
        )
        const product_name = await sequelize.query(
            `SELECT * FROM product_names ORDER BY id`
        )
        const firm_name = await sequelize.query(
            `SELECT * FROM firm_names ORDER BY id`
        )
        const opt_price = await sequelize.query(
            `SELECT * FROM opt_prices ORDER BY id`
        )
        const mas_number = await sequelize.query(
            `SELECT * FROM mas_numbers ORDER BY id`
        )
        const region = await sequelize.query(
            `SELECT * FROM regions ORDER BY id`
        )
        return ctx.body = {
            client: client[0],
            town: town[0],
            note: note[0],
            product_name: product_name[0],
            firm_name: firm_name[0],
            opt_price: opt_price[0],
            mas_number: mas_number[0],
            region: region[0]
        }
    }
    catch (e) {
        ctx.body = e
    }
})

router.post('/api/orders/:client_id', authMiddleware, async ctx => {
    const {order_number, note, car_number, firm, region, data, product_name, opt_price, count, delivery_cash, delivery_cashless} = ctx.request.body
    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !=2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

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
            client_id: ctx.params.client_id,
            creater: ctx.user.id
        })

        if(ctx.user.role_id === 1) {
            const createdOrder = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash,
                orders.creater, orders.region, orders.debt, orders.client_id, users.login
                FROM orders
                LEFT JOIN users ON orders.creater = users.id
                where orders.id = ${order.id}`
            )



            return ctx.body = createdOrder[0][0]
        } else if(ctx.user.role_id === 2) {
            const createdOrder = await sequelize.query(
                `SELECT id, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, 
                    product_name, opt_price, count, delivery_cash, delivery_cashless, region 
                FROM orders 
                where id = ${order.id}`
            )

            return ctx.body = createdOrder[0][0]
        }
    }
    catch(e) {
        return ctx.body = e
    }
})

router.post('/api/paymoney/:client_id', authMiddleware, async ctx => {
    const {data, product_name, pay_cash, pay_cashless} = ctx.request.body;

    let order = "";

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !=3 && ctx.user.role_id !=4 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        if(ctx.user.role_id == 1) {
            order = await Order.create({
                data: preparedData,
                product_name: product_name,
                pay_cash: pay_cash,
                pay_cashless: pay_cashless,
                debt: 0 - pay_cash - pay_cashless,
                client_id: ctx.params.client_id,
                creater: ctx.user.id
            })
        } else if (ctx.user.role_id == 3) {
            order = await Order.create({
                data: preparedData,
                product_name: product_name,
                pay_cash: pay_cash,
                debt: 0 - pay_cash,
                client_id: ctx.params.client_id,
                creater: ctx.user.id
            })
        } else if (ctx.user.role_id == 4) {
            order = await Order.create({
                data: preparedData,
                product_name: product_name,
                pay_cashless: pay_cashless,
                debt: 0 - pay_cashless,
                client_id: ctx.params.client_id,
                creater: ctx.user.id
            })
        } else if (ctx.user.role_id == 5) {
            const client = await sequelize.query(
                `SELECT * FROM clients where id = ${ctx.params.client_id}`
            )
            const town = await sequelize.query(
                `SELECT * FROM towns where id = ${client[0][0].town_id}`
            )
            if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
                return ctx.status = 400
            }
            order = await Order.create({
                data: preparedData,
                product_name: "Оплата",
                pay_cash: pay_cash,
                debt: 0 - pay_cash,
                client_id: ctx.params.client_id,
                creater: ctx.user.id
            })
        }

        const createdOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash,
                orders.creater, orders.region, orders.debt, orders.client_id, users.login
                FROM orders
                LEFT JOIN users ON orders.creater = users.id
                where orders.id = ${order.id}`
        )

        return ctx.body = createdOrder[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.post('/api/checkmoney/:client_id', authMiddleware, async ctx => {
    const {data, pay_cash} = ctx.request.body

    let [day, month, year] = data.split(".");

    const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !=3 && ctx.user.role_id !=4 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const client = await sequelize.query(
            `SELECT * FROM clients where id = ${ctx.params.client_id}`
        )
        const town = await sequelize.query(
            `SELECT * FROM towns where id = ${client[0][0].town_id}`
        )
        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }

        const order = await Order.create({
            data: preparedData,
            product_name: "Перевірка",
            pay_cash: pay_cash,
            client_id: ctx.params.client_id,
            creater: ctx.user.id
        })

        const createdOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash,
                orders.creater, orders.region, orders.debt, orders.client_id, users.login
                FROM orders
                LEFT JOIN users ON orders.creater = users.id
                where orders.id = ${order.id}`
        )

        return ctx.body = createdOrder[0][0];
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/pricecash/:id', authMiddleware, async ctx => {
    const {price_cash} = ctx.request.body
    try {
        if(ctx.user.role_id !=3 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const orderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )
        if(orderInfo[0][0].price_cash > 0) {
            return ctx.status = 400
        }
        const order = await Order.update(
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
            {where: {id: ctx.params.id}}
        )
        const newOrderInfo = await sequelize.query(
            `SELECT delta_cash, count FROM orders where id = ${ctx.params.id}`
        )
        const updateMas = await Order.update(
            {
                delta_mas_cash: (newOrderInfo[0][0].delta_cash / newOrderInfo[0][0].count),
            },
            {where: {id: ctx.params.id}}
        )

        const newOrder = await sequelize.query(
            `SELECT id, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, product_name, opt_price, price_cash, price_cashless, count, sumseller, delivery_cash, delivery_cashless, pay_cash, pay_cashless, region
                FROM orders 
                where id = ${ctx.params.id}`
        )
        
        return ctx.body = newOrder[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/pricecashless/:id', authMiddleware, async ctx => {
    const {price_cashless} = ctx.request.body
    try {
        if(ctx.user.role_id !=4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const orderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )
        if(orderInfo[0][0].price_cashless > 0) {
            return ctx.status = 400
        }
        const order = await Order.update(
            {
                price_cashless: price_cashless,
                delta_cash: ((orderInfo[0][0].price_cash-price_cashless)*orderInfo[0][0].count) - orderInfo[0][0].delivery_cash,
                delta_cashless: ((price_cashless - orderInfo[0][0].opt_price) * orderInfo[0][0].count) - orderInfo[0][0].delivery_cashless,
            },
            {where: {id: ctx.params.id}}
        )
        const newOrderInfo = await sequelize.query(
            `SELECT delta_cash, delta_cashless, count FROM orders where id = ${ctx.params.id}`
        )
        const updateMas = await Order.update(
            {
                delta_mas_cash: (newOrderInfo[0][0].delta_cash / newOrderInfo[0][0].count),
                delta_mas_cashless: (newOrderInfo[0][0].delta_cashless / newOrderInfo[0][0].count)
            },
            {where: {id: ctx.params.id}}
        )

        const newOrder = await sequelize.query(
            `SELECT id, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, product_name, opt_price, price_cash, delta_mas_cashless, price_cashless, count, delivery_cash, delivery_cashless, pay_cashless, region 
                FROM orders 
                where id = ${ctx.params.id} `
        )

        return ctx.body = newOrder[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/editorder/:id', authMiddleware, async ctx => {
    const {order_number, note, car_number, firm, region, data, product_name, count, delivery_cash, delivery_cashless, price_cash, opt_price, price_cashless, client_id} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const orderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const order = await Order.update(
            {
                order_number: order_number,
                note: note,
                car_number: car_number, 
                firm: firm, 
                region: region, 
                data: preparedData,
                product_name: product_name, 
                count: count, 
                delivery_cash: delivery_cash, 
                delivery_cashless: delivery_cashless, 
                price_cash: price_cash, 
                opt_price: opt_price, 
                price_cashless: price_cashless, 
                client_id: client_id,
                general_sum: (price_cash * count) - delivery_cash,
                debt: (price_cash * count) - delivery_cash,
                sumseller: price_cash * count,
                delta_cash: ((price_cash - price_cashless) * count) - delivery_cash,
                delta_cashless: ((price_cashless - opt_price) * count) - delivery_cashless,
                delta_mas_cash: 0 / count,
                delta_mas_cashless: 0 / count
            },
            {where: {id: ctx.params.id}}
        )
        const newOrderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )
        const updateMas = await Order.update(
            {
                delta_mas_cash: (newOrderInfo[0][0].delta_cash / count),
                delta_mas_cashless: (newOrderInfo[0][0].delta_cashless / count)
            },
            {where: {id: ctx.params.id}}
        )

        const newOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm,
                DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, 
                orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, orders.pay_cash, 
                orders.pay_cashless, orders.delta_cashless, orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, 
                orders.creater, orders.region, orders.debt, orders.client_id, clients.name, users.login, towns.name as town_name, 
                towns.area FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                JOIN towns ON clients.town_id = towns.id
                where orders.id = ${ctx.params.id}`
        )

        return ctx.body = newOrder[0][0];
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/editpaymoney/:id', authMiddleware, async ctx => {
    const {data, product_name, pay_cash, pay_cashless} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        const order = await Order.update(
            {
                data: preparedData,
                product_name: product_name,
                pay_cash: pay_cash,
                pay_cashless: pay_cashless,
                debt: 0 - pay_cash - pay_cashless
            },
            {where: {id: ctx.params.id}}
        )

        const newOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash,
                orders.creater, orders.region, orders.debt, orders.client_id, users.login
                FROM orders 
                LEFT JOIN users ON orders.creater = users.id
                where orders.id = ${ctx.params.id}`
        )

        return ctx.body = newOrder[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/orders/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const order = await Order.destroy({
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