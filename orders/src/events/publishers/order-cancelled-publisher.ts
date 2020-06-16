import { Publisher, OrderCancelledEvent, Subjects } from '@get-tix/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}