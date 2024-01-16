const Router = require('koa-router')
const router = new Router()
const Order = require('../models/Order')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");
const Comment = require("../models/Comment");

router.get('/api/orders/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        if(ctx.user.role_id == 1 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT orders.id, orders.seller, orders.account_number, orders.isSelfCar, orders.order_number, orders.note, orders.comment, orders.car_number,
                    if(orders.pay_cashless = 0, orders.firm, "") as firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
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
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y %H:%i') as data_create,
                 DATE_FORMAT(prepare_orders.data_create, '%d.%m.%Y') as data,
                 prepare_orders.count,
                 prepare_orders.creater, prepare_orders.region, prepare_orders.client_id, users.login
                 FROM prepare_orders
                 LEFT JOIN users ON prepare_orders.creater = users.id
                 WHERE prepare_orders.order_number = "" and prepare_orders.client_id = ${client_id}
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
                `SELECT id, isSelfCar, seller, orders.account_number, order_number, orders.note, orders.comment, car_number, firm, DATE_FORMAT(data, '%d.%m.%Y') as data, 
                    product_name, opt_price, count, delivery_cash, delivery_cashless, region, original_data_create 
                FROM orders 
                where client_id = ${client_id} and firm != "" and orders.pay_cashless = 0
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
                 WHERE prepare_orders.order_number = "" and prepare_orders.client_id = ${client_id}
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
                `SELECT id, isSelfCar, orders.seller, orders.account_number, order_number, orders.note, orders.comment, car_number, if(orders.pay_cashless = 0, orders.firm, "") as firm, DATE_FORMAT(data, '%d.%m.%Y') as data, product_name, opt_price, price_cash, price_cashless, count, sumseller, delivery_cash, delivery_cashless, pay_cash, pay_cashless, region
                FROM orders 
                where client_id = ${client_id}
                ORDER BY id`
            )
            return ctx.body = {
                order: order[0]
            }
        } else if(ctx.user.role_id == 4 && ctx.user.ban == 0) {
            const order = await sequelize.query(
                `SELECT id, account_number, orders.seller, isSelfCar, order_number, orders.note, orders.comment, car_number, original_data_update,
                if(orders.pay_cashless = 0, orders.firm, "") as firm, DATE_FORMAT(data, '%d.%m.%Y') as data,
                product_name, opt_price, price_cash, delta_mas_cashless, price_cashless, count,
                delivery_cash, delivery_cashless, pay_cashless, region, general_sum, pay_cash
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
            if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id && town[0][0].fourth_security_manager_id != ctx.user.id && town[0][0].fiveth_security_manager_id != ctx.user.id) {
                return ctx.status = 400
            }
            const order = await sequelize.query(
                `SELECT orders.id, orders.account_number, orders.isSelfCar, orders.order_number, if(orders.pay_cashless = 0, orders.firm, "") as firm, orders.note, orders.comment,
                    DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.product_name, orders.price_cash, orders.price_cashless, 
                    orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, 
                    orders.pay_cash, orders.pay_cashless, orders.region, users.login
                FROM orders 
                LEFT JOIN users ON orders.creater = users.id
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
                 WHERE prepare_orders.order_number = "" and prepare_orders.client_id = ${client_id}
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
        if(ctx.user.role_id !=1 && ctx.user.role_id !=3 && ctx.user.role_id != 5 && ctx.user.role_id != 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const sumMas = await sequelize.query(
            `SELECT SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) as sumMas, sum(debt) as sumDebt FROM orders where client_id = ${client_id}`
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
            creater: ctx.user.id,
            original_data_create: new Date()
        })

        if(ctx.user.role_id === 1) {
            const createdOrder = await sequelize.query(
                `SELECT orders.id, orders.account_number, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
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
    const {data, product_name, pay_cash, pay_cashless, firm, replaceClient, description} = ctx.request.body;

    let order = "";

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id !=3 && ctx.user.role_id !=4 && ctx.user.role_id !=5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        if(ctx.user.role_id == 1) {
            let replaceToClient = "";

            if(replaceClient) {
                const replaceClientName = await sequelize.query(
                    `SELECT name
                    FROM clients
                    where clients.id = ${ctx.params.client_id}`);

                replaceToClient = await sequelize.query(
                    `SELECT name
                    FROM clients
                    where clients.id = ${replaceClient}`);

                const replacedOrder = await Order.create({
                    data: preparedData,
                    product_name: `${product_name} від ${replaceClientName[0][0].name}`,
                    pay_cash: pay_cash * -1,
                    pay_cashless: pay_cashless * -1,
                    debt: 0 + pay_cash + pay_cashless,
                    firm: firm,
                    client_id: replaceClient,
                    creater: ctx.user.id,
                    comment: !!description,
                    original_data_create: new Date()
                })

                if(description) {
                    await Comment.create({
                        description: description,
                        order_id: replacedOrder.id,
                        creater_id: ctx.user.id
                    })
                }


            }

                order = await Order.create({
                    data: preparedData,
                    product_name: replaceClient ? `${product_name} на ${replaceToClient[0][0].name}` : product_name,
                    pay_cash: pay_cash,
                    pay_cashless: pay_cashless,
                    debt: 0 - pay_cash - pay_cashless,
                    firm: firm,
                    client_id: ctx.params.client_id,
                    creater: ctx.user.id,
                    original_data_create: new Date()
                })

        } else if (ctx.user.role_id == 3) {
            order = await Order.create({
                data: preparedData,
                product_name: product_name,
                pay_cash: pay_cash,
                debt: 0 - pay_cash,
                client_id: ctx.params.client_id,
                creater: ctx.user.id,
                original_data_create: new Date()
            })
        } else if (ctx.user.role_id == 4) {
            let replaceToClient = "";

            if(replaceClient) {
                const replaceClientName = await sequelize.query(
                    `SELECT name
                    FROM clients
                    where clients.id = ${ctx.params.client_id}`);

                replaceToClient = await sequelize.query(
                    `SELECT name
                    FROM clients
                    where clients.id = ${replaceClient}`);

                const replacedOrder = await Order.create({
                    data: preparedData,
                    product_name: `${product_name} від ${replaceClientName[0][0].name}`,
                    pay_cashless: pay_cashless,
                    debt: pay_cashless * -1,
                    firm: firm,
                    client_id: replaceClient,
                    creater: ctx.user.id,
                    comment: !!description,
                    original_data_create: new Date(),
                    original_data_update: new Date(),
                })

                if(description) {
                    await Comment.create({
                        description: description,
                        order_id: replacedOrder.id,
                        creater_id: ctx.user.id
                    })
                }
            }

            order = await Order.create({
                data: preparedData,
                product_name: replaceClient ? `${product_name} на ${replaceToClient[0][0].name}` : product_name,
                pay_cashless: replaceClient ? pay_cashless * -1 : pay_cashless,
                debt: replaceClient ? pay_cashless : 0 - pay_cashless,
                firm: firm,
                client_id: ctx.params.client_id,
                creater: ctx.user.id,
                original_data_create: new Date(),
                original_data_update: new Date(),
            })
         } else if (ctx.user.role_id == 5) {
            const client = await sequelize.query(
                `SELECT * FROM clients where id = ${ctx.params.client_id}`
            )
            const town = await sequelize.query(
                `SELECT * FROM towns where id = ${client[0][0].town_id}`
            )
            if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id && town[0][0].fourth_security_manager_id != ctx.user.id && town[0][0].fiveth_security_manager_id != ctx.user.id) {
                return ctx.status = 400
            }

            let replaceToClient = "";

            if(replaceClient) {
                const replaceClientName = await sequelize.query(
                    `SELECT name
                    FROM clients
                    where clients.id = ${ctx.params.client_id}`);

                replaceToClient = await sequelize.query(
                    `SELECT name
                    FROM clients
                    where clients.id = ${replaceClient}`);

                const replacedOrder = await Order.create({
                    data: preparedData,
                    product_name: `${product_name} від ${replaceClientName[0][0].name}`,
                    pay_cash: pay_cash * -1,
                    pay_cashless: pay_cashless * -1,
                    debt: pay_cash,
                    client_id: replaceClient,
                    creater: ctx.user.id,
                    comment: !!description,
                    original_data_create: new Date()
                })

                if(description) {
                    await Comment.create({
                        description: description,
                        order_id: replacedOrder.id,
                        creater_id: ctx.user.id
                    })
                }
            }



            order = await Order.create({
                data: preparedData,
                product_name: replaceClient ? `${product_name} на ${replaceToClient[0][0].name}` : product_name,
                pay_cash: pay_cash,
                pay_cashless: pay_cashless,
                debt: 0 - pay_cash,
                client_id: ctx.params.client_id,
                creater: ctx.user.id,
                original_data_create: new Date()
            })
        }

        const createdOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                if(orders.pay_cashless = 0, orders.firm, "") as firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, orders.original_data_update,
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
        if(ctx.user.role_id == 5 && town[0][0].manager_id != ctx.user.id && town[0][0].safemanager_id != ctx.user.id && town[0][0].securitymanager_id != ctx.user.id && town[0][0].second_security_manager_id != ctx.user.id && town[0][0].third_security_manager_id != ctx.user.id && town[0][0].fourth_security_manager_id != ctx.user.id && town[0][0].fiveth_security_manager_id != ctx.user.id) {
            return ctx.status = 400
        }

        const order = await Order.create({
            data: preparedData,
            product_name: "Перевірка",
            pay_cash: pay_cash,
            client_id: ctx.params.client_id,
            creater: ctx.user.id,
            original_data_create: new Date()
        })

        const createdOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                orders.firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
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
    const {price_cashless, price_cash} = ctx.request.body
    try {
        if(ctx.user.role_id !=4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const orderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )

        const newPriceCash = price_cash ? price_cash : orderInfo[0][0].price_cash

        const order = await Order.update(
            {
                original_data_update: orderInfo[0][0].original_data_update ? orderInfo[0][0].original_data_update : new Date(),
                price_cashless: price_cashless,
                price_cash: newPriceCash,
                delta_cash: ((newPriceCash-price_cashless)*orderInfo[0][0].count) - orderInfo[0][0].delivery_cash,
                delta_cashless: ((price_cashless - orderInfo[0][0].opt_price) * orderInfo[0][0].count) - orderInfo[0][0].delivery_cashless,
            },
            {where: {id: ctx.params.id}}
        )
        let newOrderInfo = await sequelize.query(
            `SELECT delta_cash, delta_cashless, count FROM orders where id = ${ctx.params.id}`
        )

        const newDeltaMasCash = (newOrderInfo[0][0].delta_cash / newOrderInfo[0][0].count)

        if(0 > newDeltaMasCash && newDeltaMasCash >= -6) {
            const newPrice_cash = Number(newPriceCash) + Math.floor(Math.abs(newDeltaMasCash))

            await Order.update(
                {
                    price_cash: newPrice_cash,
                    delta_cash: ((newPrice_cash-price_cashless)*orderInfo[0][0].count) - orderInfo[0][0].delivery_cash,
                },
                {where: {id: ctx.params.id}}
            )

            newOrderInfo = await sequelize.query(
                `SELECT delta_cash, delta_cashless, count FROM orders where id = ${ctx.params.id}`
            )
        }

        const updateMas = await Order.update(
            {
                delta_mas_cash: (newOrderInfo[0][0].delta_cash / newOrderInfo[0][0].count),
                delta_mas_cashless: (newOrderInfo[0][0].delta_cashless / newOrderInfo[0][0].count)
            },
            {where: {id: ctx.params.id}}
        )

        const newOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.original_data_update, orders.note, orders.comment, orders.car_number, orders.firm,
              DATE_FORMAT(orders.data, '%d.%m.%Y') as data, orders.product_name, orders.opt_price, orders.price_cash,
              orders.delta_mas_cashless, orders.price_cashless, orders.count, orders.delivery_cash, orders.delivery_cashless,
              orders.pay_cashless, orders.seller, orders.region, clients.name, orders.delta_cash, orders.delta_cashless, orders.delta_mas_cash
             FROM orders 
             LEFT JOIN clients ON orders.client_id = clients.id
             where orders.id = ${ctx.params.id}`
        )

        return ctx.body = newOrder[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/editorder/:id', authMiddleware, async ctx => {
    const {order_number, seller, isSelfCar, note, car_number, firm, region, data, product_name, count, delivery_cash, delivery_cashless, price_cash, opt_price, price_cashless, client_id, isTransferOrder} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id != 2 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const orderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )

        let [day, month, year] = data.split(".");

        const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

        if(ctx.user.role_id === 1 && isTransferOrder) {
            const orderToClient = await sequelize.query(
                `SELECT name FROM clients where id = ${client_id}`
            )

            const orderFromClient = await sequelize.query(
                `SELECT clients.name 
                 FROM orders
                 LEFT JOIN clients ON orders.client_id = clients.id 
                 where orders.id = ${ctx.params.id}
                 `
            )

            const order = await Order.create({
                creater: ctx.user.id,
                original_data_create: new Date(),
                isSelfCar: Number(isSelfCar),
                order_number: order_number,
                note: note,
                car_number: car_number,
                firm: firm,
                region: region,
                data: preparedData,
                product_name: `ПЕРЕМІЩЕНО з ${orderFromClient[0][0].name} product_name`,
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
                delta_mas_cashless: 0 / count,
                seller: seller,
            })

            const newOrderInfo = await sequelize.query(
                `SELECT * FROM orders where id = ${order.id}`
            )
            const updateMas = await Order.update(
                {
                    delta_mas_cash: (newOrderInfo[0][0].delta_cash / count),
                    delta_mas_cashless: (newOrderInfo[0][0].delta_cashless / count)
                },
                {where: {id: order.id}}
            )

            const orders = await Order.update(
                {
                    product_name: `ПЕРЕМІЩЕНО до ${orderToClient[0][0].name} ${product_name}`,
                    count: count > 0 ? count * -1 : count,
                    delivery_cash: 0,
                    delivery_cashless: 0,
                    price_cash: 0,
                    opt_price: 0,
                    price_cashless: 0,
                    general_sum: 0,
                    debt: 0,
                    sumseller: 0,
                    delta_cash: 0,
                    delta_cashless: 0,
                    delta_mas_cash: 0,
                    delta_mas_cashless: 0
                },
                {where: {id: ctx.params.id}}
            )

            const newOrder = await sequelize.query(
                `SELECT orders.id, orders.isSelfCar, orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm,
                DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, 
                orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, orders.pay_cash, 
                orders.pay_cashless, orders.delta_cashless, orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, 
                orders.creater, orders.region, orders.seller, orders.debt, orders.client_id, clients.name, users.login, towns.name as town_name, 
                towns.area FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                JOIN towns ON clients.town_id = towns.id
                where orders.id = ${ctx.params.id}`
            )

            return ctx.body = newOrder[0][0];
        }

        if(ctx.user.role_id === 1) {
            const order = await Order.update(
                {
                    isSelfCar: Number(isSelfCar),
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
                    delta_mas_cashless: 0 / count,
                    seller: seller,
                },
                {where: {id: ctx.params.id}}
            )
        }

        if(ctx.user.role_id === 2) {
            const price_cashless = orderInfo[0][0].price_cashless

            const order = await Order.update(
                {
                    isSelfCar: Number(isSelfCar),
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
                    opt_price: opt_price,
                    price_cash: price_cash,
                    general_sum: (price_cash * count) - delivery_cash,
                    debt: (price_cash * count) - delivery_cash,
                    sumseller: price_cash * count,
                    delta_cash: ((price_cash - price_cashless) * count) - delivery_cash,
                    delta_cashless: ((price_cashless - opt_price) * count) - delivery_cashless,
                    delta_mas_cash: 0 / count,
                    delta_mas_cashless: 0 / count,
                    seller: seller,
                },
                {where: {id: ctx.params.id}}
            )
        }

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

        if(ctx.user.role_id === 1) {
            const newOrder = await sequelize.query(
                `SELECT orders.id, orders.isSelfCar, orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm,
                DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless, orders.count, 
                orders.sumseller, orders.delivery_cash, orders.delivery_cashless, orders.general_sum, orders.pay_cash, 
                orders.pay_cashless, orders.delta_cashless, orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, 
                orders.creater, orders.region, orders.seller, orders.debt, orders.client_id, clients.name, users.login, towns.name as town_name, 
                towns.area FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                JOIN towns ON clients.town_id = towns.id
                where orders.id = ${ctx.params.id}`
            )

            return ctx.body = newOrder[0][0];
        }

        if(ctx.user.role_id === 2) {
            const newOrder = await sequelize.query(
                `SELECT orders.id, orders.order_number, orders.isSelfCar, orders.price_cash, orders.note, orders.comment, orders.car_number, orders.firm,
                DATE_FORMAT(orders.data, '%d.%m.%Y') as data,
                orders.product_name, orders.opt_price, orders.count, 
                orders.delivery_cash, orders.delivery_cashless,
               orders.region, orders.client_id, orders.seller, clients.name, users.login, towns.name as town_name, orders.original_data_create,
                towns.area FROM orders 
                LEFT JOIN clients ON orders.client_id = clients.id 
                JOIN users ON orders.creater = users.id
                JOIN towns ON clients.town_id = towns.id
                where orders.id = ${ctx.params.id}`
            )

            return ctx.body = newOrder[0][0];
        }
    }
    catch(e) {
        return ctx.body = e
    }
})

router.put('/api/editpaymoney/:id', authMiddleware, async ctx => {
    const {data, product_name, pay_cash, pay_cashless, clientId, firm} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 && ctx.user.role_id !== 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const orderInfo = await sequelize.query(
            `SELECT * FROM orders where id = ${ctx.params.id}`
        )

        if(ctx.user.role_id === 1) {
            let [day, month, year] = data.split(".");

            const preparedData = format(new Date(year, month - 1, day), "yyyy-MM-dd");

            const order = await Order.update(
                {
                    data: preparedData,
                    product_name: product_name,
                    pay_cash: pay_cash,
                    pay_cashless: pay_cashless,
                    debt: 0 - pay_cash - pay_cashless,
                    client_id: clientId,
                    firm: firm,
                    original_data_update: orderInfo[0][0].original_data_update ? orderInfo[0][0].original_data_update : new Date(),
                },
                {where: {id: ctx.params.id}}
            )

        } else if(ctx.user.role_id === 4) {
            const order = await Order.update(
                {
                    pay_cashless: pay_cashless,
                    product_name: product_name,
                    debt: 0 - orderInfo[0][0].pay_cash - pay_cashless,
                    original_data_update: orderInfo[0][0].original_data_update ? orderInfo[0][0].original_data_update : new Date(),
                },
                {where: {id: ctx.params.id}}
            )

        }


        const newOrder = await sequelize.query(
            `SELECT orders.id, orders.order_number, orders.note, orders.comment, orders.car_number,
                if(orders.pay_cashless = 0, orders.firm, "") as firm, DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
                orders.product_name, orders.opt_price, orders.price_cash, orders.price_cashless,
                orders.count, orders.sumseller, orders.delivery_cash, orders.delivery_cashless,
                orders.general_sum, orders.pay_cash, orders.pay_cashless, orders.delta_cashless,
                orders.delta_mas_cashless, orders.delta_cash, orders.delta_mas_cash, orders.original_data_update,
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

router.put('/api/order/account-number/:id', authMiddleware, async ctx => {
    const {account_number} = ctx.request.body

    try {
        if(ctx.user.role_id != 1 && ctx.user.role_id != 4 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

         await Order.update(
            {
                account_number
            },
            {where: {id: ctx.params.id}}
        )

        if(ctx.user.role_id === 1) {
            const newOrder = await sequelize.query(
                `SELECT orders.id, orders.account_number, orders.isSelfCar, orders.order_number, orders.note, orders.comment, orders.car_number, orders.firm,
                DATE_FORMAT(orders.data, '%d.%m.%Y') as data, DATE_FORMAT(orders.data_create, '%d.%m.%Y %H:%i') as data_create,
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

        if(ctx.user.role_id == 4 ) {
            const newOrder = await sequelize.query(
                `SELECT id, account_number, isSelfCar, order_number, orders.note, orders.comment, car_number, original_data_update,
                if(orders.pay_cashless = 0, orders.firm, "") as firm, DATE_FORMAT(data, '%d.%m.%Y') as data,
                product_name, opt_price, price_cash, delta_mas_cashless, price_cashless, count,
                delivery_cash, delivery_cashless, pay_cashless, region, general_sum, pay_cash
                FROM orders 
                where orders.id = ${ctx.params.id}`
            )

            return ctx.body = newOrder[0][0];
        }
    }
    catch(e) {
        return ctx.body = e
    }
})


router.get('/api/reconciliation/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id
    const start = ctx.query.start;
    const end = ctx.query.end;
    const product = ctx.query.product;
    const firm = ctx.query.firm;
    const cash = ctx.query.cash === 'true';
    const cashless = ctx.query.cashless === 'true';

    let [startDay, startMonth, startYear] = start.split(".");
    let [day, month, year] = end.split(".");

    const preparedDataStart = format(new Date(startYear, startMonth - 1, startDay), "yyyy-MM-dd");
    const preparedDataEnd = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        let queryCash = ''

        if(!cash && !cashless) {
            queryCash = 'orders.pay_cashless = 0 and orders.pay_cash = 0 and'
        } else if(!cash) {
            queryCash = "orders.pay_cash = 0 and orders.note NOT LIKE '%Ф1%' and"
        } else if(!cashless) {
            queryCash = "orders.pay_cashless = 0 and orders.note NOT LIKE '%Ф2%' and orders.note NOT LIKE '%Ф3%' and"
        }

        const productQuery = product ? `orders.product_name = '${product}' and` : ''
        const firmQuery = firm ? `orders.firm = '${firm}' and` : ''

            const orders = await sequelize.query(
                `SELECT orders.id, orders.data, orders.product_name, orders.general_sum, orders.car_number,
                 orders.pay_cash, orders.pay_cashless, orders.account_number, orders.count, orders.price_cash,
                 orders.sumseller, orders.delivery_cash
                 FROM orders
                 WHERE ${productQuery} ${firmQuery} ${queryCash} client_id = ${client_id} and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'
                 ORDER BY orders.id`
            )

        const debet = await sequelize.query(
            `SELECT sum(orders.general_sum) as amount
                 FROM orders
                 WHERE ${productQuery} ${firmQuery} ${queryCash} client_id = ${client_id} and orders.count != 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'`
        )

        let sum = ''

        if(cash) {
            sum = 'sum(orders.pay_cash)'
        }

        if(cashless) {
            sum = `${sum} + sum(orders.pay_cashless)`
        }

        let credet = 0

        if(sum) {
            credet = await sequelize.query(
                `SELECT (${sum}) as amount
                 FROM orders
                 WHERE ${productQuery} ${firmQuery} client_id = ${client_id} and product_name != 'Перевірка' and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'`
            )
        }

        let startSaldo = 0

        if(sum) {
            startSaldo = await sequelize.query(
                `SELECT (${sum}) as amount
                 FROM orders
                 WHERE ${productQuery} ${firmQuery} client_id = ${client_id} and product_name != 'Перевірка' and DATE(orders.data) < '${preparedDataStart}'`
            )
        }

        let startDebet = 0

        startDebet = await sequelize.query(
            `SELECT sum(orders.general_sum) as amount
                 FROM orders
                 WHERE ${productQuery} ${firmQuery} ${queryCash} client_id = ${client_id} and orders.count != 0 and DATE(orders.data) < '${preparedDataStart}'`
        )

        const mas = await sequelize.query(
            `SELECT SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) as amount
                 FROM orders
                 WHERE ${productQuery} ${firmQuery} ${queryCash} client_id = ${client_id} and orders.count != 0 and DATE(orders.data) BETWEEN '${preparedDataStart}' AND '${preparedDataEnd}'`
        )









            return ctx.body = {
                orders: orders[0],
                debet: debet[0][0].amount,
                credet: credet ? credet[0][0].amount : credet,
                startSaldo: startSaldo ? startDebet[0][0].amount - startSaldo[0][0].amount : 0,
                mas: mas[0][0].amount
            }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/statisticks', authMiddleware, async ctx => {
    const startData = "2021-01-01";
    const endData = format(new Date(), "yyyy-MM-dd");
    const region = ctx.query.region;
    const area = ctx.query.area;
    const product = ctx.query.product;
    const firm = ctx.query.firm;
    const town = ctx.query.town;
    const note = ctx.query.note;

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 5 || ctx.user.ban === 1) {
            return ctx.status = 400
        }

        const regionQuery = region ? `orders.region = '${region}' and` : ''
        const areaQuery = area ? `area = '${area}' and` : ''
        const productQuery = product ? `product_name = '${product}' and` : ''
        const firmQuery = firm ? `firm = '${firm}' and` : ''
        const townQuery = town ? `towns.id = ${town} and` : ''
        const noteQuery = note ? `note = '${note}' and` : ''

        let orders, totalByMonthInYear


        if(ctx.user.role_id === 1) {
            orders = await sequelize.query(
                `SELECT YEAR(orders.data) AS year, MONTH(orders.data) AS month, orders.region, SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold, towns.area
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${firmQuery} ${regionQuery} data >= '${startData}' AND data <= '${endData}'
             GROUP BY
                 YEAR(data),
                 MONTH(data),
                 region
             ORDER BY
             YEAR(data),
                 region,
                                            
                 MONTH(data)
                 `)

            totalByMonthInYear = regionQuery || areaQuery || townQuery ? '' : await sequelize.query(
                `SELECT YEAR(orders.data) AS year, MONTH(orders.data) AS month, SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${firmQuery} ${regionQuery} data >= '${startData}' AND data <= '${endData}'
             GROUP BY
                 YEAR(data),
                 MONTH(data)
             ORDER BY
                 YEAR(data),                                            
                 MONTH(data)
                 `)
        } else {
            orders = await sequelize.query(
             `SELECT YEAR(orders.data) AS year, MONTH(orders.data) AS month, orders.region,
              SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold, towns.area
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${firmQuery} ${regionQuery} data >= '${startData}' AND data <= '${endData}' and towns.manager_id = ${ctx.user.id}
             GROUP BY
                 YEAR(data),
                 MONTH(data),
                 region
             ORDER BY
             YEAR(data),
                 region,
                                            
                 MONTH(data)
                 `)

            totalByMonthInYear = regionQuery || areaQuery || townQuery ? '' : await sequelize.query(
                `SELECT YEAR(orders.data) AS year, MONTH(orders.data) AS month, orders.region,
              SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold, towns.area
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${firmQuery} ${regionQuery} data >= '${startData}' AND data <= '${endData}' and towns.manager_id = ${ctx.user.id}
             GROUP BY
                 YEAR(data),
                 MONTH(data),
             ORDER BY
             YEAR(data),                                            
                 MONTH(data)
                 `)
        }

        orders = orders[0].filter((item) => item.total_tons_sold)
        const result = [];
        let currentRegion = null;
        let currentYear = null;
        let data = [];

        for (const row of orders) {
            if (currentRegion === null) {
                currentRegion = row.region;
            }

            if (currentRegion !== row.region) {
                if(data.length !== 12) {
                    let newData = []

                    for (let i = 1; i <= 12; i++) {
                        const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                        if (monthData) {
                            newData.push(monthData);
                        } else {
                            newData.push({
                                "month": i,
                                "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                            });
                        }
                    }

                    data = [...newData]
                }

                result.push({ region: currentRegion, year: currentYear, data });
                currentRegion = row.region;
                currentYear = null;
                data = [];
            }

            if (currentYear === null) {
                currentYear = row.year;
            }

            if (currentYear !== row.year) {
                if(data.length !== 12) {
                    let newData = []

                    for (let i = 1; i <= 12; i++) {
                        const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                        if (monthData) {
                            newData.push(monthData);
                        } else {
                            newData.push({
                                "month": i,
                                "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                            });
                        }
                    }

                    data = [...newData]
                }

                result.push({ region: currentRegion, year: currentYear, data });
                currentYear = row.year;
                data = [];
            }

            data.push({ month: row.month, total_tons_sold: row.total_tons_sold });
        }

        if (data.length > 0) {
            if(data.length !== 12) {
                let newData = []

                for (let i = 1; i <= 12; i++) {
                    const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                    if (monthData) {
                        newData.push(monthData);
                    } else {
                        newData.push({
                            "month": i,
                            "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                        });
                    }
                }

                data = [...newData]
            }

            result.push({ region: currentRegion, year: currentYear, data });
        }

        let totalByMonthInYearResult = {}

        if(totalByMonthInYear) {
            totalByMonthInYear[0].forEach((item) => {
                if(totalByMonthInYearResult[item.year]) {
                    totalByMonthInYearResult[item.year].data.push({month: item.month, total_tons_sold: item.total_tons_sold })
                } else {
                    totalByMonthInYearResult[item.year] = {
                        data: [{month: item.month, total_tons_sold: item.total_tons_sold}],
                        region: 'Ітого за',
                        year: item.year,
                        isYearTotal: true
                    }
                }
            })

            for(let key in totalByMonthInYearResult) {
                if(totalByMonthInYearResult[key].data.length !== 12) {
                    const data = totalByMonthInYearResult[key].data
                    let newData = []

                    for (let i = 1; i <= 12; i++) {
                        const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                        if (monthData) {
                            newData.push(monthData);
                        } else {
                            newData.push({
                                "month": i,
                                "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                            });
                        }
                    }

                    totalByMonthInYearResult[key].data = [...newData]
                }
            }

            let resultYear = ''
            let newResult = []

            let addedCount = 0

            result.forEach((item, index) => {
                newResult.push(item)

                if(!resultYear) {
                    resultYear = item.year
                }

                if(resultYear !== item.year) {
                    newResult.splice(index + addedCount, 0, totalByMonthInYearResult[resultYear])

                    resultYear = ''
                    addedCount += 1;
                } else if(index + 1 === result.length) {
                    newResult.splice(newResult.length, 0, totalByMonthInYearResult[resultYear])
                }
            })

            return ctx.body = {
                orders: newResult,
            }
        } else {
            return ctx.body = {
                orders: result,
            }
        }


    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/statisticks/:client_id', authMiddleware, async ctx => {
    const startData = "2021-01-01";
    const endData = format(new Date(), "yyyy-MM-dd");
    const client_id = ctx.params.client_id
    const product = ctx.query.product;
    const note = ctx.query.note;

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 5 || ctx.user.ban === 1) {
            return ctx.status = 400
        }

        if(ctx.user.role_id === 5) {
            const [town] = await sequelize.query(`
                SELECT towns.manager_id
                FROM clients
                JOIN towns ON towns.id = clients.town_id
                WHERE clients.id = ${client_id}
            `)

            if(town[0].manager_id !== ctx.user.id) {
                return  ctx.status = 400
            }
        }

        const productQuery = product ? `product_name = '${product}' and` : ''
        const noteQuery = note ? `note = '${note}' and` : ''



        let orders = await sequelize.query(
            `SELECT YEAR(orders.data) AS year, MONTH(orders.data) AS month, SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold
             FROM orders
             WHERE ${noteQuery} ${productQuery} data >= '${startData}' AND data <= '${endData}' and orders.client_id = ${client_id}
             GROUP BY
                 YEAR(data),
                 MONTH(data)
             ORDER BY
             YEAR(data),
                                            
                 MONTH(data)
                 `)


        const result = [];
        let currentYear = null;
        let data = [];

        for (const row of orders[0]) {
            if (currentYear === null) {
                currentYear = row.year;
            }

            if (currentYear !== row.year) {
                if(data.length !== 12) {
                    let newData = []

                    for (let i = 1; i <= 12; i++) {
                        const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                        if (monthData) {
                            newData.push(monthData);
                        } else {
                            newData.push({
                                "month": i,
                                "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                            });
                        }
                    }

                    data = [...newData]
                }

                result.push({ year: currentYear, data });
                currentYear = row.year;
                data = [];
            }

            data.push({ month: row.month, total_tons_sold: row.total_tons_sold });
        }

        if (data.length > 0) {
            if(data.length !== 12) {
                let newData = []

                for (let i = 1; i <= 12; i++) {
                    const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                    if (monthData) {
                        newData.push(monthData);
                    } else {
                        newData.push({
                            "month": i,
                            "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                        });
                    }
                }

                data = [...newData]
            }

            result.push({ year: currentYear, data });
        }

        return ctx.body = {
            orders: result,
        }
    } catch (e) {
        ctx.body = e
    }
})

router.get('/api/statisticks/town/:town_id', authMiddleware, async ctx => {
    const startData = "2021-01-01";
    const endData = format(new Date(), "yyyy-MM-dd");
    const townId = ctx.params.town_id
    const startMonth = ctx.query.startMonth;
    const endMonth = ctx.query.endMonth;

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 5 || ctx.user.ban === 1) {
            return ctx.status = 400
        }

        if(ctx.user.role_id === 5) {
            const [town] = await sequelize.query(`
                SELECT manager_id
                FROM towns
                WHERE id = ${townId}
            `)

            if(town[0].manager_id !== ctx.user.id) {
                return  ctx.status = 400
            }
        }

        const startQuery = startMonth ? `MONTH(orders.data) >= '${startMonth}' and` : ''
        const endQuery = endMonth ? `MONTH(orders.data) <= '${endMonth}' and` : ''



        let [clients] = await sequelize.query(
            `SELECT id, name
             FROM clients
             WHERE clients.town_id = ${townId}`)


        let [orders] = await sequelize.query(
            `SELECT YEAR(orders.data) AS year, SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold, clients.id as clientId
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${startQuery} ${endQuery} data >= '${startData}' AND data <= '${endData}' and towns.id = ${townId}
             GROUP BY
                 YEAR(data),
                 clients.id
             ORDER BY
             YEAR(data)`)

        let uniqueYears = []

        orders.forEach((item) => {
            if(!uniqueYears.includes(item.year)) {
                uniqueYears.push(item.year)
            }
        })


        let data = []

        clients.forEach((item) => {
            let prepareData = {clientId: item.id, name: item.name, data: []}

            uniqueYears.forEach((year) => {
                const count = orders.find((order) => order.clientId === item.id && order.year === year)

                if(count) {
                    prepareData.data.push(count.total_tons_sold)
                } else {
                    prepareData.data.push(0)
                }
            })

            data.push(prepareData)
            prepareData = {}
        })


        return ctx.body = {
            orders: data,
            years: uniqueYears
        }
    } catch (e) {
        ctx.body = e
    }
})


router.get('/api/manager-statisticks/:manager_id', authMiddleware, async ctx => {
    const startData = "2021-01-01";
    const endData = format(new Date(), "yyyy-MM-dd");
    const managerId = ctx.params.manager_id;
    const region = ctx.query.region;
    const area = ctx.query.area;
    const product = ctx.query.product;
    const town = ctx.query.town;
    const note = ctx.query.note;
    const mainManager = ctx.query.mainManager === 'true';

    try {
        if(ctx.user.role_id !== 1 || ctx.user.ban === 1) {
            return ctx.status = 400
        }

        const regionQuery = region ? `orders.region = '${region}' and` : ''
        const areaQuery = area ? `area = '${area}' and` : ''
        const productQuery = product ? `product_name = '${product}' and` : ''
        const townQuery = town ? `towns.id = ${town} and` : ''
        const noteQuery = note ? `note = '${note}' and` : ''
        const queryManager = mainManager ? `towns.manager_id = ${managerId}` : `(towns.manager_id = ${managerId} or towns.safemanager_id = ${managerId} or towns.securitymanager_id = ${managerId} or towns.second_security_manager_id = ${managerId} or towns.third_security_manager_id = ${managerId} or towns.fourth_security_manager_id = ${managerId} or towns.fiveth_security_manager_id = ${managerId})`

        let orders = await sequelize.query(
                `SELECT YEAR(orders.data) AS year, MONTH(orders.data) AS month, orders.region, SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold, towns.area
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${regionQuery} data >= '${startData}' AND data <= '${endData}' and ${queryManager}
             GROUP BY
                 YEAR(data),
                 MONTH(data),
                 region
             ORDER BY
             YEAR(data),
                 region,
                                            
                 MONTH(data)
                 `)

        let statInfo = await sequelize.query(
            `SELECT SUM(CASE WHEN orders.count >= 0 THEN orders.count ELSE 0 END) AS total_tons_sold, sum(orders.pay_cash) as pay_cash, sum(orders.pay_cashless) as pay_cashless, sum(orders.general_sum) as general_sum
             FROM orders
             LEFT JOIN clients ON orders.client_id = clients.id 
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${regionQuery} data >= '${startData}' AND data <= '${endData}' and orders.product_name != 'Перевірка' and ${queryManager}
             `)

        const debtorsCount =  await sequelize.query(
            `SELECT count(clients.id) as debtors
             FROM clients
             JOIN towns ON clients.town_id = towns.id
             WHERE ${townQuery} ${noteQuery} ${areaQuery} ${productQuery} ${regionQuery} ${queryManager}
             `)

        const managerMoney = await sequelize.query(
            `SELECT sum(orders.pay_cash) as pay_cash_manager
             FROM orders
             WHERE creater = ${managerId} and orders.product_name != 'Перевірка'
             `)




        orders = orders[0].filter((item) => item.total_tons_sold)
        const result = [];
        let currentRegion = null;
        let currentYear = null;
        let data = [];

        for (const row of orders) {
            if (currentRegion === null) {
                currentRegion = row.region;
            }

            if (currentRegion !== row.region) {
                if(data.length !== 12) {
                    let newData = []

                    for (let i = 1; i <= 12; i++) {
                        const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                        if (monthData) {
                            newData.push(monthData);
                        } else {
                            newData.push({
                                "month": i,
                                "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                            });
                        }
                    }

                    data = [...newData]
                }

                result.push({ region: currentRegion, year: currentYear, data });
                currentRegion = row.region;
                currentYear = null;
                data = [];
            }

            if (currentYear === null) {
                currentYear = row.year;
            }

            if (currentYear !== row.year) {
                if(data.length !== 12) {
                    let newData = []

                    for (let i = 1; i <= 12; i++) {
                        const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                        if (monthData) {
                            newData.push(monthData);
                        } else {
                            newData.push({
                                "month": i,
                                "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                            });
                        }
                    }

                    data = [...newData]
                }

                result.push({ region: currentRegion, year: currentYear, data });
                currentYear = row.year;
                data = [];
            }

            data.push({ month: row.month, total_tons_sold: row.total_tons_sold });
        }

        if (data.length > 0) {
            if(data.length !== 12) {
                let newData = []

                for (let i = 1; i <= 12; i++) {
                    const monthData = data.find(item => item.month === i); // Шукаємо об'єкт для поточного місяця

                    if (monthData) {
                        newData.push(monthData);
                    } else {
                        newData.push({
                            "month": i,
                            "total_tons_sold": 0 // Якщо даних для місяця немає, встановлюємо продажі в 0
                        });
                    }
                }

                data = [...newData]
            }

            result.push({ region: currentRegion, year: currentYear, data });
        }

        return ctx.body = {
            orders: result,
            stat: {
                ...statInfo[0][0],
                ...debtorsCount[0][0],
                ...managerMoney[0][0]
            }
        }
    } catch (e) {
        ctx.body = e
    }
})



module.exports = router