import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signup(id?: string): string[];
        }
    }
}

jest.mock('../nats-wrapper'); // fake NATS client for tests

process.env.STRIPE_KEY = 'sk_test_cz9ButVjoCVOb4hkLTAs0ynd00DemjQwz5';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "test-key";

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
       useNewUrlParser: true,
       useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})

global.signup = (id?: string) => {
    // Build a JWT payload { id, email }
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn session into JSON
    const sessionJSON = JSON.stringify(session);

    // Encode JSON as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string cookie
    return [`express:sess=${base64}`];
};