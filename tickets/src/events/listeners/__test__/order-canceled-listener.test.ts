import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent } from "@get-tix/common";
import { OrderCanceledListener } from '../order-canceled-listener';

const setup = async () => {
    const listener = new OrderCanceledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'random',
        price: 10,
        userId: 'randomuser',
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, orderId, data, msg };
};

it('updates the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});