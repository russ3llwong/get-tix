import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@get-tix/common";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'fakeData',
        price: 10
    });
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'updatedData',
        price: 20,
        userId: 'whatever',
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg };
};

it('finds, updates, and saves a ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if version number does not meet requirements', async () => {
    const { listener, ticket, data, msg } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();
});