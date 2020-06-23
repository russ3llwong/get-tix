import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@get-tix/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided.')
], 
validateRequest, 
async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find ticket that user is trying to purchase/order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    // make sure ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved');
    }

    // calculate an expiration date for order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
    // build the order and save it to db
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });
    await order.save();

    // publish an event that order is created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        version: order.version,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    });
    
    res.status(201).send(order);
})

export { router as newOrderRouter };  