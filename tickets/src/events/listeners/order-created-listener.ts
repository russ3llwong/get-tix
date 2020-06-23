import { Listener, OrderCreatedEvent, Subjects } from '@get-tix/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // find ticket that order is trying to reserve
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // mark ticket as reserved
        ticket.set({ orderId: data.id });

        // save ticket and ack the message
        await ticket.save();
        msg.ack();
    }

};