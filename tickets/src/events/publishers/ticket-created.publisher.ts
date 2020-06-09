import { Publisher, Subjects, TicketCreatedEvent } from '@get-tix/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;

}