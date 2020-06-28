// fake NATS client
// imitate the behavior of a NATS client used in the publishers
export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation(
            (subject: string, data:string, callback: () => void ) => {
                callback();
        }),
    }
};