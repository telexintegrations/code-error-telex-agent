import * as zmq from 'zeromq';

export async function initializeZeroMqClient() {
    const requestSocket = new zmq.Request();
    const subscribeSocket = new zmq.Subscriber();

    try {
        await requestSocket.connect('tcp://127.0.0.1:3030');
        await subscribeSocket.connect('tcp://127.0.0.1:3031');
        await subscribeSocket.subscribe('update');
        console.log('Connected to ZeroMQ server (Request and Subscribe)');

        void (async () => {
            for await (const [topic, msg] of subscribeSocket) {
                console.log('Received published message:', msg.toString());
            }
        })();

        return requestSocket;
    } catch (error) {
        console.error('ZeroMQ client connection error:', error);
        throw error;
    }
}

export async function sendZeroMqMessage(
    sock: zmq.Request,
    message: string
) {
    try {
        await sock.send(message);
        console.log('Sent message:', message);
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}