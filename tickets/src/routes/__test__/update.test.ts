import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'kjefnkf',
            price: 30
        })
        .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'kjefnkf',
            price: 30
        })
        .expect(401);
});

it('returns 401 if user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'ti4njkr',
            price: 30
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'updated',
            price: 100
        })
        .expect(401);
});

it('returns 401 if user provides an invalid title or price', async () => {
    const cookie = global.signup()
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'ti4njkr',
            price: 30
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 30
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid',
            price: -30
        })
        .expect(400);
});

it('returns 200 if ticket is updated successfully', async () => {
    const cookie = global.signup()
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'ti4njkr',
            price: 30
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New title',
            price: 40
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('New title')
    expect(ticketResponse.body.price).toEqual(40)
});

it('publishes an event', async () => {
    const cookie = global.signup()
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'ti4njkr',
            price: 30
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New title',
            price: 40
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})