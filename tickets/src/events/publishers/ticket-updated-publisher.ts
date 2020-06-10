import { Publisher, Subjects, TicketUpdatedEvent } from '@get-tix/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;

}