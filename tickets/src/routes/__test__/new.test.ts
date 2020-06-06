import request from 'supertest';
import { app } from '../../app';

it('has a router handler for /api/tickets for post request', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is signed in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns not 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({})
    
    expect(response.status).not.toEqual(401);
});

it('returns an error if invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            price: 10
        })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Linkin Park',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Metallica',
        })
        .expect(400);
});

it('creates a ticket with valid inputs', async () => {

    // TODO: add check to make sure ticket is saved
    
    await request(app)
        .post('/api/tikets')
        .send({
            title: 'Maroon 5',
            price: 80
        })
        .expect(201);
});