import { Subjects, Publisher, ExpirationCompleteEvent } from '@get-tix/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}