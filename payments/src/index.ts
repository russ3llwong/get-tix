import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { app } from './app';
import { OrderCanceledListener } from './events/listeners/order-canceled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {

    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY env var must be defined.')
    }
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI env var must be defined.')
    }
    if (!process.env.NATS_CLIENT_ID) {
      throw new Error('NATS_CLIENT_ID env var must be defined.')
    }
    if (!process.env.NATS_URL) {
      throw new Error('NATS_URL env var must be defined.')
    }
    if (!process.env.NATS_CLUSTER_ID) {
      throw new Error('NATS_CLUSTER_ID env var must be defined.')
    }


    try {
      await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.NATS_URL
      );
      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed!');
        process.exit();
      });
      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());

      new OrderCanceledListener(natsWrapper.client).listen();
      new OrderCreatedListener(natsWrapper.client).listen();

      await mongoose.connect(process.env.MONGO_URI , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      });
      console.log('Connected to MongoDb');
    } catch (err) {
      console.error(err);
    }
  
    app.listen(3000, () => {
      console.log('Listening on port 3000!!!');
    });
};

start();