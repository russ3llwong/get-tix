import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@get-tix/common';

it('returns a 404 when order does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'r2nfke9',
            orderId: mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('returns a 401 when order does not belong to request user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });
    await order.save();
    
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'r2nfke9',
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400 when order has been canceled prior', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
        token: 'r2nfke9',
        orderId: order.id,
    })
    .expect(400);
});
