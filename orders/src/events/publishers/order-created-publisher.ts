import { Publisher, OrderCreatedEvent, Subjects } from '@get-tix/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}