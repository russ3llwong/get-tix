import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches an order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        title: 'random',
        price: 10
    });
    await ticket.save();

    const user = global.signup();

    // Build an Order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make request to fetch order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if user fetches other users\' order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        title: 'random',
        price: 10
    });
    await ticket.save();

    const user = global.signup();

    // Build an Order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make request to fetch order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signup())
        .send()
        .expect(401);
});