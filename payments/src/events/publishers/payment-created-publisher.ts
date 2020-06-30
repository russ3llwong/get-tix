import { Subjects, Publisher, PaymentCreatedEvent } from '@get-tix/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    
}